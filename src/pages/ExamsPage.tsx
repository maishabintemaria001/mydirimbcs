import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { AdSlot } from '../components/AdSlot.js';
import { ExamListSkeleton } from '../components/Skeleton.js';
import { 
  Clock, 
  Award, 
  CheckCircle, 
  Lock, 
  AlertCircle, 
  ChevronRight, 
  BookOpen,
  Sparkles
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getExams()
      .then(res => {
        setExams(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load exams', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-800">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">অনলাইন পরীক্ষা ও মডেল টেস্ট</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          অনলাইন মডেল টেস্ট ও রিয়েল-টাইম মূল্যায়ন
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          অফিসিয়াল সময়সীমা, নেগেটিভ মার্কিং এবং সারা দেশের পরীক্ষার্থীদের সাথে মেধা তালিকার র‍্যাঙ্কিং
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Exam Cards */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <ExamListSkeleton count={4} />
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              বর্তমানে কোনো সক্রিয় মডেল টেস্ট নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার দেখুন।
            </div>
          ) : (
            exams.map(exam => (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{exam.category?.name_bn || exam.category?.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exam.question_count} টি প্রশ্ন</span>
                    <span aria-hidden="true">·</span>
                    <span>সর্বোচ্চ চেষ্টা: {exam.attempt_limit} বার</span>
                  </div>

                  {exam.is_paid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      <Lock className="w-3 h-3" /> Pro Mock Exam
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full self-start sm:self-auto">
                      <CheckCircle className="w-3 h-3" /> Free Mock Exam
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {exam.title_bn || exam.title}
                </h2>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {exam.description}
                </p>

                {/* Exam Rules Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">সময়কাল</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 font-mono-numbers">
                      <Clock className="w-3 h-3 text-indigo-600" /> {exam.duration_minutes} মিনিট
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">মোট পূর্ণমান</span>
                    <span className="font-bold text-slate-800 font-mono-numbers">{exam.total_marks} নম্বর</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">পাস মার্কস</span>
                    <span className="font-bold text-emerald-700 font-mono-numbers">{exam.pass_marks} নম্বর</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">নেগেটিভ মার্ক</span>
                    <span className="font-bold text-rose-600 font-mono-numbers">-{exam.negative_mark_per_question} / ভুল</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    উত্তর প্রকাশ: পরীক্ষা সাবমিটের পর
                  </span>
                  <Link
                    to={`/exams/${exam.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <span>পরীক্ষা শুরু করুন</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Guidelines */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <span>অনলাইন পরীক্ষা নির্দেশিকা</span>
            </h3>
            <ul className="space-y-2.5 text-slate-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">১.</span>
                <span>পরীক্ষা শুরু করার পর টাইমার স্বয়ংক্রিয়ভাবে চলতে থাকবে।</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">২.</span>
                <span>নির্দিষ্ট সময় পার হলে সার্ভারে উত্তরপত্র স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">৩.</span>
                <span>সঠিক উত্তরের জন্য প্রশ্ন নির্ধারিত মান এবং ভুল উত্তরের জন্য কর্তন প্রযোজ্য।</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">৪.</span>
                <span>সাবমিট করার সাথে সাথেই তাৎক্ষণিক ফলাফল, সমাধান ও মেধা তালিকা দেখা যাবে।</span>
              </li>
            </ul>
          </div>

          <AdSlot placement="sidebar" />
        </div>
      </div>
    </div>
  );
};
