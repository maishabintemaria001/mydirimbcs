import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { ExamResultSkeleton } from '../components/Skeleton.js';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  Share2, 
  ArrowLeft,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const ExamResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    ApiClient.getExamResult(attemptId)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load result', err);
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return <ExamResultSkeleton />;
  }

  if (!data || !data.attempt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600 text-sm">পরীক্ষার ফলাফল পাওয়া যায়নি।</p>
        <Link to="/exams" className="text-xs text-indigo-600 font-semibold underline">
          সকল মডেল টেস্ট তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const { attempt, exam, questions } = data;
  const accuracy = Math.round((attempt.correct_count / (attempt.correct_count + attempt.incorrect_count || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> মডেল টেস্ট তালিকায় ফিরে যান
        </Link>
        <Link to={`/exams/${exam?.slug}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          পুনরায় পরীক্ষা দিন →
        </Link>
      </div>

      {/* Main Score Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
        attempt.passed ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950' : 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              attempt.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {attempt.passed ? 'উত্তীর্ণ (PASSED)' : 'অনুত্তীর্ণ (DID NOT PASS)'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {exam?.title_bn || exam?.title}
            </h1>
            <p className="text-xs text-slate-300">
              পরীক্ষার্থী: <strong className="text-white">{attempt.user_name}</strong> · সাবমিট তারিখ: {new Date(attempt.submitted_at || attempt.start_time).toLocaleDateString()}
            </p>
          </div>

          {/* Obtained Score Circle */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center min-w-[150px] border border-white/15 self-start sm:self-auto">
            <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">প্রাপ্ত নম্বর</p>
            <p className="text-4xl font-extrabold font-mono-numbers text-amber-300 my-1">
              {attempt.score.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-300">পূর্ণমান: {attempt.total_marks}</p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-[11px] text-slate-300">জাতীয় মেধা র‍্যাঙ্ক</p>
            <p className="text-2xl font-bold font-mono-numbers text-sky-300">
              #{attempt.rank || 1} <span className="text-xs font-normal text-slate-400">/ {attempt.total_participants || 1}</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-[11px] text-slate-300">সঠিক উত্তর</p>
            <p className="text-2xl font-bold font-mono-numbers text-emerald-400">
              {attempt.correct_count}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-[11px] text-slate-300">ভুল উত্তর</p>
            <p className="text-2xl font-bold font-mono-numbers text-rose-400">
              {attempt.incorrect_count}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-[11px] text-slate-300">সঠিকতার হার (Accuracy)</p>
            <p className="text-2xl font-bold font-mono-numbers text-amber-300">
              {accuracy}%
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Solution Review */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            প্রশ্নোত্তর ও বিশদ বিশ্লেষণ পর্যালোচনা
          </h2>
          <span className="text-xs text-slate-500 font-mono-numbers">
            {questions?.length} টি প্রশ্ন
          </span>
        </div>

        {questions?.map((q: any, idx: number) => {
          const userChoice = attempt.answers?.[q.id]?.[0];
          const isCorrect = userChoice && q.correct_option_ids?.includes(userChoice);
          const isAnswered = Boolean(userChoice);

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 sm:p-6 bg-white shadow-xs space-y-4 ${
                !isAnswered
                  ? 'border-slate-200'
                  : isCorrect
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 font-mono-numbers">প্রশ্ন নং #{idx + 1}</span>
                <span className="font-semibold">
                  {!isAnswered ? (
                    <span className="text-slate-400">অনুত্তরকৃত (০ নম্বর)</span>
                  ) : isCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+{q.marks || 1})
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> ভুল উত্তর (-{exam?.negative_mark_per_question || 0.25})
                    </span>
                  )}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {q.question_text_bn || q.question_text}
              </p>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options?.map((opt: any) => {
                  const isUserSelected = userChoice === opt.id;
                  const isOptionCorrect = q.correct_option_ids?.includes(opt.id);

                  let badgeStyle = 'bg-slate-50 border-slate-200 text-slate-700';

                  if (isOptionCorrect) {
                    badgeStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isUserSelected && !isOptionCorrect) {
                    badgeStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${badgeStyle}`}
                    >
                      <span>{opt.text}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOptionCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                            সঠিক উত্তর
                          </span>
                        )}
                        {isUserSelected && (
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">
                            আপনার উত্তর
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {q.explanation && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-1 mt-3">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>বিশদ ব্যাখ্যা ও শর্টকাট টেকনিক:</span>
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
