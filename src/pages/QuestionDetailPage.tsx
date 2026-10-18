import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { AdSlot } from '../components/AdSlot.js';
import { 
  Clock, 
  Award, 
  Calendar, 
  Building2, 
  Eye, 
  Bookmark, 
  Share2, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lock, 
  ArrowLeft,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const QuestionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  
  // Interactive mode: 'visible' | 'hidden' | 'practice'
  const [mode, setMode] = useState<'visible' | 'hidden' | 'practice'>('visible');
  
  // For 'hidden' mode: set of question IDs whose answers are currently revealed
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // For 'practice' mode: user selections { [questionId]: [optionId] }
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  // Bookmarking state
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Error Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedQuestionId, setReportedQuestionId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    ApiClient.getQuestionDetail(slug)
      .then(res => {
        setPaper(res.data.paper);
        setQuestions(res.data.questions);
        setIsRestricted(res.data.is_premium_restricted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load question details', err);
        setLoading(false);
      });
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleBookmark = async (questionId?: string) => {
    if (!user) {
      showToast('বুকমার্ক করতে লগইন প্রয়োজন');
      return;
    }
    try {
      const res = await ApiClient.toggleBookmark(paper.id, questionId);
      setBookmarked(res.bookmarked);
      showToast(res.message);
    } catch {
      showToast('বুকমার্ক সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const toggleRevealAnswer = (qId: string) => {
    const updated = new Set(revealedIds);
    if (updated.has(qId)) {
      updated.delete(qId);
    } else {
      updated.add(qId);
    }
    setRevealedIds(updated);
  };

  const handleSelectOption = (qId: string, optId: string) => {
    if (practiceSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: [optId],
    }));
  };

  const handlePracticeSubmit = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let calculatedScore = 0;

    questions.forEach(q => {
      const selected = userAnswers[q.id] || [];
      if (selected.length === 0) {
        unanswered++;
      } else if (selected.every(s => q.correct_option_ids?.includes(s))) {
        correct++;
        calculatedScore += (q.marks || 1);
      } else {
        incorrect++;
        calculatedScore -= (q.negative_marks || 0.25);
      }
    });

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correct / (correct + incorrect || 1)) * 100) : 0;

    setScoreResult({
      total: totalQuestions,
      correct,
      incorrect,
      unanswered,
      score: Math.max(0, calculatedScore),
      accuracy,
    });
    setPracticeSubmitted(true);
    setMode('visible'); // switch to review mode
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('প্রশ্নপত্রের লিংক কপি করা হয়েছে');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportModalOpen(false);
    setReportText('');
    showToast('ধন্যবাদ! আপনার রিপোর্টটি আমাদের টিম পর্যালোচনা করবে।');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">প্রশ্নপত্র এবং সমাধান লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">প্রশ্নপত্রটি পাওয়া যায়নি</h2>
        <Link to="/questions" className="text-xs text-indigo-600 font-semibold underline">
          সকল প্রশ্ন তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> প্রশ্ন তালিকায় ফিরে যান
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleBookmark()}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              bookmarked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            <span>{bookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>শেয়ার</span>
          </button>
        </div>
      </div>

      {/* Question Paper Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-indigo-700">{paper.category?.name_bn || paper.category?.name}</span>
          <span aria-hidden="true">·</span>
          <span>{paper.organization?.name_bn || paper.organization?.name}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-numbers">{paper.exam_year} Examination</span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
          {paper.title_bn || paper.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {paper.description}
        </p>

        {/* Paper Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50">
            <p className="text-slate-400 text-[11px]">মোট পূর্ণমান</p>
            <p className="font-bold text-slate-800 font-mono-numbers">{paper.total_marks} Marks</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <p className="text-slate-400 text-[11px]">সময়কাল</p>
            <p className="font-bold text-slate-800 font-mono-numbers">{paper.duration_minutes} Minutes</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <p className="text-slate-400 text-[11px]">পরীক্ষার তারিখ</p>
            <p className="font-bold text-slate-800 font-mono-numbers">{paper.exam_date || 'N/A'}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50">
            <p className="text-slate-400 text-[11px]">প্রশ্ন সংখ্যা</p>
            <p className="font-bold text-slate-800 font-mono-numbers">{questions.length} টি প্রশ্ন</p>
          </div>
        </div>

        {/* Attachment download bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-indigo-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-indigo-900 font-medium">
            <Download className="w-4 h-4 text-indigo-600" />
            <span>অরিজিনাল প্রশ্নপত্রের পিডিএফ কপি ডাউনলোড করতে পারেন</span>
          </div>
          <button
            onClick={() => showToast('পিডিএফ ডাউনলোড শুরু হয়েছে (Demo Export)')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
          >
            পিডিএফ ডাউনলোড
          </button>
        </div>
      </div>

      {/* Dynamic Header Ad */}
      <AdSlot placement="question_bottom" />

      {/* Answer Visibility Modes Bar (Mode 1, 2, 3 as specified in prompt section 7) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">অনুশীলন ও উত্তর দৃশ্যমানতা মোড</h3>
          <p className="text-xs text-slate-500">আপনার পছন্দ অনুযায়ী অনুশীলনের ধরন বেছে নিন</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setMode('visible');
              setPracticeSubmitted(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'visible' && !practiceSubmitted
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            মোড ১: উত্তর দৃশ্যমান
          </button>
          <button
            onClick={() => {
              setMode('hidden');
              setPracticeSubmitted(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'hidden'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            মোড ২: উত্তর লুকানো
          </button>
          <button
            onClick={() => {
              setMode('practice');
              setPracticeSubmitted(false);
              setUserAnswers({});
              setScoreResult(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'practice' || practiceSubmitted
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            মোড ৩: প্র্যাকটিস ও সাবমিট
          </button>
        </div>
      </div>

      {/* If Practice Submitted: Score Card */}
      {practiceSubmitted && scoreResult && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">আপনার অনুশীলন স্কোরকার্ড</h3>
            <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/30 text-indigo-200 font-mono-numbers">
              সঠিকতার হার: {scoreResult.accuracy}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-white/10">
              <p className="text-xs text-slate-300">প্রাপ্ত নম্বর</p>
              <p className="text-2xl font-bold font-mono-numbers text-amber-300">{scoreResult.score.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <p className="text-xs text-slate-300">সঠিক উত্তর</p>
              <p className="text-2xl font-bold font-mono-numbers text-emerald-400">{scoreResult.correct}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <p className="text-xs text-slate-300">ভুল উত্তর</p>
              <p className="text-2xl font-bold font-mono-numbers text-rose-400">{scoreResult.incorrect}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <p className="text-xs text-slate-300">অনুত্তরকৃত</p>
              <p className="text-2xl font-bold font-mono-numbers text-slate-400">{scoreResult.unanswered}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 text-center pt-2">
            নিচে প্রশ্ন অনুযায়ী আপনার প্রদত্ত উত্তর এবং সঠিক উত্তর ও বিশদ ব্যাখ্যা মিলিয়ে নিন।
          </p>
        </div>
      )}

      {/* Premium Content Protection Banner */}
      {isRestricted && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-amber-900">এটি একটি প্রিমিয়াম প্রশ্নপত্র</h3>
          <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
            এই প্রশ্নপত্রের সম্পূর্ণ উত্তরমালা, গণিতের শর্টকাট সমাধান এবং বিশদ ব্যাখ্যা দেখার জন্য আপনার একটি সক্রিয় প্রিমিয়াম প্যাকেজ প্রয়োজন।
          </p>
          <div className="pt-2">
            <Link
              to="/premium"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> প্রিমিয়াম প্যাকেজ কিনুন (৳১৪৯ থেকে শুরু)
            </Link>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, index) => {
          const isRevealed = mode === 'visible' || revealedIds.has(q.id) || practiceSubmitted;
          const userSelectedOption = userAnswers[q.id]?.[0];

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Question Header & Subject */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 font-mono-numbers">প্রশ্ন নং #{index + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">মান: {q.marks || 1}</span>
                  <button
                    onClick={() => {
                      setReportedQuestionId(q.id);
                      setReportModalOpen(true);
                    }}
                    className="hover:text-rose-600 flex items-center gap-1 text-[11px]"
                    title="Report question error"
                  >
                    <AlertTriangle className="w-3 h-3" /> ভুল রিপোর্ট
                  </button>
                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    className="hover:text-indigo-600"
                    title="Bookmark this question"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {q.question_text_bn || q.question_text}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {q.options?.map((opt: any) => {
                  const isSelected = userSelectedOption === opt.id;
                  const isCorrect = q.correct_option_ids?.includes(opt.id);

                  let optionStyle = 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';

                  if (mode === 'practice' && !practiceSubmitted) {
                    if (isSelected) {
                      optionStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-600';
                    }
                  } else if (isRevealed) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isRestricted}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-colors ${optionStyle}`}
                    >
                      <span>{opt.text}</span>
                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mode 2: Reveal button if hidden */}
              {mode === 'hidden' && !isRevealed && !isRestricted && (
                <div className="pt-2">
                  <button
                    onClick={() => toggleRevealAnswer(q.id)}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    উত্তর ও ব্যাখ্যা দেখুন
                  </button>
                </div>
              )}

              {/* Solution & Explanation box */}
              {isRevealed && !isRestricted && q.explanation && (
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm space-y-1">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সঠিক উত্তর ও বিশদ ব্যাখ্যা:</span>
                  </p>
                  <p className="text-emerald-950 leading-relaxed font-sans">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practice Mode Submit Button */}
      {mode === 'practice' && !practiceSubmitted && !isRestricted && (
        <div className="sticky bottom-6 z-30 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            উত্তর দেওয়া হয়েছে: <strong className="text-slate-900 font-mono-numbers">{Object.keys(userAnswers).length}</strong> / {questions.length}
          </div>
          <button
            onClick={handlePracticeSubmit}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            অনুশীলন শেষ করুন ও স্কোর দেখুন
          </button>
        </div>
      )}

      {/* Error Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">প্রশ্নে কোনো ভুল পেয়েছেন?</h3>
            <p className="text-xs text-slate-500">
              প্রশ্নের ভুল অপশন, উত্তরমালা বা বানান সমস্যা সম্পর্কে নিচে লিখে সাবমিট করুন।
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="ভুলের বিবরণ এখানে লিখুন..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  রিপোর্ট সাবমিট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
