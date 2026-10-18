import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { SkillsHeatmap } from '../components/SkillsHeatmap.js';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Brain, 
  ListOrdered,
  Sparkles
} from 'lucide-react';

export const MyResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'history'>('heatmap');

  useEffect(() => {
    if (user) {
      ApiClient.getUserResults()
        .then(res => {
          setResults(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">লগইন প্রয়োজন</h2>
        <p className="text-xs text-slate-500">আপনার অতীতের পরীক্ষার ফলাফল ও স্কিলস হিটম্যাপ দেখতে অ্যাকাউন্টে সাইন-ইন করুন।</p>
        <Link to="/exams" className="text-xs text-indigo-600 font-semibold underline">
          মডেল টেস্ট দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/" className="hover:text-slate-800">হোম</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">দক্ষতা মূল্যায়ন ও ফলাফল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ব্যক্তিগত স্কিলস হিটম্যাপ ও পরীক্ষার স্কোর
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            বিষয়ভিত্তিক পারদর্শিতার ডিটেইল হিটম্যাপ ম্যাট্রিক্স এবং পূর্ববর্তী সকল মডেল টেস্টের বিশ্লেষণ
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>স্কিলস হিটম্যাপ (Skills Heatmap)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
            <span>পরীক্ষার তালিকা ({results.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: D3 Skills Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <SkillsHeatmap candidateId={user.id} />
        </div>
      )}

      {/* Tab 2: Test Attempt History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">অতীতের সকল মডেল টেস্টের ফলাফল</h3>
            <span className="text-xs text-slate-500 font-mono-numbers">মোট সম্পন্ন: {results.length} টি</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs">ফলাফল লোড হচ্ছে...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">আপনি এখনো কোনো অনলাইন মডেল টেস্টে অংশগ্রহণ করেননি।</p>
              <Link
                to="/exams"
                className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                এখনই মডেল টেস্ট দিন
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(att => (
                <div
                  key={att.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      <span className="text-slate-400 font-mono-numbers">
                        {new Date(att.submitted_at || att.start_time).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {att.exam?.title_bn || att.exam?.title || 'Model Test'}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>সঠিক: <strong className="text-emerald-600 font-mono-numbers">{att.correct_count}</strong></span>
                      <span>ভুল: <strong className="text-rose-600 font-mono-numbers">{att.incorrect_count}</strong></span>
                      <span>মেধা ক্রম: <strong className="text-indigo-600 font-mono-numbers">#{att.rank || 1}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">প্রাপ্ত নম্বর</span>
                      <span className="text-2xl font-extrabold text-slate-900 font-mono-numbers">
                        {att.score.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ {att.total_marks}</span>
                      </span>
                    </div>

                    <Link
                      to={`/results/${att.id}`}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>বিশ্লেষণ</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
