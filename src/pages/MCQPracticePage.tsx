import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { MCQPracticeSkeleton } from '../components/Skeleton.js';

export const MCQPracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paperId = searchParams.get('paper_id');
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getQuestions({ limit: 50 })
      .then(res => {
        setPapers(res.data);
        if (paperId) {
          const match = res.data.find((p: any) => p.id === paperId || p.slug === paperId);
          if (match) setSelectedPaper(match);
        } else if (res.data.length > 0) {
          setSelectedPaper(res.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [paperId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-800">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">এমসিকিউ প্র্যাকটিস এরিনা</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          বিষয়ভিত্তিক ও বিগত সালের এমসিকিউ প্র্যাকটিস
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          যেকোনো প্রশ্নপত্র বা বিষয় নির্বাচন করে আনলিমিটেড প্র্যাকটিস করুন এবং তাৎক্ষণিক ব্যাখ্যা দেখুন
        </p>
      </div>

      {loading ? (
        <MCQPracticeSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Pick a Question Paper */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            প্রশ্নপত্র নির্বাচন করুন
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {papers.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPaper(p)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                  selectedPaper?.id === p.id
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{p.exam_year} Examination</span>
                  <span className="font-semibold text-indigo-600 font-mono-numbers">{p.total_marks} Marks</span>
                </div>
                <p className="font-bold text-slate-900 line-clamp-2">{p.title_bn || p.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Selected Paper Launchpad */}
        <div className="lg:col-span-2">
          {selectedPaper ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-600">
                  {selectedPaper.category?.name_bn || 'প্রশ্নব্যাংক'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedPaper.title_bn || selectedPaper.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedPaper.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">সাল</span>
                  <strong className="text-slate-800 font-mono-numbers">{selectedPaper.exam_year}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">পূর্ণমান</span>
                  <strong className="text-slate-800 font-mono-numbers">{selectedPaper.total_marks} নম্বর</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">সময়কাল</span>
                  <strong className="text-slate-800 font-mono-numbers">{selectedPaper.duration_minutes} মিনিট</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  ৩টি ভিন্ন মোডে (উন্মুক্ত, লুকায়িত ও সাবমিট) অনুশীলন করতে পারবেন
                </span>
                <Link
                  to={`/questions/${selectedPaper.slug}`}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <span>অনুশীলন শুরু করুন</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              অনুগ্রহ করে বাঁ দিকের তালিকা থেকে একটি প্রশ্নপত্র নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};
