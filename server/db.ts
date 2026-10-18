import fs from 'node:fs';
import path from 'node:path';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed or demo-safe password
  role: 'admin' | 'content_manager' | 'exam_manager' | 'paid_user' | 'user';
  phone?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  is_active: boolean;
}

export interface Organization {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description?: string;
  logo?: string;
  is_active: boolean;
}

export interface Position {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  organization_id: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  text_bn?: string;
}

export interface Question {
  id: string;
  paper_id: string;
  question_text: string;
  question_text_bn?: string;
  options: QuestionOption[];
  correct_option_ids: string[];
  explanation?: string;
  explanation_bn?: string;
  subject_id?: string;
  marks: number;
  negative_marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_paid: boolean;
}

export interface QuestionPaper {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  category_id: string;
  organization_id: string;
  position_id: string;
  exam_year: number;
  exam_date: string;
  total_marks: number;
  duration_minutes: number;
  is_paid: boolean;
  price_bdt?: number;
  publication_status: 'published' | 'draft' | 'scheduled' | 'archived';
  pdf_url?: string;
  description?: string;
  view_count: number;
  tags: string[];
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  description: string;
  category_id: string;
  question_ids: string[];
  total_marks: number;
  pass_marks: number;
  duration_minutes: number;
  negative_mark_per_question: number;
  start_time?: string;
  end_time?: string;
  attempt_limit: number;
  is_paid: boolean;
  is_active: boolean;
  answer_reveal_mode: 'immediate' | 'after_submit' | 'after_exam_ends';
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  user_name: string;
  start_time: string;
  deadline: string; // server enforced
  submitted_at?: string;
  answers: Record<string, string[]>; // question_id -> option_ids
  score: number;
  total_marks: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  passed: boolean;
  status: 'in_progress' | 'submitted' | 'timed_out';
  rank?: number;
}

export interface MembershipPackage {
  id: string;
  name: string;
  name_bn: string;
  duration_days: number;
  price_bdt: number;
  discount_price_bdt?: number;
  features: string[];
  is_active: boolean;
  badge?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  package_id: string;
  package_name: string;
  amount_bdt: number;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  transaction_id: string;
  sender_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface UserEntitlement {
  id: string;
  user_id: string;
  order_id: string;
  package_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface AdSetting {
  adsense_enabled: boolean;
  publisher_id: string;
  header_slot_id: string;
  sidebar_slot_id: string;
  content_slot_id: string;
}

export interface SponsorCampaign {
  id: string;
  title: string;
  client_name: string;
  banner_url: string;
  target_url: string;
  placement: 'header' | 'sidebar' | 'footer' | 'question_bottom';
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
}

export interface Notice {
  id: string;
  title: string;
  title_bn: string;
  content: string;
  priority: 'normal' | 'urgent';
  is_published: boolean;
  publish_date: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  paper_id: string;
  question_id?: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  organizations: Organization[];
  positions: Position[];
  subjects: Subject[];
  question_papers: QuestionPaper[];
  questions: Question[];
  exams: Exam[];
  exam_attempts: ExamAttempt[];
  membership_packages: MembershipPackage[];
  orders: Order[];
  user_entitlements: UserEntitlement[];
  ad_settings: AdSetting;
  sponsor_campaigns: SponsorCampaign[];
  notices: Notice[];
  audit_logs: AuditLog[];
  bookmarks: Bookmark[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data generator
function getInitialData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr_admin',
      name: 'Tanvir Hossain (Admin)',
      email: 'admin@prerona.edu.bd',
      password: 'admin123@secure',
      role: 'admin',
      phone: '01711000111',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_content_mgr',
      name: 'Farzana Akter (Content Manager)',
      email: 'content@prerona.edu.bd',
      password: 'content123@secure',
      role: 'content_manager',
      phone: '01811222333',
      status: 'active',
      created_at: '2026-01-05T00:00:00Z',
    },
    {
      id: 'usr_paid',
      name: 'Rahim Uddin (Pro Student)',
      email: 'rahim.bcs@gmail.com',
      password: 'user123@secure',
      role: 'paid_user',
      phone: '01911444555',
      status: 'active',
      created_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr_free',
      name: 'Nusrat Jahan (Free Candidate)',
      email: 'nusrat.prep@gmail.com',
      password: 'user123@secure',
      role: 'user',
      phone: '01611777888',
      status: 'active',
      created_at: '2026-02-01T00:00:00Z',
    },
  ];

  const categories: Category[] = [
    {
      id: 'cat_bcs',
      name: 'BCS Examination',
      name_bn: 'বিসিএস প্রিলিমিনারি ও লিখিত',
      slug: 'bcs-examination',
      icon: 'GraduationCap',
      description: 'Bangladesh Civil Service previous question papers and solutions.',
      order: 1,
      is_active: true,
    },
    {
      id: 'cat_bank',
      name: 'Banking Jobs',
      name_bn: 'ব্যাংক নিয়োগ পরীক্ষা',
      slug: 'banking-jobs',
      icon: 'Building2',
      description: 'Bangladesh Bank, Sonali Bank, Janata Bank and Combined Banks recruitments.',
      order: 2,
      is_active: true,
    },
    {
      id: 'cat_primary',
      name: 'Primary Teacher Recruitment',
      name_bn: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ',
      slug: 'primary-teacher',
      icon: 'School',
      description: 'DPE Government Primary School assistant teacher question bank.',
      order: 3,
      is_active: true,
    },
    {
      id: 'cat_ntrca',
      name: 'NTRCA Teacher Registration',
      name_bn: 'এনটিআরসিএ শিক্ষক নিবন্ধন',
      slug: 'ntrca-recruitment',
      icon: 'BookOpen',
      description: 'School, College and Technical Teacher Registration examinations.',
      order: 4,
      is_active: true,
    },
    {
      id: 'cat_ministry',
      name: 'Ministries & Departments',
      name_bn: 'মন্ত্রণালয় ও সরকারি অধিদপ্তর',
      slug: 'ministry-jobs',
      icon: 'Landmark',
      description: 'Various ministries, directorates, and autonomous public body exams.',
      order: 5,
      is_active: true,
    },
    {
      id: 'cat_varsity',
      name: 'University Admission',
      name_bn: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষা',
      slug: 'university-admission',
      icon: 'Library',
      description: 'Dhaka University, GST Cluster, RU, CU and Engineering Admission questions.',
      order: 6,
      is_active: true,
    },
  ];

  const organizations: Organization[] = [
    {
      id: 'org_bpsc',
      name: 'Bangladesh Public Service Commission (BPSC)',
      name_bn: 'বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি)',
      slug: 'bpsc',
      description: 'Constitutional body for civil service appointments in Bangladesh.',
      is_active: true,
    },
    {
      id: 'org_bb',
      name: 'Bangladesh Bank (Central Bank)',
      name_bn: 'বাংলাদেশ ব্যাংক',
      slug: 'bangladesh-bank',
      description: 'Central bank of Bangladesh and Bankers Selection Committee Secretariat.',
      is_active: true,
    },
    {
      id: 'org_dpe',
      name: 'Directorate of Primary Education (DPE)',
      name_bn: 'প্রাথমিক শিক্ষা অধিদপ্তর',
      slug: 'dpe',
      description: 'Responsible for primary education and teacher recruitment.',
      is_active: true,
    },
    {
      id: 'org_ntrca',
      name: 'Non-Govt. Teachers Registration and Certification Authority',
      name_bn: 'বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ',
      slug: 'ntrca',
      description: 'Conducts examinations for teacher eligibility across Bangladesh.',
      is_active: true,
    },
    {
      id: 'org_du',
      name: 'University of Dhaka',
      name_bn: 'ঢাকা বিশ্ববিদ্যালয়',
      slug: 'dhaka-university',
      description: 'Premier public university in Bangladesh.',
      is_active: true,
    },
  ];

  const positions: Position[] = [
    {
      id: 'pos_bcs_cadre',
      name: 'Cadre Officer (General & Technical)',
      name_bn: 'ক্যাডার কর্মকর্তা (সাধারণ ও কারিগরি)',
      slug: 'cadre-officer',
      organization_id: 'org_bpsc',
      is_active: true,
    },
    {
      id: 'pos_ad_bb',
      name: 'Assistant Director (General)',
      name_bn: 'সহকারী পরিচালক (জেনারেল)',
      slug: 'assistant-director',
      organization_id: 'org_bb',
      is_active: true,
    },
    {
      id: 'pos_so_bank',
      name: 'Senior Officer (Combined 8/9 Banks)',
      name_bn: 'সিনিয়র অফিসার (সমন্বিত ব্যাংক)',
      slug: 'senior-officer-banks',
      organization_id: 'org_bb',
      is_active: true,
    },
    {
      id: 'pos_primary_teacher',
      name: 'Assistant Teacher',
      name_bn: 'সহকারী শিক্ষক',
      slug: 'assistant-teacher',
      organization_id: 'org_dpe',
      is_active: true,
    },
    {
      id: 'pos_ntrca_lecturer',
      name: 'College Lecturer (18th NTRCA)',
      name_bn: 'প্রভাষক (কলেজ পর্যায়)',
      slug: 'college-lecturer',
      organization_id: 'org_ntrca',
      is_active: true,
    },
  ];

  const subjects: Subject[] = [
    { id: 'sub_bn', name: 'Bangla Language & Literature', name_bn: 'বাংলা ভাষা ও সাহিত্য', slug: 'bangla' },
    { id: 'sub_en', name: 'English Language & Literature', name_bn: 'ইংরেজি ভাষা ও সাহিত্য', slug: 'english' },
    { id: 'sub_bd', name: 'Bangladesh Affairs', name_bn: 'বাংলাদেশ বিষয়াবলী', slug: 'bangladesh-affairs' },
    { id: 'sub_int', name: 'International Affairs', name_bn: 'আন্তর্জাতিক বিষয়াবলী', slug: 'international-affairs' },
    { id: 'sub_math', name: 'Mathematical Reasoning & Mental Ability', name_bn: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', slug: 'math' },
    { id: 'sub_sci', name: 'General Science & ICT', name_bn: 'সাধারণ বিজ্ঞান ও কম্পিউটার/তথ্যপ্রযুক্তি', slug: 'science-ict' },
  ];

  const question_papers: QuestionPaper[] = [
    {
      id: 'qp_46_bcs',
      title: '46th BCS Preliminary Examination Question & Solution',
      title_bn: '৪৬তম বিসিএস প্রিলিমিনারি প্রশ্ন ও সম্পূর্ণ সমাধান',
      slug: '46th-bcs-preliminary-question-solution',
      category_id: 'cat_bcs',
      organization_id: 'org_bpsc',
      position_id: 'pos_bcs_cadre',
      exam_year: 2024,
      exam_date: '2024-04-26',
      total_marks: 200,
      duration_minutes: 120,
      is_paid: false,
      publication_status: 'published',
      pdf_url: '/assets/docs/46th_bcs_preli_question.pdf',
      description: 'Official 46th BCS Preliminary MCQ question paper with authentic answers, detailed analytical explanations and subject-wise breakdown.',
      view_count: 14250,
      tags: ['BCS', 'BPSC', '2024', 'Preliminary', 'General Knowledge', 'Math'],
      created_at: '2024-05-01T10:00:00Z',
    },
    {
      id: 'qp_45_bcs',
      title: '45th BCS Preliminary Examination Question & Solution',
      title_bn: '৪৫তম বিসিএস প্রিলিমিনারি পরীক্ষার প্রশ্ন ও নির্ভুল ব্যাখ্যা',
      slug: '45th-bcs-preliminary-question-solution',
      category_id: 'cat_bcs',
      organization_id: 'org_bpsc',
      position_id: 'pos_bcs_cadre',
      exam_year: 2023,
      exam_date: '2023-05-19',
      total_marks: 200,
      duration_minutes: 120,
      is_paid: false,
      publication_status: 'published',
      pdf_url: '/assets/docs/45th_bcs_preli_question.pdf',
      description: 'Full 200 marks solved paper of 45th BCS Preliminary examination categorized into Bangla, English, Math, Science, and Affairs.',
      view_count: 28400,
      tags: ['BCS', 'BPSC', '2023', 'Previous Year', 'Solved'],
      created_at: '2023-05-25T10:00:00Z',
    },
    {
      id: 'qp_bb_ad_2024',
      title: 'Bangladesh Bank Assistant Director (General) 2024',
      title_bn: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল) ২০২৪ প্রশ্ন সমাধান',
      slug: 'bangladesh-bank-assistant-director-2024',
      category_id: 'cat_bank',
      organization_id: 'org_bb',
      position_id: 'pos_ad_bb',
      exam_year: 2024,
      exam_date: '2024-03-08',
      total_marks: 100,
      duration_minutes: 60,
      is_paid: true,
      price_bdt: 120,
      publication_status: 'published',
      pdf_url: '/assets/docs/bangladesh_bank_ad_2024.pdf',
      description: 'Full competitive paper for Bangladesh Bank AD exam containing critical English vocabulary, advanced math analytical reasoning and contemporary economy MCQs.',
      view_count: 9870,
      tags: ['Bangladesh Bank', 'Banking', 'AD', '2024', 'Premium'],
      created_at: '2024-03-12T14:00:00Z',
    },
    {
      id: 'qp_primary_2024_phase3',
      title: 'Govt. Primary Assistant Teacher Recruitment 2024 (Phase-3)',
      title_bn: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ২০২৪ (৩য় ধাপ)',
      slug: 'primary-assistant-teacher-2024-phase-3',
      category_id: 'cat_primary',
      organization_id: 'org_dpe',
      position_id: 'pos_primary_teacher',
      exam_year: 2024,
      exam_date: '2024-03-29',
      total_marks: 80,
      duration_minutes: 60,
      is_paid: false,
      publication_status: 'published',
      pdf_url: '/assets/docs/primary_teacher_phase3_2024.pdf',
      description: 'Directorate of Primary Education Phase-3 MCQ test with step-by-step mathematical reasoning and grammatical rules explanation.',
      view_count: 18920,
      tags: ['Primary', 'DPE', 'Teacher', '2024', 'Free Practice'],
      created_at: '2024-04-02T10:00:00Z',
    },
    {
      id: 'qp_18th_ntrca_college',
      title: '18th NTRCA Preliminary Examination (College Level) 2024',
      title_bn: '১৮তম শিক্ষক নিবন্ধন প্রিলিমিনারি পরীক্ষা (কলেজ পর্যায়) ২০২৪',
      slug: '18th-ntrca-preliminary-college-level-2024',
      category_id: 'cat_ntrca',
      organization_id: 'org_ntrca',
      position_id: 'pos_ntrca_lecturer',
      exam_year: 2024,
      exam_date: '2024-03-15',
      total_marks: 100,
      duration_minutes: 60,
      is_paid: true,
      price_bdt: 99,
      publication_status: 'published',
      pdf_url: '/assets/docs/18th_ntrca_college_2024.pdf',
      description: 'Authentic answer key and lecture analysis for 18th NTRCA college level exam.',
      view_count: 11400,
      tags: ['NTRCA', 'Teacher Registration', 'College', '2024'],
      created_at: '2024-03-20T11:00:00Z',
    },
  ];

  const questions: Question[] = [
    // 46th BCS Questions
    {
      id: 'q_46_01',
      paper_id: 'qp_46_bcs',
      question_text: 'চর্যাপদের আদি কবি কে বা চর্যাপদের প্রথম পদটি কার রচিত?',
      question_text_bn: 'চর্যাপদের আদি কবি কে বা চর্যাপদের প্রথম পদটি কার রচিত?',
      options: [
        { id: 'opt_1', text: 'কাহ্নপা (Kahnapa)' },
        { id: 'opt_2', text: 'লুইপা (Luipa)' },
        { id: 'opt_3', text: 'ভুসুকুপা (Bhusukupa)' },
        { id: 'opt_4', text: 'শবরপা (Shabarpa)' },
      ],
      correct_option_ids: ['opt_2'],
      explanation: 'চর্যাপদের প্রথম পদটি রচিত লুইপা কর্তৃক ("কাআ তরুবর পঞ্চবি ডাল")। তিনি চর্যাপদের আদি সিদ্ধাচার্য বা আদি কবি হিসেবে স্বীকৃত। চর্যাপদের সর্বাধিক পদ রচনা করেন কাহ্নপা (১৩টি)।',
      subject_id: 'sub_bn',
      marks: 1,
      negative_marks: 0.5,
      difficulty: 'easy',
      is_paid: false,
    },
    {
      id: 'q_46_02',
      paper_id: 'qp_46_bcs',
      question_text: 'Identify the word which is NOT synonymous with "Ephemeral":',
      question_text_bn: 'কোন শব্দটি "Ephemeral" এর সমার্থক শব্দ নয়?',
      options: [
        { id: 'opt_1', text: 'Transient' },
        { id: 'opt_2', text: 'Fleeting' },
        { id: 'opt_3', text: 'Perpetual' },
        { id: 'opt_4', text: 'Short-lived' },
      ],
      correct_option_ids: ['opt_3'],
      explanation: '"Ephemeral" means lasting for a very short time (ক্ষণস্থায়ী)। Transient, Fleeting এবং Short-lived এর সমার্থক। অন্যদিকে "Perpetual" অর্থ চিরন্তন বা চিরস্থায়ী, যা Ephemeral এর বিপরীতার্থক (Antonym)।',
      subject_id: 'sub_en',
      marks: 1,
      negative_marks: 0.5,
      difficulty: 'medium',
      is_paid: false,
    },
    {
      id: 'q_46_03',
      paper_id: 'qp_46_bcs',
      question_text: 'ঐতিহাসিক ৭ই মার্চের ভাষণকে ইউনেস্কো কত তারিখে "বিশ্ব প্রামাণ্য ঐতিহ্য" (Memory of the World) হিসেবে স্বীকৃতি প্রদান করে?',
      question_text_bn: 'ঐতিহাসিক ৭ই মার্চের ভাষণকে ইউনেস্কো কত তারিখে "বিশ্ব প্রামাণ্য ঐতিহ্য" হিসেবে স্বীকৃতি প্রদান করে?',
      options: [
        { id: 'opt_1', text: '৩০ অক্টোবর ২০১৭' },
        { id: 'opt_2', text: '৭ মার্চ ২০১৮' },
        { id: 'opt_3', text: '১৭ নভেম্বর ১৯৯৯' },
        { id: 'opt_4', text: '১৫ আগস্ট ২০২০' },
      ],
      correct_option_ids: ['opt_1'],
      explanation: '২০১৭ সালের ৩০ অক্টোবর ইউনেস্কোর তৎকালীন মহাপরিচালক ইরিনা বোকোভা জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের ঐতিহাসিক ৭ই মার্চের ভাষণকে "মেমোরি অব দ্য ওয়ার্ল্ড ইন্টারন্যাশনাল রেজিস্টার"-এ অন্তর্ভুক্তির ঘোষণা দেন।',
      subject_id: 'sub_bd',
      marks: 1,
      negative_marks: 0.5,
      difficulty: 'medium',
      is_paid: false,
    },
    {
      id: 'q_46_04',
      paper_id: 'qp_46_bcs',
      question_text: 'একটি ঘড়িতে যখন ৪টা বাজে, তখন ঘণ্টার কাঁটা ও মিনিটের কাঁটার মধ্যবর্তী কোণ কত ডিগ্রি?',
      question_text_bn: 'একটি ঘড়িতে যখন ৪টা বাজে, তখন ঘণ্টার কাঁটা ও মিনিটের কাঁটার মধ্যবর্তী কোণ কত ডিগ্রি?',
      options: [
        { id: 'opt_1', text: '৯০°' },
        { id: 'opt_2', text: '১২০°' },
        { id: 'opt_3', text: '১০০°' },
        { id: 'opt_4', text: '১১০°' },
      ],
      correct_option_ids: ['opt_2'],
      explanation: 'ঘড়ির কাঁটার কোণ নির্ণয়ের সূত্র: |(11×M - 60×H) / 2| ডিগ্রি। এখানে H = 4 এবং M = 00। সুতরাং কোণ = |(0 - 60×4) / 2| = |-240/2| = 120°।',
      subject_id: 'sub_math',
      marks: 1,
      negative_marks: 0.5,
      difficulty: 'easy',
      is_paid: false,
    },
    {
      id: 'q_46_05',
      paper_id: 'qp_46_bcs',
      question_text: 'কম্পিউটারের অপটিক্যাল ডিস্ক তৈরিতে নিচের কোন উপাদানটি ব্যাপকভাবে ব্যবহৃত হয়?',
      question_text_bn: 'কম্পিউটারের অপটিক্যাল ডিস্ক তৈরিতে নিচের কোন উপাদানটি ব্যাপকভাবে ব্যবহৃত হয়?',
      options: [
        { id: 'opt_1', text: 'পলিকর্বোনেট (Polycarbonate)' },
        { id: 'opt_2', text: 'সিলিকন কার্বাইড' },
        { id: 'opt_3', text: 'পলিভিনাইল ক্লোরাইড' },
        { id: 'opt_4', text: 'ট্রিফেনিলফসফেট' },
      ],
      correct_option_ids: ['opt_1'],
      explanation: 'সিডি/ডিভিডি বা অপটিক্যাল ডিস্কের মূল স্বচ্ছ বেস লেয়ার তৈরি করতে অপটিক্যাল গ্রেড পলিকার্বোনেট (Polycarbonate) প্লাস্টিক ব্যবহার করা হয়।',
      subject_id: 'sub_sci',
      marks: 1,
      negative_marks: 0.5,
      difficulty: 'medium',
      is_paid: false,
    },

    // Bangladesh Bank Questions (Premium)
    {
      id: 'q_bb_01',
      paper_id: 'qp_bb_ad_2024',
      question_text: 'Which of the following monetary instruments directly impacts the excess reserves of commercial banks in Bangladesh?',
      question_text_bn: 'নিচের কোন মুদ্রানীতি হাতিয়ারটি সরাসরি বাণিজ্যিক ব্যাংকের অতিরিক্ত রিজার্ভকে প্রভাবিত করে?',
      options: [
        { id: 'opt_1', text: 'Cash Reserve Ratio (CRR)' },
        { id: 'opt_2', text: 'Statutory Liquidity Ratio (SLR)' },
        { id: 'opt_3', text: 'Repo Rate' },
        { id: 'opt_4', text: 'All of the above' },
      ],
      correct_option_ids: ['opt_4'],
      explanation: 'All three instruments—CRR, SLR, and Repo Rate—are direct quantitative credit control mechanisms of Bangladesh Bank that determine banking sector liquidity and excess reserves.',
      subject_id: 'sub_bd',
      marks: 1,
      negative_marks: 0.25,
      difficulty: 'hard',
      is_paid: true,
    },
    {
      id: 'q_bb_02',
      paper_id: 'qp_bb_ad_2024',
      question_text: 'A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times of itself at the same rate?',
      question_text_bn: 'সরল সুদে কোনো আসল ৫ বছরে দ্বিগুণ হলে, একই সুদের হারে কত বছরে তা ৪ গুণ হবে?',
      options: [
        { id: 'opt_1', text: '10 years' },
        { id: 'opt_2', text: '15 years' },
        { id: 'opt_3', text: '20 years' },
        { id: 'opt_4', text: '12 years' },
      ],
      correct_option_ids: ['opt_2'],
      explanation: 'Let Principal = P. In 5 years, Amount = 2P, so Interest = P. Rate R = (100 × P) / (P × 5) = 20%. For amount to become 4P, Interest required = 3P. Time T = (100 × 3P) / (P × 20) = 300 / 20 = 15 years.',
      subject_id: 'sub_math',
      marks: 1,
      negative_marks: 0.25,
      difficulty: 'medium',
      is_paid: true,
    },

    // Primary Teacher Questions
    {
      id: 'q_prim_01',
      paper_id: 'qp_primary_2024_phase3',
      question_text: '"সূর্য" শব্দের সঠিক প্রতিশব্দ কোনটি?',
      question_text_bn: '"সূর্য" শব্দের সঠিক প্রতিশব্দ কোনটি?',
      options: [
        { id: 'opt_1', text: 'মিহির' },
        { id: 'opt_2', text: 'শশাঙ্ক' },
        { id: 'opt_3', text: 'সুধাংশু' },
        { id: 'opt_4', text: 'বিধু' },
      ],
      correct_option_ids: ['opt_1'],
      explanation: 'সূর্যের সমার্থক শব্দ হলো মিহির, ভানু, রবি, তপন, অর্ক, প্রভাকর। অপরপক্ষে শশাঙ্ক, সুধাংশু ও বিধু হলো চন্দ্র (চাঁদ) এর প্রতিশব্দ।',
      subject_id: 'sub_bn',
      marks: 1,
      negative_marks: 0.25,
      difficulty: 'easy',
      is_paid: false,
    },
    {
      id: 'q_prim_02',
      paper_id: 'qp_primary_2024_phase3',
      question_text: 'Choose the correct spelling:',
      question_text_bn: 'সঠিক বানান কোনটি?',
      options: [
        { id: 'opt_1', text: 'Bureaucracy' },
        { id: 'opt_2', text: 'Beurocracy' },
        { id: 'opt_3', text: 'Bureaucrasy' },
        { id: 'opt_4', text: 'Burocracy' },
      ],
      correct_option_ids: ['opt_1'],
      explanation: 'The correct spelling is B-U-R-E-A-U-C-R-A-C-Y (আমলাতন্ত্র)।',
      subject_id: 'sub_en',
      marks: 1,
      negative_marks: 0.25,
      difficulty: 'medium',
      is_paid: false,
    },
    {
      id: 'q_prim_03',
      paper_id: 'qp_primary_2024_phase3',
      question_text: '০.১ × ০.০১ × ০.০০১ এর মান কত?',
      question_text_bn: '০.১ × ০.০১ × ০.০০১ এর মান কত?',
      options: [
        { id: 'opt_1', text: '০.০০০১' },
        { id: 'opt_2', text: '০.০০০০০১' },
        { id: 'opt_3', text: '০.০০০০১' },
        { id: 'opt_4', text: '১.০০০০০' },
      ],
      correct_option_ids: ['opt_2'],
      explanation: 'দশমিকের পর মোট ঘরের সংখ্যা ১ + ২ + ৩ = ৬টি ঘর। ১ × ১ × ১ = ১। সুতরাং নির্ণেয় মান = ০.০০০০০১।',
      subject_id: 'sub_math',
      marks: 1,
      negative_marks: 0.25,
      difficulty: 'easy',
      is_paid: false,
    },
  ];

  const exams: Exam[] = [
    {
      id: 'ex_bcs_live_01',
      title: '47th BCS Special Grand Mock Test - Model Exam 01',
      title_bn: '৪৭তম বিসিএস বিশেষ গ্র্যান্ড মডেল টেস্ট - ০১',
      slug: '47th-bcs-special-grand-mock-test-01',
      description: 'Full syllabus 47th BCS preliminary mock exam designed by subject matter experts following latest BPSC guidelines.',
      category_id: 'cat_bcs',
      question_ids: ['q_46_01', 'q_46_02', 'q_46_03', 'q_46_04', 'q_46_05'],
      total_marks: 5,
      pass_marks: 3,
      duration_minutes: 10,
      negative_mark_per_question: 0.5,
      attempt_limit: 3,
      is_paid: false,
      is_active: true,
      answer_reveal_mode: 'after_submit',
      created_at: '2026-02-15T08:00:00Z',
    },
    {
      id: 'ex_bank_pro_01',
      title: 'Combined 9 Banks Senior Officer Live Mock Examination 2026',
      title_bn: 'সমন্বিত ৯ ব্যাংক সিনিয়র অফিসার লাইভ মডেল টেস্ট ২০২৬',
      slug: 'combined-9-banks-senior-officer-live-mock-2026',
      description: 'High difficulty banking mathematics, analytical logic, critical reasoning, and contemporary financial affairs.',
      category_id: 'cat_bank',
      question_ids: ['q_bb_01', 'q_bb_02', 'q_46_02', 'q_46_04'],
      total_marks: 4,
      pass_marks: 2.5,
      duration_minutes: 8,
      negative_mark_per_question: 0.25,
      attempt_limit: 2,
      is_paid: true,
      is_active: true,
      answer_reveal_mode: 'after_submit',
      created_at: '2026-03-01T10:00:00Z',
    },
    {
      id: 'ex_primary_free_01',
      title: 'Primary Assistant Teacher Daily Rapid Fire MCQ Test',
      title_bn: 'প্রাথমিক সহকারী শিক্ষক দৈনিক র্যাপিড ফায়ার এমসিকিউ অনুশীলন',
      slug: 'primary-assistant-teacher-daily-rapid-fire',
      description: 'Quick speed booster test covering Bengali spelling, grammar and elementary mathematics.',
      category_id: 'cat_primary',
      question_ids: ['q_prim_01', 'q_prim_02', 'q_prim_03', 'q_46_04'],
      total_marks: 4,
      pass_marks: 2,
      duration_minutes: 5,
      negative_mark_per_question: 0.25,
      attempt_limit: 5,
      is_paid: false,
      is_active: true,
      answer_reveal_mode: 'immediate',
      created_at: '2026-03-10T12:00:00Z',
    },
  ];

  const exam_attempts: ExamAttempt[] = [
    {
      id: 'att_01',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_rahim',
      user_name: 'Rahim Uddin (University of Dhaka)',
      start_time: '2026-03-10T10:00:00Z',
      deadline: '2026-03-10T10:10:00Z',
      submitted_at: '2026-03-10T10:07:15Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_2'], q_46_05: ['opt_1'] },
      score: 5.0,
      total_marks: 5,
      correct_count: 5,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_02',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_nusrat',
      user_name: 'Nusrat Jahan (Jahangirnagar Univ.)',
      start_time: '2026-03-11T14:00:00Z',
      deadline: '2026-03-11T14:10:00Z',
      submitted_at: '2026-03-11T14:08:30Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_1'], q_46_05: ['opt_1'] },
      score: 3.5,
      total_marks: 5,
      correct_count: 4,
      incorrect_count: 1,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 2,
    },
    {
      id: 'att_03',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_tariq',
      user_name: 'Tariqul Islam (BUET / BCS Aspirant)',
      start_time: '2026-03-12T09:30:00Z',
      deadline: '2026-03-12T09:40:00Z',
      submitted_at: '2026-03-12T09:36:20Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_2'], q_46_05: ['opt_1'] },
      score: 5.0,
      total_marks: 5,
      correct_count: 5,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_04',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_sadia',
      user_name: 'Sadia Chowdhury (Chittagong Univ.)',
      start_time: '2026-03-13T11:00:00Z',
      deadline: '2026-03-13T11:10:00Z',
      submitted_at: '2026-03-13T11:07:40Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_2'], q_46_04: ['opt_2'], q_46_05: ['opt_1'] },
      score: 3.5,
      total_marks: 5,
      correct_count: 4,
      incorrect_count: 1,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 3,
    },
    {
      id: 'att_05',
      exam_id: 'ex_bank_pro_01',
      user_id: 'usr_mehdi',
      user_name: 'Mehdi Hasan (Rajshahi University)',
      start_time: '2026-03-14T15:00:00Z',
      deadline: '2026-03-14T15:08:00Z',
      submitted_at: '2026-03-14T15:06:50Z',
      answers: { q_bb_01: ['opt_4'], q_bb_02: ['opt_2'], q_46_02: ['opt_3'], q_46_04: ['opt_2'] },
      score: 4.0,
      total_marks: 4,
      correct_count: 4,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_06',
      exam_id: 'ex_bank_pro_01',
      user_id: 'usr_rahim',
      user_name: 'Rahim Uddin (University of Dhaka)',
      start_time: '2026-03-15T16:00:00Z',
      deadline: '2026-03-15T16:08:00Z',
      submitted_at: '2026-03-15T16:07:10Z',
      answers: { q_bb_01: ['opt_4'], q_bb_02: ['opt_2'], q_46_02: ['opt_3'], q_46_04: ['opt_1'] },
      score: 2.75,
      total_marks: 4,
      correct_count: 3,
      incorrect_count: 1,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 2,
    },
    {
      id: 'att_07',
      exam_id: 'ex_primary_free_01',
      user_id: 'usr_farzana',
      user_name: 'Farhana Yasmin (Comilla Victoria College)',
      start_time: '2026-03-16T18:00:00Z',
      deadline: '2026-03-16T18:05:00Z',
      submitted_at: '2026-03-16T18:03:45Z',
      answers: { q_prim_01: ['opt_1'], q_prim_02: ['opt_1'], q_prim_03: ['opt_2'], q_46_04: ['opt_2'] },
      score: 4.0,
      total_marks: 4,
      correct_count: 4,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_08',
      exam_id: 'ex_primary_free_01',
      user_id: 'usr_anika',
      user_name: 'Anika Tabassum (Eden Mohila College)',
      start_time: '2026-03-17T12:00:00Z',
      deadline: '2026-03-17T12:05:00Z',
      submitted_at: '2026-03-17T12:04:10Z',
      answers: { q_prim_01: ['opt_1'], q_prim_02: ['opt_1'], q_prim_03: ['opt_2'], q_46_04: ['opt_3'] },
      score: 2.75,
      total_marks: 4,
      correct_count: 3,
      incorrect_count: 1,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 2,
    },
    {
      id: 'att_09',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_tariq',
      user_name: 'Tariqul Islam (BUET / BCS Aspirant)',
      start_time: '2026-03-18T08:00:00Z',
      deadline: '2026-03-18T08:10:00Z',
      submitted_at: '2026-03-18T08:05:50Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_2'], q_46_05: ['opt_1'] },
      score: 5.0,
      total_marks: 5,
      correct_count: 5,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_10',
      exam_id: 'ex_primary_free_01',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      start_time: '2026-03-12T11:00:00Z',
      deadline: '2026-03-12T11:05:00Z',
      submitted_at: '2026-03-12T11:03:50Z',
      answers: { q_prim_01: ['opt_1'], q_prim_02: ['opt_1'], q_prim_03: ['opt_2'], q_46_04: ['opt_2'] },
      score: 4.0,
      total_marks: 4,
      correct_count: 4,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_11',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      start_time: '2026-03-14T09:00:00Z',
      deadline: '2026-03-14T09:10:00Z',
      submitted_at: '2026-03-14T09:06:40Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_2'], q_46_05: ['opt_1'] },
      score: 5.0,
      total_marks: 5,
      correct_count: 5,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_12',
      exam_id: 'ex_bank_pro_01',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      start_time: '2026-03-16T14:30:00Z',
      deadline: '2026-03-16T14:38:00Z',
      submitted_at: '2026-03-16T14:36:15Z',
      answers: { q_bb_01: ['opt_4'], q_bb_02: ['opt_2'], q_46_02: ['opt_3'], q_46_04: ['opt_2'] },
      score: 4.0,
      total_marks: 4,
      correct_count: 4,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
    {
      id: 'att_13',
      exam_id: 'ex_bcs_live_01',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      start_time: '2026-03-17T17:00:00Z',
      deadline: '2026-03-17T17:10:00Z',
      submitted_at: '2026-03-17T17:08:10Z',
      answers: { q_46_01: ['opt_2'], q_46_02: ['opt_3'], q_46_03: ['opt_1'], q_46_04: ['opt_1'], q_46_05: ['opt_1'] },
      score: 3.5,
      total_marks: 5,
      correct_count: 4,
      incorrect_count: 1,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 2,
    },
    {
      id: 'att_14',
      exam_id: 'ex_primary_free_01',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      start_time: '2026-03-18T10:15:00Z',
      deadline: '2026-03-18T10:20:00Z',
      submitted_at: '2026-03-18T10:18:05Z',
      answers: { q_prim_01: ['opt_1'], q_prim_02: ['opt_1'], q_prim_03: ['opt_2'], q_46_04: ['opt_2'] },
      score: 4.0,
      total_marks: 4,
      correct_count: 4,
      incorrect_count: 0,
      unanswered_count: 0,
      passed: true,
      status: 'submitted',
      rank: 1,
    },
  ];

  const membership_packages: MembershipPackage[] = [
    {
      id: 'pkg_sprint_7d',
      name: '7-Day Exam Sprint',
      name_bn: '৭ দিনের রিভিশন স্প্রিন্ট',
      duration_days: 7,
      price_bdt: 199,
      discount_price_bdt: 149,
      features: [
        'Access to all premium questions for 7 days',
        'Attempt live timed mock tests',
        'Step-by-step mathematical solutions',
        'Downloadable question paper PDFs',
      ],
      is_active: true,
      badge: 'Quick Revision',
    },
    {
      id: 'pkg_monthly_30d',
      name: '30-Day Complete Monthly Pass',
      name_bn: '৩০ দিনের সম্পূর্ণ প্রস্তুতি পাস',
      duration_days: 30,
      price_bdt: 499,
      discount_price_bdt: 399,
      features: [
        'Full access to BCS & Banking Premium Question Bank',
        'Unlimited mock tests with server ranking',
        'Subject-wise weak zone analytics',
        'Direct error reporting & mentor review',
        'Priority notice & exam updates',
      ],
      is_active: true,
      badge: 'Most Popular',
    },
    {
      id: 'pkg_pro_90d',
      name: '90-Day BCS & Govt Job Pro',
      name_bn: '৯০ দিনের বিসিএস ও সরকারি চাকরি স্পেশাল',
      duration_days: 90,
      price_bdt: 999,
      discount_price_bdt: 799,
      features: [
        '3 months full platform access',
        'All past 10 years solved papers',
        'Over 50+ live full-length mock exams',
        'All bank recruitment question collections',
        'High-speed ad-free experience',
      ],
      is_active: true,
      badge: 'Best Value',
    },
    {
      id: 'pkg_yearly_365d',
      name: '365-Day All-Access Annual Pass',
      name_bn: '১ বছরের অল-এক্সেস গোল্ডেন সাবস্ক্রিপশন',
      duration_days: 365,
      price_bdt: 2499,
      discount_price_bdt: 1799,
      features: [
        '365 days unlimited validity',
        'Access all upcoming 2026 new exam questions',
        'Exclusive premium study handouts',
        'Direct WhatsApp support community',
      ],
      is_active: true,
      badge: 'Comprehensive',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_demo_01',
      order_number: 'PRERONA-ORD-2026-001',
      user_id: 'usr_paid',
      user_name: 'Rahim Uddin (Pro Student)',
      user_email: 'rahim.bcs@gmail.com',
      package_id: 'pkg_monthly_30d',
      package_name: '30-Day Complete Monthly Pass',
      amount_bdt: 399,
      payment_method: 'bkash',
      transaction_id: 'BKS9A77X092',
      sender_number: '01711223344',
      status: 'approved',
      admin_notes: 'bKash merchant settlement verified.',
      created_at: '2026-03-01T09:30:00Z',
      approved_at: '2026-03-01T09:45:00Z',
      approved_by: 'Tanvir Hossain (Admin)',
    },
    {
      id: 'ord_demo_02',
      order_number: 'PRERONA-ORD-2026-002',
      user_id: 'usr_free',
      user_name: 'Nusrat Jahan (Free Candidate)',
      user_email: 'nusrat.prep@gmail.com',
      package_id: 'pkg_sprint_7d',
      package_name: '7-Day Exam Sprint',
      amount_bdt: 149,
      payment_method: 'nagad',
      transaction_id: 'NGD38K99L12',
      sender_number: '01611777888',
      status: 'pending',
      created_at: '2026-03-18T07:15:00Z',
    },
  ];

  const user_entitlements: UserEntitlement[] = [
    {
      id: 'ent_01',
      user_id: 'usr_paid',
      order_id: 'ord_demo_01',
      package_id: 'pkg_monthly_30d',
      starts_at: '2026-03-01T09:45:00Z',
      expires_at: '2026-03-31T23:59:59Z',
      is_active: true,
    },
  ];

  const ad_settings: AdSetting = {
    adsense_enabled: true,
    publisher_id: 'ca-pub-9847291847192841',
    header_slot_id: 'slot_header_728x90',
    sidebar_slot_id: 'slot_sidebar_300x250',
    content_slot_id: 'slot_inarticle_fluid',
  };

  const sponsor_campaigns: SponsorCampaign[] = [
    {
      id: 'spn_01',
      title: 'BCS Care - Premier Mock Test Series 2026',
      client_name: 'BCS Care Academy',
      banner_url: '/src/assets/images/sponsor_ad_career_hub_1792337525434.jpg',
      target_url: 'https://example.com/bcs-mock-registration',
      placement: 'header',
      starts_at: '2026-01-01T00:00:00Z',
      ends_at: '2026-12-31T23:59:59Z',
      is_active: true,
      impressions: 48920,
      clicks: 1845,
    },
    {
      id: 'spn_02',
      title: 'Bangladesh Bank Career Masterclass 2026',
      client_name: 'Bankers Club BD',
      banner_url: '/src/assets/images/banner_bangladesh_bank_1792337525073.jpg',
      target_url: 'https://example.com/bank-masterclass',
      placement: 'sidebar',
      starts_at: '2026-02-01T00:00:00Z',
      ends_at: '2026-10-30T23:59:59Z',
      is_active: true,
      impressions: 21400,
      clicks: 890,
    },
  ];

  const notices: Notice[] = [
    {
      id: 'not_01',
      title: '47th BCS Preliminary Exam Date Announced by BPSC',
      title_bn: 'বিপিএসসি কর্তৃক ৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষার সম্ভাব্য তারিখ প্রকাশ',
      content: 'The Bangladesh Public Service Commission has officially scheduled the preliminary test. Candidates are advised to practice previous questions and participate in online mock tests.',
      priority: 'urgent',
      is_published: true,
      publish_date: '2026-03-12',
    },
    {
      id: 'not_02',
      title: 'Combined 9 Banks Senior Officer Recruitment Circular Published',
      title_bn: 'সমন্বিত ৯ ব্যাংকে সিনিয়র অফিসার পদে বিশাল নিয়োগ বিজ্ঞপ্তি প্রকাশ',
      content: 'Bankers Selection Committee Secretariat has issued notification for general category senior officers. Online applications are accepted through the recruitment portal.',
      priority: 'normal',
      is_published: true,
      publish_date: '2026-03-05',
    },
    {
      id: 'not_03',
      title: 'Primary Assistant Teacher 3rd Phase Final Result Released',
      title_bn: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ৩য় ধাপের চূড়ান্ত ফলাফল প্রকাশিত',
      content: 'DPE has uploaded district-wise merit lists on the official website. Check cutoff marks and viva guidelines.',
      priority: 'normal',
      is_published: true,
      publish_date: '2026-02-28',
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'log_01',
      admin_id: 'usr_admin',
      admin_name: 'Tanvir Hossain (Admin)',
      action: 'ORDER_APPROVED',
      target_type: 'Order',
      target_id: 'ord_demo_01',
      details: 'Approved 30-Day Complete Monthly Pass for Rahim Uddin via bKash Txn BKS9A77X092.',
      timestamp: '2026-03-01T09:45:00Z',
    },
    {
      id: 'log_02',
      admin_id: 'usr_admin',
      admin_name: 'Tanvir Hossain (Admin)',
      action: 'QUESTION_PUBLISHED',
      target_type: 'QuestionPaper',
      target_id: 'qp_46_bcs',
      details: 'Published 46th BCS Preliminary Examination Question & Solution.',
      timestamp: '2024-05-01T10:00:00Z',
    },
  ];

  const bookmarks: Bookmark[] = [
    {
      id: 'bmk_01',
      user_id: 'usr_paid',
      paper_id: 'qp_46_bcs',
      question_id: 'q_46_02',
      created_at: '2026-03-10T11:00:00Z',
    },
    {
      id: 'bmk_02',
      user_id: 'usr_paid',
      paper_id: 'qp_bb_ad_2024',
      question_id: 'q_bb_02',
      created_at: '2026-03-14T15:20:00Z',
    },
    {
      id: 'bmk_03',
      user_id: 'usr_paid',
      paper_id: 'qp_primary_2024_phase3',
      question_id: 'q_prim_02',
      created_at: '2026-03-16T19:10:00Z',
    },
    {
      id: 'bmk_04',
      user_id: 'usr_paid',
      paper_id: 'qp_46_bcs',
      question_id: 'q_46_05',
      created_at: '2026-03-17T20:00:00Z',
    },
  ];

  return {
    users,
    categories,
    organizations,
    positions,
    subjects,
    question_papers,
    questions,
    exams,
    exam_attempts,
    membership_packages,
    orders,
    user_entitlements,
    ad_settings,
    sponsor_campaigns,
    notices,
    audit_logs,
    bookmarks,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = getInitialData();
        this.persist();
      }
    } else {
      this.data = getInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file', e);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, value: DatabaseSchema[K]): void {
    this.data[table] = value;
    this.persist();
  }

  public addAuditLog(adminId: string, adminName: string, action: string, targetType: string, targetId: string, details: string) {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      admin_id: adminId,
      admin_name: adminName,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.persist();
    return log;
  }
}

export const db = new Database();
