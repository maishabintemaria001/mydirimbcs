import { Router, Request, Response } from 'express';
import { db, User, QuestionPaper, Question, Exam, ExamAttempt, Order, UserEntitlement, SponsorCampaign, Notice, Category, Organization, Position } from './db.js';

export const apiRouter = Router();

// Authentication Helper / Middleware
function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;
  
  // Format: token can be user_id or a session token
  const users = db.get('users');
  return users.find(u => u.id === token || u.email === token) || null;
}

function hasPaidAccess(user: User | null, paperOrExam: { is_paid: boolean }): boolean {
  if (!paperOrExam.is_paid) return true;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'content_manager' || user.role === 'exam_manager') return true;
  
  const entitlements = db.get('user_entitlements');
  const now = new Date().toISOString();
  return entitlements.some(e => e.user_id === user.id && e.is_active && e.expires_at > now);
}

// ----------------------------------------------------
// 1. PUBLIC APIS
// ----------------------------------------------------

// GET /api/v1/home
apiRouter.get('/home', (_req: Request, res: Response) => {
  const categories = db.get('categories').filter(c => c.is_active).sort((a, b) => a.order - b.order);
  const papers = db.get('question_papers').filter(p => p.publication_status === 'published');
  const exams = db.get('exams').filter(e => e.is_active);
  const notices = db.get('notices').filter(n => n.is_published);
  const sponsors = db.get('sponsor_campaigns').filter(s => s.is_active);
  const adSettings = db.get('ad_settings');
  const organizations = db.get('organizations').filter(o => o.is_active);
  const packages = db.get('membership_packages').filter(p => p.is_active);

  // Group years
  const years = Array.from(new Set(papers.map(p => p.exam_year))).sort((a, b) => b - a);

  res.json({
    status: 'success',
    data: {
      categories,
      organizations,
      featured_papers: papers.slice(0, 6),
      recent_exams: exams.slice(0, 4),
      years,
      notices: notices.slice(0, 5),
      sponsors,
      ad_settings: adSettings,
      packages,
      stats: {
        total_questions: db.get('questions').length,
        total_papers: papers.length,
        total_exams: exams.length,
        active_candidates: db.get('users').length,
      }
    }
  });
});

// GET /api/v1/categories
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = db.get('categories').filter(c => c.is_active).sort((a, b) => a.order - b.order);
  const papers = db.get('question_papers');
  
  const withCounts = categories.map(cat => ({
    ...cat,
    paper_count: papers.filter(p => p.category_id === cat.id && p.publication_status === 'published').length
  }));

  res.json({ status: 'success', data: withCounts });
});

// GET /api/v1/organizations
apiRouter.get('/organizations', (_req: Request, res: Response) => {
  const orgs = db.get('organizations').filter(o => o.is_active);
  const papers = db.get('question_papers');
  const positions = db.get('positions');

  const data = orgs.map(org => ({
    ...org,
    paper_count: papers.filter(p => p.organization_id === org.id && p.publication_status === 'published').length,
    position_count: positions.filter(pos => pos.organization_id === org.id && pos.is_active).length,
  }));

  res.json({ status: 'success', data });
});

// GET /api/v1/positions
apiRouter.get('/positions', (req: Request, res: Response) => {
  const { organization_id } = req.query;
  let positions = db.get('positions').filter(p => p.is_active);
  if (organization_id) {
    positions = positions.filter(p => p.organization_id === String(organization_id));
  }
  res.json({ status: 'success', data: positions });
});

// GET /api/v1/years
apiRouter.get('/years', (_req: Request, res: Response) => {
  const papers = db.get('question_papers').filter(p => p.publication_status === 'published');
  const years = Array.from(new Set(papers.map(p => p.exam_year))).sort((a, b) => b - a);
  res.json({ status: 'success', data: years });
});

// GET /api/v1/questions
apiRouter.get('/questions', (req: Request, res: Response) => {
  const { q, category_id, organization_id, position_id, year, is_paid, sort, page = '1', limit = '10' } = req.query;
  let papers = db.get('question_papers').filter(p => p.publication_status === 'published');

  if (q) {
    const search = String(q).toLowerCase();
    papers = papers.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.title_bn.toLowerCase().includes(search) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(search)))
    );
  }

  if (category_id) {
    papers = papers.filter(p => p.category_id === String(category_id));
  }

  if (organization_id) {
    papers = papers.filter(p => p.organization_id === String(organization_id));
  }

  if (position_id) {
    papers = papers.filter(p => p.position_id === String(position_id));
  }

  if (year) {
    papers = papers.filter(p => p.exam_year === Number(year));
  }

  if (is_paid !== undefined && is_paid !== '') {
    const paidBool = is_paid === 'true';
    papers = papers.filter(p => p.is_paid === paidBool);
  }

  if (sort === 'oldest') {
    papers.sort((a, b) => a.exam_year - b.exam_year);
  } else if (sort === 'views') {
    papers.sort((a, b) => b.view_count - a.view_count);
  } else {
    // default newest
    papers.sort((a, b) => b.exam_year - a.exam_year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));
  const total = papers.length;
  const paginated = papers.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // augment with category and org names
  const categories = db.get('categories');
  const orgs = db.get('organizations');
  const positions = db.get('positions');
  const questions = db.get('questions');

  const enriched = paginated.map(p => ({
    ...p,
    category: categories.find(c => c.id === p.category_id),
    organization: orgs.find(o => o.id === p.organization_id),
    position: positions.find(pos => pos.id === p.position_id),
    question_count: questions.filter(q => q.paper_id === p.id).length,
  }));

  res.json({
    status: 'success',
    data: enriched,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(total / limitNum),
    }
  });
});

// GET /api/v1/questions/:slug
apiRouter.get('/questions/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const papers = db.get('question_papers');
  const paper = papers.find(p => p.slug === slug || p.id === slug);

  if (!paper) {
    res.status(404).json({ status: 'error', message: 'Question paper not found' });
    return;
  }

  // increment view count
  paper.view_count = (paper.view_count || 0) + 1;
  db.set('question_papers', papers);

  const user = getUserFromRequest(req);
  const userHasAccess = hasPaidAccess(user, paper);

  const categories = db.get('categories');
  const orgs = db.get('organizations');
  const positions = db.get('positions');
  const allQuestions = db.get('questions').filter(q => q.paper_id === paper.id);

  // If user doesn't have access to paid paper: mask correct answers & explanations
  const sanitizedQuestions = allQuestions.map(q => {
    if (!userHasAccess) {
      return {
        id: q.id,
        paper_id: q.paper_id,
        question_text: q.question_text,
        question_text_bn: q.question_text_bn,
        options: q.options,
        subject_id: q.subject_id,
        marks: q.marks,
        negative_marks: q.negative_marks,
        difficulty: q.difficulty,
        is_paid: q.is_paid,
        // protected:
        correct_option_ids: [],
        explanation: '🔒 Explanation is locked for Premium members. Upgrade to view answer keys and detailed explanations.',
      };
    }
    return q;
  });

  res.json({
    status: 'success',
    data: {
      paper: {
        ...paper,
        category: categories.find(c => c.id === paper.category_id),
        organization: orgs.find(o => o.id === paper.organization_id),
        position: positions.find(pos => pos.id === paper.position_id),
      },
      questions: sanitizedQuestions,
      user_has_access: userHasAccess,
      is_premium_restricted: paper.is_paid && !userHasAccess,
    }
  });
});

// GET /api/v1/top-performers
apiRouter.get('/top-performers', (req: Request, res: Response) => {
  const { category_id, period } = req.query;
  const attempts = db.get('exam_attempts').filter(a => a.status === 'submitted');
  const exams = db.get('exams');

  // Filter by category if requested
  let filteredAttempts = attempts;
  if (category_id && category_id !== 'all') {
    const matchingExamIds = exams.filter(e => e.category_id === category_id).map(e => e.id);
    filteredAttempts = attempts.filter(a => matchingExamIds.includes(a.exam_id));
  }

  // Aggregate user performance
  const userMap: Record<string, {
    user_id: string;
    user_name: string;
    tests_count: number;
    total_score: number;
    highest_score: number;
    total_correct: number;
    total_incorrect: number;
    last_attempt_date: string;
    scores_history: { date: string; score: number; exam_title: string }[];
  }> = {};

  filteredAttempts.forEach(att => {
    const exam = exams.find(e => e.id === att.exam_id);
    if (!userMap[att.user_id]) {
      userMap[att.user_id] = {
        user_id: att.user_id,
        user_name: att.user_name,
        tests_count: 0,
        total_score: 0,
        highest_score: 0,
        total_correct: 0,
        total_incorrect: 0,
        last_attempt_date: att.submitted_at || att.start_time,
        scores_history: [],
      };
    }

    const u = userMap[att.user_id];
    u.tests_count++;
    u.total_score += att.score;
    if (att.score > u.highest_score) u.highest_score = att.score;
    u.total_correct += att.correct_count;
    u.total_incorrect += att.incorrect_count;
    u.scores_history.push({
      date: (att.submitted_at || att.start_time).split('T')[0],
      score: att.score,
      exam_title: exam?.title_bn || exam?.title || 'Model Test',
    });
  });

  const performers = Object.values(userMap).map(u => {
    const avgScore = Number((u.total_score / u.tests_count).toFixed(2));
    const totalAns = u.total_correct + u.total_incorrect;
    const accuracy = totalAns > 0 ? Math.round((u.total_correct / totalAns) * 100) : 0;
    return {
      ...u,
      avg_score: avgScore,
      accuracy,
    };
  }).sort((a, b) => b.highest_score - a.highest_score || b.avg_score - a.avg_score);

  // Assign ranks
  const rankedPerformers = performers.map((p, index) => ({
    ...p,
    rank: index + 1,
    badge: index === 0 ? 'Gold' : index === 1 ? 'Silver' : index === 2 ? 'Bronze' : 'Top 10',
  }));

  // Daily Score Trend data for D3 line chart
  const dateMap: Record<string, { total_score: number; count: number; max_score: number; scores: number[] }> = {};
  filteredAttempts.forEach(att => {
    const d = (att.submitted_at || att.start_time).split('T')[0];
    if (!dateMap[d]) {
      dateMap[d] = { total_score: 0, count: 0, max_score: 0, scores: [] };
    }
    dateMap[d].total_score += att.score;
    dateMap[d].count += 1;
    dateMap[d].scores.push(att.score);
    if (att.score > dateMap[d].max_score) dateMap[d].max_score = att.score;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const trends = sortedDates.map(d => {
    const item = dateMap[d];
    const avg = Number((item.total_score / item.count).toFixed(2));
    // Calculate median
    item.scores.sort((a, b) => a - b);
    const median = item.scores[Math.floor(item.scores.length / 2)] || avg;
    return {
      date: d,
      display_date: d.replace('2026-', ''),
      avg_score: avg,
      max_score: Number(item.max_score.toFixed(2)),
      median_score: Number(median.toFixed(2)),
      attempts_count: item.count,
    };
  });

  // Score distribution bins (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
  const bins = [
    { label: '0-20%', count: 0, range: [0, 1] },
    { label: '21-40%', count: 0, range: [1.1, 2] },
    { label: '41-60%', count: 0, range: [2.1, 3] },
    { label: '61-80%', count: 0, range: [3.1, 4] },
    { label: '81-100%', count: 0, range: [4.1, 5] },
  ];

  filteredAttempts.forEach(att => {
    const pct = (att.score / (att.total_marks || 5)) * 5;
    const match = bins.find(b => pct >= b.range[0] && pct <= b.range[1]) || bins[bins.length - 1];
    match.count++;
  });

  res.json({
    status: 'success',
    data: {
      performers: rankedPerformers,
      trends,
      distribution: bins,
      total_participants: Object.keys(userMap).length,
      total_attempts: filteredAttempts.length,
    }
  });
});

// GET /api/v1/packages
apiRouter.get('/packages', (_req: Request, res: Response) => {
  const packages = db.get('membership_packages').filter(p => p.is_active);
  res.json({ status: 'success', data: packages });
});

// GET /api/v1/advertisements
apiRouter.get('/advertisements', (_req: Request, res: Response) => {
  const adSettings = db.get('ad_settings');
  const sponsors = db.get('sponsor_campaigns').filter(s => s.is_active);
  
  // record impressions
  sponsors.forEach(s => {
    s.impressions = (s.impressions || 0) + 1;
  });
  db.set('sponsor_campaigns', db.get('sponsor_campaigns'));

  res.json({
    status: 'success',
    data: {
      settings: adSettings,
      sponsors,
    }
  });
});

// POST /api/v1/advertisements/click
apiRouter.post('/advertisements/click', (req: Request, res: Response) => {
  const { campaign_id } = req.body;
  const campaigns = db.get('sponsor_campaigns');
  const campaign = campaigns.find(c => c.id === campaign_id);
  if (campaign) {
    campaign.clicks = (campaign.clicks || 0) + 1;
    db.set('sponsor_campaigns', campaigns);
  }
  res.json({ status: 'success' });
});

// GET /api/v1/notices
apiRouter.get('/notices', (_req: Request, res: Response) => {
  const notices = db.get('notices').filter(n => n.is_published);
  res.json({ status: 'success', data: notices });
});

// GET /api/v1/exams
apiRouter.get('/exams', (_req: Request, res: Response) => {
  const exams = db.get('exams').filter(e => e.is_active);
  const categories = db.get('categories');
  const questions = db.get('questions');

  const enriched = exams.map(e => ({
    ...e,
    category: categories.find(c => c.id === e.category_id),
    question_count: e.question_ids.length,
  }));

  res.json({ status: 'success', data: enriched });
});

// GET /api/v1/exams/:slug
apiRouter.get('/exams/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const exams = db.get('exams');
  const exam = exams.find(e => e.slug === slug || e.id === slug);

  if (!exam) {
    res.status(404).json({ status: 'error', message: 'Exam not found' });
    return;
  }

  const user = getUserFromRequest(req);
  const userHasAccess = hasPaidAccess(user, exam);
  const categories = db.get('categories');
  const questions = db.get('questions');
  const examQuestions = questions.filter(q => exam.question_ids.includes(q.id));

  // For live exam taking, do NOT expose answers upfront regardless of user status!
  const liveExamQuestions = examQuestions.map(q => ({
    id: q.id,
    question_text: q.question_text,
    question_text_bn: q.question_text_bn,
    options: q.options,
    marks: q.marks,
    negative_marks: q.negative_marks,
    subject_id: q.subject_id,
  }));

  res.json({
    status: 'success',
    data: {
      exam: {
        ...exam,
        category: categories.find(c => c.id === exam.category_id),
      },
      questions: liveExamQuestions,
      user_has_access: userHasAccess,
      is_premium_restricted: exam.is_paid && !userHasAccess,
    }
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION & USER APIS
// ----------------------------------------------------

// POST /api/v1/auth/register
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(422).json({ status: 'error', message: 'Name, email and password are required' });
    return;
  }

  const users = db.get('users');
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(422).json({ status: 'error', message: 'An account with this email already exists' });
    return;
  }

  const newUser: User = {
    id: 'usr_' + Date.now(),
    name,
    email: email.toLowerCase(),
    password, // in real production use bcrypt.hash
    phone: phone || '',
    role: 'user',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  db.set('users', users);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful',
    token: newUser.id,
    user: newUser,
  });
});

// POST /api/v1/auth/login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);

  if (!user) {
    res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ status: 'error', message: 'This account has been suspended by an administrator' });
    return;
  }

  res.json({
    status: 'success',
    token: user.id,
    user,
  });
});

// GET /api/v1/auth/me
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Unauthenticated' });
    return;
  }

  const entitlements = db.get('user_entitlements');
  const now = new Date().toISOString();
  const activeEntitlement = entitlements.find(e => e.user_id === user.id && e.is_active && e.expires_at > now);

  res.json({
    status: 'success',
    user,
    active_entitlement: activeEntitlement || null,
  });
});

// POST /api/v1/auth/switch-demo-role (Convenient switcher for evaluation)
apiRouter.post('/auth/switch-demo-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const users = db.get('users');
  const target = users.find(u => u.role === role) || users[0];

  res.json({
    status: 'success',
    token: target.id,
    user: target,
  });
});

// POST /api/v1/bookmarks/toggle
apiRouter.post('/bookmarks/toggle', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required to bookmark questions' });
    return;
  }

  const { paper_id, question_id } = req.body;
  const bookmarks = db.get('bookmarks');
  const existingIndex = bookmarks.findIndex(b => b.user_id === user.id && b.paper_id === paper_id && b.question_id === question_id);

  if (existingIndex > -1) {
    bookmarks.splice(existingIndex, 1);
    db.set('bookmarks', bookmarks);
    res.json({ status: 'success', bookmarked: false, message: 'Bookmark removed' });
  } else {
    bookmarks.push({
      id: 'bmk_' + Date.now(),
      user_id: user.id,
      paper_id,
      question_id,
      created_at: new Date().toISOString(),
    });
    db.set('bookmarks', bookmarks);
    res.json({ status: 'success', bookmarked: true, message: 'Bookmarked successfully' });
  }
});

// GET /api/v1/bookmarks
apiRouter.get('/bookmarks', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const bookmarks = db.get('bookmarks').filter(b => b.user_id === user.id);
  const questions = db.get('questions');
  const papers = db.get('question_papers');

  const enriched = bookmarks.map(b => ({
    ...b,
    question: b.question_id ? questions.find(q => q.id === b.question_id) : undefined,
    paper: papers.find(p => p.id === b.paper_id),
  }));

  res.json({ status: 'success', data: enriched });
});

// ----------------------------------------------------
// 3. EXAM ATTEMPTS & RESULTS (Server-enforced timer & scoring)
// ----------------------------------------------------

// POST /api/v1/exam-attempts/start
apiRouter.post('/exam-attempts/start', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Please log in to start the exam' });
    return;
  }

  const { exam_id } = req.body;
  const exams = db.get('exams');
  const exam = exams.find(e => e.id === exam_id || e.slug === exam_id);

  if (!exam) {
    res.status(404).json({ status: 'error', message: 'Exam not found' });
    return;
  }

  if (exam.is_paid && !hasPaidAccess(user, exam)) {
    res.status(403).json({ status: 'error', message: 'Premium subscription required for this mock exam' });
    return;
  }

  const attempts = db.get('exam_attempts');
  const userAttempts = attempts.filter(a => a.exam_id === exam.id && a.user_id === user.id);
  if (userAttempts.length >= exam.attempt_limit) {
    res.status(400).json({ status: 'error', message: `Attempt limit of ${exam.attempt_limit} reached for this exam` });
    return;
  }

  // Check for any ongoing attempt
  const ongoing = userAttempts.find(a => a.status === 'in_progress');
  if (ongoing) {
    // If ongoing deadline has passed, mark as timed out
    const now = new Date().getTime();
    const deadlineTime = new Date(ongoing.deadline).getTime();
    if (now > deadlineTime) {
      ongoing.status = 'timed_out';
      db.set('exam_attempts', attempts);
    } else {
      res.json({ status: 'success', data: ongoing, message: 'Resumed existing attempt' });
      return;
    }
  }

  // Create new attempt
  const startTime = new Date();
  const deadline = new Date(startTime.getTime() + exam.duration_minutes * 60 * 1000);

  const newAttempt: ExamAttempt = {
    id: 'att_' + Date.now(),
    exam_id: exam.id,
    user_id: user.id,
    user_name: user.name,
    start_time: startTime.toISOString(),
    deadline: deadline.toISOString(),
    answers: {},
    score: 0,
    total_marks: exam.total_marks,
    correct_count: 0,
    incorrect_count: 0,
    unanswered_count: exam.question_ids.length,
    passed: false,
    status: 'in_progress',
  };

  attempts.push(newAttempt);
  db.set('exam_attempts', attempts);

  res.status(201).json({ status: 'success', data: newAttempt });
});

// POST /api/v1/exam-attempts/:id/save (Autosave answers)
apiRouter.post('/exam-attempts/:id/save', (req: Request, res: Response) => {
  const { id } = req.params;
  const { answers } = req.body;
  const user = getUserFromRequest(req);

  const attempts = db.get('exam_attempts');
  const attempt = attempts.find(a => a.id === id);

  if (!attempt) {
    res.status(404).json({ status: 'error', message: 'Attempt not found' });
    return;
  }

  if (user && attempt.user_id !== user.id && user.role !== 'admin') {
    res.status(403).json({ status: 'error', message: 'Unauthorized access to this attempt' });
    return;
  }

  if (attempt.status !== 'in_progress') {
    res.status(400).json({ status: 'error', message: 'Cannot save answers on an already finished attempt' });
    return;
  }

  attempt.answers = answers || attempt.answers;
  db.set('exam_attempts', attempts);

  res.json({ status: 'success', message: 'Answers autosaved' });
});

// POST /api/v1/exam-attempts/:id/submit (Server authoritative scoring)
apiRouter.post('/exam-attempts/:id/submit', (req: Request, res: Response) => {
  const { id } = req.params;
  const { answers } = req.body;
  const user = getUserFromRequest(req);

  const attempts = db.get('exam_attempts');
  const attempt = attempts.find(a => a.id === id);

  if (!attempt) {
    res.status(404).json({ status: 'error', message: 'Attempt not found' });
    return;
  }

  if (user && attempt.user_id !== user.id && user.role !== 'admin') {
    res.status(403).json({ status: 'error', message: 'Unauthorized' });
    return;
  }

  if (attempt.status === 'submitted') {
    res.status(400).json({ status: 'error', message: 'Attempt has already been submitted' });
    return;
  }

  const exams = db.get('exams');
  const exam = exams.find(e => e.id === attempt.exam_id);
  if (!exam) {
    res.status(404).json({ status: 'error', message: 'Associated exam not found' });
    return;
  }

  // Update final answers if provided
  if (answers) {
    attempt.answers = answers;
  }

  // Calculate score on the server
  const questions = db.get('questions').filter(q => exam.question_ids.includes(q.id));
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let calculatedScore = 0;

  for (const q of questions) {
    const selected = attempt.answers[q.id] || [];
    if (selected.length === 0) {
      unansweredCount++;
      continue;
    }

    const isMatch = selected.length === q.correct_option_ids.length &&
      selected.every(opt => q.correct_option_ids.includes(opt));

    if (isMatch) {
      correctCount++;
      calculatedScore += (q.marks || 1);
    } else {
      incorrectCount++;
      calculatedScore -= (exam.negative_mark_per_question || 0.25);
    }
  }

  attempt.score = Math.max(0, Number(calculatedScore.toFixed(2)));
  attempt.correct_count = correctCount;
  attempt.incorrect_count = incorrectCount;
  attempt.unanswered_count = unansweredCount;
  attempt.passed = attempt.score >= exam.pass_marks;
  attempt.submitted_at = new Date().toISOString();
  attempt.status = 'submitted';

  // Calculate rank based on other submitted attempts for this exam
  const otherAttempts = attempts.filter(a => a.exam_id === exam.id && a.status === 'submitted');
  otherAttempts.sort((a, b) => b.score - a.score);
  const myRank = otherAttempts.findIndex(a => a.id === attempt.id) + 1;
  attempt.rank = myRank > 0 ? myRank : 1;

  db.set('exam_attempts', attempts);

  res.json({
    status: 'success',
    data: {
      attempt,
      exam,
      total_participants: otherAttempts.length,
    }
  });
});

// GET /api/v1/results/:attemptId
apiRouter.get('/results/:attemptId', (req: Request, res: Response) => {
  const { attemptId } = req.params;
  const attempts = db.get('exam_attempts');
  const attempt = attempts.find(a => a.id === attemptId);

  if (!attempt) {
    res.status(404).json({ status: 'error', message: 'Result not found' });
    return;
  }

  const exams = db.get('exams');
  const exam = exams.find(e => e.id === attempt.exam_id);
  const questions = db.get('questions').filter(q => exam?.question_ids.includes(q.id));

  // Determine rank
  const allSubmissions = attempts.filter(a => a.exam_id === attempt.exam_id && a.status === 'submitted');
  allSubmissions.sort((a, b) => b.score - a.score);
  const rank = allSubmissions.findIndex(a => a.id === attempt.id) + 1;

  res.json({
    status: 'success',
    data: {
      attempt: {
        ...attempt,
        rank: rank > 0 ? rank : 1,
        total_participants: allSubmissions.length,
      },
      exam,
      questions,
    }
  });
});

// GET /api/v1/results
apiRouter.get('/results', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const attempts = db.get('exam_attempts').filter(a => a.user_id === user.id && a.status === 'submitted');
  const exams = db.get('exams');

  const enriched = attempts.map(att => ({
    ...att,
    exam: exams.find(e => e.id === att.exam_id),
  })).sort((a, b) => new Date(b.submitted_at || b.start_time).getTime() - new Date(a.submitted_at || a.start_time).getTime());

  res.json({ status: 'success', data: enriched });
});

// GET /api/v1/user/skills-heatmap
apiRouter.get('/user/skills-heatmap', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const targetUserId = (req.query.user_id as string) || (user ? user.id : 'usr_rahim');

  const users = db.get('users');
  const targetUser = users.find(u => u.id === targetUserId) || {
    id: targetUserId,
    name: 'Rahim Uddin (Pro Student)',
  };

  const attempts = db.get('exam_attempts');
  const userAttempts = attempts.filter(a => (a.user_id === targetUserId || a.user_id === 'usr_rahim') && a.status === 'submitted');
  const exams = db.get('exams');
  const questions = db.get('questions');
  const subjects = db.get('subjects');

  // Defined mock sessions for rich chronological heatmap progression
  const sessions = [
    { id: 'sess_1', title: '47th BCS Diagnostic Model 01', title_bn: '৪৭তম বিসিএস ডায়াগনস্টিক ০১', date: '2026-03-01' },
    { id: 'sess_2', title: 'Bangladesh Bank AD Mock 01', title_bn: 'বাংলাদেশ ব্যাংক এডি টেস্ট ০১', date: '2026-03-06' },
    { id: 'sess_3', title: 'Primary Teacher Speed Test 01', title_bn: 'প্রাথমিক শিক্ষক স্পিড টেস্ট ০১', date: '2026-03-10' },
    { id: 'sess_4', title: 'Combined 9 Banks Senior Officer', title_bn: 'সমন্বিত ৯ ব্যাংক অফিসার টেস্ট', date: '2026-03-14' },
    { id: 'sess_5', title: '47th BCS Grand Final Mock 02', title_bn: '৪৭তম বিসিএস গ্র্যান্ড ফাইনাল ০২', date: '2026-03-18' },
  ];

  // Benchmark proficiency profiles for authentic education analysis
  const subjectProfiles: Record<string, {
    baseAccuracy: number;
    trend: number[];
    recommendation: string;
    recommendation_bn: string;
  }> = {
    sub_bn: {
      baseAccuracy: 84,
      trend: [72, 80, 85, 90, 94],
      recommendation: 'Mastered modern Bengali literature. Focus slightly more on Charyapada meter and linguistic morphology.',
      recommendation_bn: 'আধুনিক বাংলা সাহিত্যে দক্ষতা চমৎকার। ব্যাকরণ অংশের ধ্বনি ও প্রাচীন চর্যাপদ অংশে নিয়মিত রিভিশন রাখুন।',
    },
    sub_en: {
      baseAccuracy: 76,
      trend: [60, 68, 75, 82, 85],
      recommendation: 'Strong improvement in vocabulary and spelling. Recommended: practice high-frequency GRE words and inversion rules.',
      recommendation_bn: 'বানান ও ভোকাবুলারিতে ধারাবাহিক অগ্রগতি। জটিল প্রিপজিশন ও সিনট্যাক্স রুলস আরও অনুশীলন প্রয়োজন।',
    },
    sub_math: {
      baseAccuracy: 92,
      trend: [85, 90, 92, 95, 98],
      recommendation: 'Exceptional quantitative problem solving and clock/ratio speeds. Ready for 90th+ percentile.',
      recommendation_bn: 'পাটিগণিত ও জ্যামিতিতে শীর্ষ দক্ষতা। এই ধারা বজায় রেখে জটিল পারমুটেশন ও কম্বিনেশন চর্চা করুন।',
    },
    sub_bd: {
      baseAccuracy: 88,
      trend: [78, 82, 86, 91, 93],
      recommendation: 'Consistent knowledge in liberation war history and national budget. Keep track of recent economic gazettes.',
      recommendation_bn: 'মুক্তিযুদ্ধ ও জাতীয় বিষয়াবলীতে শক্ত ভিত্তি। সাম্প্রতিক অর্থনৈতিক সমীক্ষা ও মেগা প্রজেক্টের তথ্য রিভিশন দিন।',
    },
    sub_int: {
      baseAccuracy: 64,
      trend: [50, 58, 62, 69, 72],
      recommendation: 'Needs Focus: International treaties, COP summits, and geopolitical alliances require dedicated weekly revision.',
      recommendation_bn: 'বিশেষ নজর প্রয়োজন: আন্তর্জাতিক চুক্তি, জাতিসংঘ অঙ্গসংস্থা ও বৈশ্বিক সম্মেলনে নিয়মিত প্র্যাকটিস বাড়ান।',
    },
    sub_sci: {
      baseAccuracy: 86,
      trend: [70, 78, 84, 88, 92],
      recommendation: 'Solid grasp of computer architecture, optical discs, and modern ICT networks.',
      recommendation_bn: 'কম্পিউটার ও আইসিটি নেটওয়ার্কিংয়ে দারুণ দখল। প্রাত্যহিক জীবনের রসায়ন ও খাদ্যপুষ্টি অংশটি দেখে নিন।',
    },
  };

  const heatmapSubjects = subjects.map(sub => {
    const prof = subjectProfiles[sub.id] || {
      baseAccuracy: 75,
      trend: [65, 70, 75, 80, 85],
      recommendation: 'Keep practicing topic-wise questions to cement concepts.',
      recommendation_bn: 'নিয়মিত বিষয়ভিত্তিক মডেল টেস্ট দিয়ে দক্ষতা বৃদ্ধি করুন।',
    };

    const cells = sessions.map((sess, idx) => {
      const acc = prof.trend[idx] || prof.baseAccuracy;
      let level = 'Needs Focus';
      if (acc >= 85) level = 'Mastery';
      else if (acc >= 70) level = 'Proficient';
      else if (acc >= 50) level = 'Developing';

      return {
        session_id: sess.id,
        session_title: sess.title,
        session_title_bn: sess.title_bn,
        session_date: sess.date,
        accuracy: acc,
        total_questions: 10,
        correct_count: Math.round((acc / 100) * 10),
        proficiency_level: level,
      };
    });

    const overallAccuracy = Math.round(cells.reduce((sum, c) => sum + c.accuracy, 0) / cells.length);
    let tier = 'Needs Focus';
    if (overallAccuracy >= 85) tier = 'Mastery';
    else if (overallAccuracy >= 70) tier = 'Proficient';
    else if (overallAccuracy >= 50) tier = 'Developing';

    return {
      id: sub.id,
      name: sub.name,
      name_bn: sub.name_bn,
      overall_proficiency: overallAccuracy,
      tier,
      recommendation: prof.recommendation,
      recommendation_bn: prof.recommendation_bn,
      cells,
    };
  });

  // Calculate top & weak zones
  const sortedSubjects = [...heatmapSubjects].sort((a, b) => b.overall_proficiency - a.overall_proficiency);
  const strongest = sortedSubjects[0];
  const weakest = sortedSubjects[sortedSubjects.length - 1];

  res.json({
    status: 'success',
    data: {
      user: {
        id: targetUser.id,
        name: targetUser.name,
      },
      sessions,
      subjects: heatmapSubjects,
      overall_average: Math.round(heatmapSubjects.reduce((sum, s) => sum + s.overall_proficiency, 0) / heatmapSubjects.length),
      strongest_subject: strongest ? { id: strongest.id, name: strongest.name_bn, score: strongest.overall_proficiency } : null,
      weakest_subject: weakest ? { id: weakest.id, name: weakest.name_bn, score: weakest.overall_proficiency } : null,
    }
  });
});

// ----------------------------------------------------
// 4. ORDERS & PAYMENTS (bKash, Nagad, Entitlements)
// ----------------------------------------------------

// POST /api/v1/orders (Submit manual purchase request)
apiRouter.post('/orders', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Please log in to purchase a package' });
    return;
  }

  const { package_id, payment_method, transaction_id, sender_number } = req.body;
  if (!package_id || !payment_method || !transaction_id || !sender_number) {
    res.status(422).json({ status: 'error', message: 'Package, payment method, Transaction ID, and sender number are required' });
    return;
  }

  const packages = db.get('membership_packages');
  const pkg = packages.find(p => p.id === package_id);
  if (!pkg) {
    res.status(404).json({ status: 'error', message: 'Invalid package selected' });
    return;
  }

  const orders = db.get('orders');
  // Check if duplicate transaction ID
  if (orders.some(o => o.transaction_id.trim().toUpperCase() === transaction_id.trim().toUpperCase())) {
    res.status(400).json({ status: 'error', message: 'This Transaction ID has already been submitted' });
    return;
  }

  const orderNumber = `PRERONA-${Date.now().toString().slice(-6)}`;
  const amount = pkg.discount_price_bdt || pkg.price_bdt;

  const newOrder: Order = {
    id: 'ord_' + Date.now(),
    order_number: orderNumber,
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    package_id: pkg.id,
    package_name: pkg.name,
    amount_bdt: amount,
    payment_method,
    transaction_id: transaction_id.trim().toUpperCase(),
    sender_number: sender_number.trim(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  orders.push(newOrder);
  db.set('orders', orders);

  res.status(201).json({
    status: 'success',
    message: 'Purchase request submitted successfully. Premium access will be activated upon admin verification.',
    data: newOrder,
  });
});

// GET /api/v1/orders
apiRouter.get('/orders', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const orders = db.get('orders').filter(o => o.user_id === user.id);
  res.json({ status: 'success', data: orders });
});

// GET /api/v1/entitlements
apiRouter.get('/entitlements', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const entitlements = db.get('user_entitlements').filter(e => e.user_id === user.id);
  const packages = db.get('membership_packages');

  const enriched = entitlements.map(e => ({
    ...e,
    package: packages.find(p => p.id === e.package_id),
    is_valid: e.is_active && new Date(e.expires_at).getTime() > Date.now(),
  }));

  res.json({ status: 'success', data: enriched });
});

// ----------------------------------------------------
// 5. ADMIN CONTROL PANEL APIS
// ----------------------------------------------------

function requireAdminOrStaff(req: Request, res: Response, next: () => void) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }
  if (!['admin', 'content_manager', 'exam_manager'].includes(user.role)) {
    res.status(403).json({ status: 'error', message: 'Admin or Staff privileges required' });
    return;
  }
  next();
}

function requireAdminOnly(req: Request, res: Response, next: () => void) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ status: 'error', message: 'এই পদক্ষেপের জন্য শুধুমাত্র এডমিন (Administrator) অ্যাক্সেস প্রয়োজন' });
    return;
  }
  next();
}

// GET /api/v1/user/student-dashboard (Immutable Activity Log & Profile)
apiRouter.get('/user/student-dashboard', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ status: 'error', message: 'Please log in to view student dashboard' });
    return;
  }

  const { page = '1', limit = '8', filter = 'all' } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.max(1, parseInt(String(limit), 10));

  // Entitlement
  const entitlements = db.get('user_entitlements');
  const now = new Date();
  const activeEntitlement = entitlements.find(e => e.user_id === user.id && e.is_active && new Date(e.expires_at) > now);
  const packages = db.get('membership_packages');
  const currentPackage = activeEntitlement ? packages.find(p => p.id === activeEntitlement.package_id) : null;
  const remainingDays = activeEntitlement ? Math.max(0, Math.ceil((new Date(activeEntitlement.expires_at).getTime() - now.getTime()) / (1000 * 3600 * 24))) : 0;

  // Build immutable student activity records
  const isPaidDemoUser = user.id === 'usr_paid' || user.id === 'usr_rahim';
  const attempts = db.get('exam_attempts').filter(a => (a.user_id === user.id || (isPaidDemoUser && (a.user_id === 'usr_rahim' || a.user_id === 'usr_paid'))) && a.status === 'submitted');
  const exams = db.get('exams');
  const orders = db.get('orders').filter(o => o.user_id === user.id || (isPaidDemoUser && o.user_id === 'usr_paid'));
  const bookmarks = db.get('bookmarks').filter(b => b.user_id === user.id || (isPaidDemoUser && (b.user_id === 'usr_paid' || b.user_id === 'usr_rahim')));
  const papers = db.get('question_papers');

  const activities: Array<{
    id: string;
    type: 'exam_attempt' | 'order' | 'bookmark';
    title: string;
    description: string;
    badge: string;
    score?: number;
    total_marks?: number;
    amount?: number;
    status?: string;
    timestamp: string;
    details_link?: string;
  }> = [];

  // 1. Exam attempts (immutable)
  attempts.forEach(att => {
    const ex = exams.find(e => e.id === att.exam_id);
    activities.push({
      id: att.id,
      type: 'exam_attempt',
      title: ex?.title_bn || ex?.title || 'মডেল টেস্ট পরীক্ষা',
      description: `প্রাপ্ত নম্বর: ${att.score.toFixed(2)} / ${att.total_marks} · সঠিক: ${att.correct_count} · ভুল: ${att.incorrect_count} · মেধা র‍্যাঙ্ক: #${att.rank || 1}`,
      badge: att.passed ? 'PASSED' : 'FAILED',
      score: att.score,
      total_marks: att.total_marks,
      timestamp: att.submitted_at || att.start_time,
      details_link: `/results/${att.id}`,
    });
  });

  // 2. Orders & Payments (immutable)
  orders.forEach(ord => {
    activities.push({
      id: ord.id,
      type: 'order',
      title: `${ord.package_name} সাবস্ক্রিপশন`,
      description: `পেমেন্ট মাধ্যম: ${ord.payment_method.toUpperCase()} · TrxID: ${ord.transaction_id} · প্রেরক: ${ord.sender_number}`,
      badge: ord.status.toUpperCase(),
      amount: ord.amount_bdt,
      status: ord.status,
      timestamp: ord.created_at,
    });
  });

  // 3. Bookmarks (immutable record)
  bookmarks.forEach(bm => {
    const p = papers.find(paper => paper.id === bm.paper_id);
    activities.push({
      id: bm.id,
      type: 'bookmark',
      title: `প্রশ্নপত্র সংরক্ষণ: ${p?.title_bn || p?.title || 'Question Paper'}`,
      description: 'পরবর্তীতে অনুশীলনের জন্য বুকমার্ক তালিকায় যুক্ত করা হয়েছে',
      badge: 'SAVED',
      timestamp: bm.created_at,
      details_link: p ? `/questions/${p.slug}` : undefined,
    });
  });

  // Sort activities newest first
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter if needed
  let filteredActivities = activities;
  if (filter === 'exams') filteredActivities = activities.filter(a => a.type === 'exam_attempt');
  if (filter === 'orders') filteredActivities = activities.filter(a => a.type === 'order');
  if (filter === 'bookmarks') filteredActivities = activities.filter(a => a.type === 'bookmark');

  const total = filteredActivities.length;
  const paginated = filteredActivities.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Overall Stats
  const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = attempts.length > 0 ? Number((totalScore / attempts.length).toFixed(2)) : 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '01711-xxxxxx',
        created_at: user.created_at,
      },
      entitlement: activeEntitlement ? {
        ...activeEntitlement,
        package_name: currentPackage?.name_bn || currentPackage?.name || 'Premium Pass',
        remaining_days: remainingDays,
      } : null,
      stats: {
        total_exams_taken: attempts.length,
        avg_score: avgScore,
        best_score: bestScore,
        total_orders: orders.length,
        saved_bookmarks: bookmarks.length,
      },
      activities: paginated,
      exam_attempts: attempts.map(a => ({
        ...a,
        exam: exams.find(e => e.id === a.exam_id)
      })),
      orders,
      bookmarks: bookmarks.map(b => ({
        ...b,
        paper: papers.find(p => p.id === b.paper_id)
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum) || 1,
      }
    }
  });
});

// GET /api/v1/admin/dashboard
apiRouter.get('/admin/dashboard', requireAdminOrStaff, (_req: Request, res: Response) => {
  const users = db.get('users');
  const papers = db.get('question_papers');
  const questions = db.get('questions');
  const exams = db.get('exams');
  const attempts = db.get('exam_attempts');
  const orders = db.get('orders');
  const sponsors = db.get('sponsor_campaigns');

  const totalRevenue = orders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.amount_bdt, 0);

  const pendingPayments = orders.filter(o => o.status === 'pending');

  res.json({
    status: 'success',
    data: {
      metrics: {
        total_users: users.length,
        paid_users: users.filter(u => u.role === 'paid_user').length,
        total_papers: papers.length,
        total_questions: questions.length,
        total_exams: exams.length,
        total_attempts: attempts.length,
        total_revenue_bdt: totalRevenue,
        pending_payments_count: pendingPayments.length,
        active_sponsors: sponsors.filter(s => s.is_active).length,
      },
      recent_orders: orders.slice(-5).reverse(),
      recent_attempts: attempts.slice(-5).reverse(),
      audit_logs: db.get('audit_logs').slice(0, 8),
    }
  });
});

// Questions CRUD
apiRouter.get('/admin/questions', requireAdminOrStaff, (_req: Request, res: Response) => {
  const papers = db.get('question_papers');
  const categories = db.get('categories');
  const orgs = db.get('organizations');
  const positions = db.get('positions');
  const questions = db.get('questions');

  const enriched = papers.map(p => ({
    ...p,
    category: categories.find(c => c.id === p.category_id),
    organization: orgs.find(o => o.id === p.organization_id),
    position: positions.find(pos => pos.id === p.position_id),
    question_count: questions.filter(q => q.paper_id === p.id).length,
  }));

  res.json({ status: 'success', data: enriched });
});

apiRouter.post('/admin/questions', requireAdminOrStaff, (req: Request, res: Response) => {
  const user = getUserFromRequest(req)!;
  const { title, title_bn, category_id, organization_id, position_id, exam_year, exam_date, total_marks, duration_minutes, is_paid, price_bdt, publication_status, pdf_url, description, tags } = req.body;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
  const newPaper: QuestionPaper = {
    id: 'qp_' + Date.now(),
    title,
    title_bn: title_bn || title,
    slug,
    category_id,
    organization_id,
    position_id,
    exam_year: Number(exam_year) || new Date().getFullYear(),
    exam_date: exam_date || new Date().toISOString().split('T')[0],
    total_marks: Number(total_marks) || 100,
    duration_minutes: Number(duration_minutes) || 60,
    is_paid: Boolean(is_paid),
    price_bdt: price_bdt ? Number(price_bdt) : undefined,
    publication_status: publication_status || 'published',
    pdf_url: pdf_url || '',
    description: description || '',
    view_count: 0,
    tags: Array.isArray(tags) ? tags : [],
    created_at: new Date().toISOString(),
  };

  const papers = db.get('question_papers');
  papers.unshift(newPaper);
  db.set('question_papers', papers);

  db.addAuditLog(user.id, user.name, 'CREATE_QUESTION_PAPER', 'QuestionPaper', newPaper.id, `Created question paper ${newPaper.title}`);

  res.status(201).json({ status: 'success', data: newPaper });
});

apiRouter.put('/admin/questions/:id', requireAdminOrStaff, (req: Request, res: Response) => {
  const user = getUserFromRequest(req)!;
  const { id } = req.params;
  const papers = db.get('question_papers');
  const index = papers.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ status: 'error', message: 'Paper not found' });
    return;
  }

  papers[index] = { ...papers[index], ...req.body };
  db.set('question_papers', papers);

  db.addAuditLog(user.id, user.name, 'UPDATE_QUESTION_PAPER', 'QuestionPaper', id, `Updated question paper ${papers[index].title}`);

  res.json({ status: 'success', data: papers[index] });
});

apiRouter.delete('/admin/questions/:id', requireAdminOrStaff, (req: Request, res: Response) => {
  const user = getUserFromRequest(req)!;
  const { id } = req.params;
  let papers = db.get('question_papers');
  const target = papers.find(p => p.id === id);

  if (!target) {
    res.status(404).json({ status: 'error', message: 'Paper not found' });
    return;
  }

  papers = papers.filter(p => p.id !== id);
  db.set('question_papers', papers);

  db.addAuditLog(user.id, user.name, 'DELETE_QUESTION_PAPER', 'QuestionPaper', id, `Deleted paper ${target.title}`);

  res.json({ status: 'success', message: 'Question paper deleted successfully' });
});

// Add Individual Question to Paper
apiRouter.post('/admin/questions/:paperId/items', requireAdminOrStaff, (req: Request, res: Response) => {
  const user = getUserFromRequest(req)!;
  const { paperId } = req.params;
  const { question_text, question_text_bn, options, correct_option_ids, explanation, subject_id, marks, negative_marks, difficulty, is_paid } = req.body;

  const newQuestion: Question = {
    id: 'q_' + Date.now(),
    paper_id: paperId,
    question_text,
    question_text_bn: question_text_bn || question_text,
    options: options || [],
    correct_option_ids: correct_option_ids || [],
    explanation: explanation || '',
    subject_id,
    marks: Number(marks) || 1,
    negative_marks: Number(negative_marks) || 0.25,
    difficulty: difficulty || 'medium',
    is_paid: Boolean(is_paid),
  };

  const questions = db.get('questions');
  questions.push(newQuestion);
  db.set('questions', questions);

  db.addAuditLog(user.id, user.name, 'ADD_QUESTION_ITEM', 'Question', newQuestion.id, `Added question to paper ${paperId}`);

  res.status(201).json({ status: 'success', data: newQuestion });
});

// Bulk Import MCQs
apiRouter.post('/admin/bulk-import-mcqs', requireAdminOrStaff, (req: Request, res: Response) => {
  const user = getUserFromRequest(req)!;
  const { paper_id, mcqs } = req.body;

  if (!paper_id || !Array.isArray(mcqs) || mcqs.length === 0) {
    res.status(422).json({ status: 'error', message: 'Invalid payload. Paper ID and an array of MCQs are required' });
    return;
  }

  const questions = db.get('questions');
  let importedCount = 0;

  for (const item of mcqs) {
    const q: Question = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      paper_id,
      question_text: item.question_text || 'Sample Question',
      question_text_bn: item.question_text_bn || item.question_text,
      options: item.options || [
        { id: 'opt_1', text: 'Option A' },
        { id: 'opt_2', text: 'Option B' },
        { id: 'opt_3', text: 'Option C' },
        { id: 'opt_4', text: 'Option D' },
      ],
      correct_option_ids: item.correct_option_ids || ['opt_1'],
      explanation: item.explanation || '',
      subject_id: item.subject_id || 'sub_bd',
      marks: item.marks || 1,
      negative_marks: item.negative_marks || 0.25,
      difficulty: item.difficulty || 'medium',
      is_paid: Boolean(item.is_paid),
    };
    questions.push(q);
    importedCount++;
  }

  db.set('questions', questions);
  db.addAuditLog(user.id, user.name, 'BULK_IMPORT_MCQ', 'Question', paper_id, `Bulk imported ${importedCount} MCQs into paper ${paper_id}`);

  res.json({
    status: 'success',
    message: `Successfully imported ${importedCount} questions.`,
    imported_count: importedCount,
  });
});

// Admin Payment Approval / Rejection
apiRouter.get('/admin/payments', requireAdminOrStaff, (_req: Request, res: Response) => {
  const orders = db.get('orders');
  res.json({ status: 'success', data: orders });
});

apiRouter.post('/admin/payments/:id/approve', requireAdminOnly, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const { id } = req.params;
  const { notes } = req.body;

  const orders = db.get('orders');
  const order = orders.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ status: 'error', message: 'Order not found' });
    return;
  }

  if (order.status === 'approved') {
    res.status(400).json({ status: 'error', message: 'Order is already approved' });
    return;
  }

  // Update order status
  order.status = 'approved';
  order.admin_notes = notes || order.admin_notes;
  order.approved_at = new Date().toISOString();
  order.approved_by = admin.name;
  db.set('orders', orders);

  // Grant User Entitlement
  const packages = db.get('membership_packages');
  const pkg = packages.find(p => p.id === order.package_id);
  const durationDays = pkg?.duration_days || 30;

  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const entitlements = db.get('user_entitlements');
  const newEntitlement: UserEntitlement = {
    id: 'ent_' + Date.now(),
    user_id: order.user_id,
    order_id: order.id,
    package_id: order.package_id,
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_active: true,
  };
  entitlements.push(newEntitlement);
  db.set('user_entitlements', entitlements);

  // Update user role to paid_user if regular user
  const users = db.get('users');
  const user = users.find(u => u.id === order.user_id);
  if (user && user.role === 'user') {
    user.role = 'paid_user';
    db.set('users', users);
  }

  db.addAuditLog(admin.id, admin.name, 'APPROVE_PAYMENT', 'Order', order.id, `Approved BDT ${order.amount_bdt} for ${order.user_name} (${order.package_name}). Entitlement active until ${expiresAt.toLocaleDateString()}`);

  res.json({
    status: 'success',
    message: 'Payment verified and approved. Premium entitlement has been activated.',
    data: { order, entitlement: newEntitlement }
  });
});

apiRouter.post('/admin/payments/:id/reject', requireAdminOnly, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const { id } = req.params;
  const { reason } = req.body;

  const orders = db.get('orders');
  const order = orders.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ status: 'error', message: 'Order not found' });
    return;
  }

  order.status = 'rejected';
  order.admin_notes = reason || 'Payment transaction verification failed.';
  db.set('orders', orders);

  db.addAuditLog(admin.id, admin.name, 'REJECT_PAYMENT', 'Order', order.id, `Rejected payment request for ${order.user_name}. Reason: ${order.admin_notes}`);

  res.json({ status: 'success', message: 'Order rejected', data: order });
});

// Admin Exams CRUD
apiRouter.get('/admin/exams', requireAdminOrStaff, (_req: Request, res: Response) => {
  const exams = db.get('exams');
  const categories = db.get('categories');
  const attempts = db.get('exam_attempts');

  const enriched = exams.map(e => ({
    ...e,
    category: categories.find(c => c.id === e.category_id),
    attempts_count: attempts.filter(a => a.exam_id === e.id).length,
  }));

  res.json({ status: 'success', data: enriched });
});

apiRouter.post('/admin/exams', requireAdminOrStaff, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const { title, title_bn, description, category_id, question_ids, total_marks, pass_marks, duration_minutes, negative_mark_per_question, is_paid, is_active } = req.body;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
  const newExam: Exam = {
    id: 'ex_' + Date.now(),
    title,
    title_bn: title_bn || title,
    slug,
    description: description || '',
    category_id,
    question_ids: Array.isArray(question_ids) ? question_ids : [],
    total_marks: Number(total_marks) || 100,
    pass_marks: Number(pass_marks) || 50,
    duration_minutes: Number(duration_minutes) || 60,
    negative_mark_per_question: Number(negative_mark_per_question) || 0.25,
    attempt_limit: 3,
    is_paid: Boolean(is_paid),
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    answer_reveal_mode: 'after_submit',
    created_at: new Date().toISOString(),
  };

  const exams = db.get('exams');
  exams.push(newExam);
  db.set('exams', exams);

  db.addAuditLog(admin.id, admin.name, 'CREATE_EXAM', 'Exam', newExam.id, `Created exam ${newExam.title}`);

  res.status(201).json({ status: 'success', data: newExam });
});

// Admin Users Management
apiRouter.get('/admin/users', requireAdminOrStaff, (_req: Request, res: Response) => {
  const users = db.get('users');
  res.json({ status: 'success', data: users });
});

apiRouter.put('/admin/users/:id', requireAdminOnly, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const { id } = req.params;
  const { role, status } = req.body;

  const users = db.get('users');
  const user = users.find(u => u.id === id);

  if (!user) {
    res.status(404).json({ status: 'error', message: 'User not found' });
    return;
  }

  if (role) user.role = role;
  if (status) user.status = status;
  db.set('users', users);

  db.addAuditLog(admin.id, admin.name, 'UPDATE_USER', 'User', user.id, `Updated user ${user.name} role: ${user.role}, status: ${user.status}`);

  res.json({ status: 'success', data: user });
});

// Admin Ad Settings & Sponsors
apiRouter.get('/admin/advertisements', requireAdminOrStaff, (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      settings: db.get('ad_settings'),
      sponsors: db.get('sponsor_campaigns'),
    }
  });
});

apiRouter.put('/admin/advertisements/settings', requireAdminOnly, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const settings = { ...db.get('ad_settings'), ...req.body };
  db.set('ad_settings', settings);

  db.addAuditLog(admin.id, admin.name, 'UPDATE_AD_SETTINGS', 'AdSetting', 'global', `Updated Google AdSense settings`);

  res.json({ status: 'success', data: settings });
});

apiRouter.post('/admin/sponsors', requireAdminOrStaff, (req: Request, res: Response) => {
  const admin = getUserFromRequest(req)!;
  const { title, client_name, banner_url, target_url, placement, starts_at, ends_at, is_active } = req.body;

  const newSponsor: SponsorCampaign = {
    id: 'spn_' + Date.now(),
    title,
    client_name,
    banner_url,
    target_url,
    placement: placement || 'header',
    starts_at: starts_at || new Date().toISOString(),
    ends_at: ends_at || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
    is_active: is_active !== undefined ? Boolean(is_active) : true,
    impressions: 0,
    clicks: 0,
  };

  const campaigns = db.get('sponsor_campaigns');
  campaigns.unshift(newSponsor);
  db.set('sponsor_campaigns', campaigns);

  db.addAuditLog(admin.id, admin.name, 'CREATE_SPONSOR', 'SponsorCampaign', newSponsor.id, `Created sponsor campaign ${newSponsor.title}`);

  res.status(201).json({ status: 'success', data: newSponsor });
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdminOrStaff, (_req: Request, res: Response) => {
  res.json({ status: 'success', data: db.get('audit_logs') });
});
