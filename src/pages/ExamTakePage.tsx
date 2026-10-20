import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { QuestionDetailSkeleton } from '../components/Skeleton.js';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  RotateCcw, 
  Send,
  Lock,
  Sparkles
} from 'lucide-react';

export const ExamTakePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const autoSaveTimerRef = useRef<any>(null);

  // 1. Fetch exam & start or resume attempt
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    ApiClient.getExamDetail(slug)
      .then(async res => {
        setExam(res.data.exam);
        setQuestions(res.data.questions);
        setIsRestricted(res.data.is_premium_restricted);

        if (res.data.is_premium_restricted) {
          setLoading(false);
          return;
        }

        // Initialize attempt on the server
        try {
          const attemptRes = await ApiClient.startExamAttempt(res.data.exam.id);
          const att = attemptRes.data;
          setAttempt(att);
          setAnswers(att.answers || {});

          // Calculate remaining time
          const deadline = new Date(att.deadline).getTime();
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
          setTimeLeftSeconds(remaining);
        } catch (e: any) {
          console.error('Failed to start attempt', e);
        } finally {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load exam', err);
        setLoading(false);
      });
  }, [slug]);

  // 2. Countdown timer loop
  useEffect(() => {
    if (!attempt || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeLeftSeconds]);

  // 3. Periodic autosave every 20 seconds
  useEffect(() => {
    if (!attempt) return;

    autoSaveTimerRef.current = setInterval(() => {
      ApiClient.saveExamAnswers(attempt.id, answers).catch(() => {});
    }, 20000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [attempt, answers]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [optionId],
    }));
  };

  const handleClearAnswer = (questionId: string) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleMarkReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const copy = new Set(prev);
      if (copy.has(questionId)) copy.delete(questionId);
      else copy.add(questionId);
      return copy;
    });
  };

  const handleFinalSubmit = async (forcedByTimeout = false) => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setConfirmModalOpen(false);

    try {
      const res = await ApiClient.submitExamAttempt(attempt.id, answers);
      navigate(`/results/${res.data.attempt.id}`);
    } catch (e: any) {
      alert(e.message || 'সাবমিট করতে সমস্যা হয়েছে');
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <QuestionDetailSkeleton count={5} />;
  }

  if (isRestricted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">এটি একটি প্রিমিয়াম মডেল টেস্ট</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          এই পরীক্ষায় অংশগ্রহণ করতে এবং অল-বাংলাদেশ লিডারবোর্ডে র‍্যাঙ্ক দেখতে আপনার অ্যাকাউন্টে একটি সক্রিয় প্রিমিয়াম প্যাকেজ প্রয়োজন।
        </p>
        <Link
          to="/premium"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> প্যাকেজ ক্রয় করুন
        </Link>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600 text-sm">এই পরীক্ষার কোনো প্রশ্ন সক্রিয় পাওয়া যায়নি।</p>
        <Link to="/exams" className="text-xs text-indigo-600 font-semibold underline">
          অন্যান্য মডেল টেস্ট দেখুন
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = answers[currentQ.id]?.[0];
  const isCurrentMarked = markedForReview.has(currentQ.id);

  // Statistics
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewedCount = markedForReview.size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Test Header & Synced Countdown Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            {exam.category?.name_bn || 'লাইভ মডেল টেস্ট'}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            {exam.title_bn || exam.title}
          </h1>
          <p className="text-xs text-slate-400">
            পরীক্ষার্থী: <strong className="text-slate-200">{user?.name || 'Candidate'}</strong>
          </p>
        </div>

        {/* Big Official Server Countdown Timer */}
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl self-start sm:self-auto">
          <Clock className={`w-5 h-5 ${timeLeftSeconds < 180 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">বাকি সময়</span>
            <span className={`text-2xl font-bold font-mono-numbers ${timeLeftSeconds < 180 ? 'text-rose-400' : 'text-white'}`}>
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Question Area (Left) + Question Palette (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Question Stage) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Question Index & Quick Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded font-mono-numbers">
              প্রশ্ন {currentIndex + 1} / {questions.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleMarkReview(currentQ.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isCurrentMarked
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isCurrentMarked ? 'রিভিউ মার্ক করা' : 'রিভিউ রাখুন'}</span>
              </button>

              {selectedOption && (
                <button
                  type="button"
                  onClick={() => handleClearAnswer(currentQ.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ক্লিয়ার</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-4 min-h-[140px]">
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.question_text_bn || currentQ.question_text}
            </p>

            {/* Answer Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options?.map((opt: any) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold ring-1 ring-indigo-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Previous / Next / Submit Navigation */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                পরবর্তী প্রশ্ন <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> পরীক্ষা সাবমিট করুন
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette & Overview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">প্রশ্ন নেভিগেশন প্যালেট</h3>

            {/* Status Counters Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="font-bold text-base block font-mono-numbers">{answeredCount}</span>
                <span className="text-[10px]">উত্তরকৃত</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                <span className="font-bold text-base block font-mono-numbers">{reviewedCount}</span>
                <span className="text-[10px]">রিভিউ মার্ক</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <span className="font-bold text-base block font-mono-numbers">{unansweredCount}</span>
                <span className="text-[10px]">অনুত্তরকৃত</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAns = Boolean(answers[q.id]);
                const isRev = markedForReview.has(q.id);
                const isCurr = currentIndex === idx;

                let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isAns && isRev) {
                  colorClasses = 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-amber-400';
                } else if (isAns) {
                  colorClasses = 'bg-emerald-600 text-white border-emerald-600';
                } else if (isRev) {
                  colorClasses = 'bg-amber-400 text-amber-950 border-amber-500';
                }

                if (isCurr) {
                  colorClasses += ' ring-2 ring-slate-900 ring-offset-1 font-extrabold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all font-mono-numbers ${colorClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Final Submit CTA */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> পরীক্ষা শেষ করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">আপনি কি পরীক্ষা সাবমিট করতে চান?</h3>
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
              <p>• মোট প্রশ্ন: <strong>{questions.length}</strong> টি</p>
              <p>• উত্তর প্রদান করেছেন: <strong className="text-emerald-700">{answeredCount}</strong> টি</p>
              <p>• উত্তর বাকি আছে: <strong className="text-rose-600">{unansweredCount}</strong> টি</p>
            </div>
            <p className="text-xs text-slate-500">
              সাবমিট করার পর আর উত্তর পরিবর্তন করা যাবে না। আপনার ফলাফল ও জাতীয় মেধা তালিকা এখনই হিসাব করা হবে।
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                {submitting ? 'সাবমিট হচ্ছে...' : 'হ্যাঁ, সাবমিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
