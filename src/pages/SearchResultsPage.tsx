import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { AdSlot } from '../components/AdSlot.js';
import { SearchResultsSkeleton } from '../components/Skeleton.js';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Award, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const currentType = searchParams.get('type') || 'all';

  const [inputVal, setInputVal] = useState(query);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    query: string;
    total: number;
    categories: any[];
    subjects: any[];
    exams: any[];
    papers: any[];
    questions: any[];
  } | null>(null);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  const loadSearch = (q: string, type: string) => {
    if (!q.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    ApiClient.searchGlobal(q.trim(), type, 60)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error('Search error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSearch(query, currentType);
  }, [query, currentType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), ...(currentType !== 'all' ? { type: currentType } : {}) });
    }
  };

  const handleTypeChange = (type: string) => {
    const nextParams: Record<string, string> = { q: query };
    if (type !== 'all') {
      nextParams.type = type;
    }
    setSearchParams(nextParams);
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 rounded-xs px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const questionsList = data?.questions || [];
  const examsList = data?.exams || [];
  const papersList = data?.papers || [];
  const topicsList = [...(data?.categories || []), ...(data?.subjects || [])];
  const total = data?.total || 0;

  const trendingTags = [
    '৪৬তম বিসিএস',
    'বাংলাদেশ ব্যাংক এডি',
    'সমন্বিত ব্যাংক সিনিয়র অফিসার',
    'প্রাথমিক সহকারী শিক্ষক',
    'বাংলা সাহিত্য',
    'গাণিতিক যুক্তি',
    'বাংলাদেশ বিষয়াবলি',
    'সংবিধান',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">হোম</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">গ্লোবাল সার্চ রেজাল্ট</span>
      </div>

      {/* Header Search Box Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>প্ল্যাটফর্ম ব্যাপী গ্লোবাল অনুসন্ধান (Global Search)</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold">
            প্রশ্নব্যাংক, পরীক্ষা, ক্যাটাগরি ও বিষয়বস্তু খুঁজুন
          </h1>
          <p className="text-xs text-slate-300">
            বিগত সালের প্রশ্ন, নির্দিষ্ট বিষয়ের এমসিকিউ, পূর্ণাঙ্গ প্রশ্নপত্র এবং লাইভ অনলাইন মডেল টেস্ট এক জায়গায় খুঁজুন।
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <div className="flex items-center bg-white rounded-xl shadow-md p-1.5 border border-slate-200 text-slate-900">
            <div className="pl-3 pr-2 text-indigo-600">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="প্রশ্ন, বিষয়ের নাম, সাল বা পরীক্ষা লিখে সার্চ করুন..."
              className="w-full text-xs sm:text-sm py-2 px-1 focus:outline-none text-slate-900 font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              অনুসন্ধান
            </button>
          </div>
        </form>

        {/* Quick Trending Tags */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto pt-1">
          <span className="text-slate-400 shrink-0 font-medium">জনপ্রিয়:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {trendingTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputVal(tag);
                  setSearchParams({ q: tag });
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Banner AdSense */}
      <AdSlot placement="header" />

      {/* Results Controls & Filters */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            {query ? (
              <p className="text-sm font-bold text-slate-900">
                ‘<span className="text-indigo-600">{query}</span>’ অনুসন্ধানের জন্য মোট{' '}
                <span className="font-mono-numbers">{total}</span> টি ফলাফল পাওয়া গেছে
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-900">
                অনুগ্রহ করে সার্চ বক্সে কীওয়ার্ড লিখুন
              </p>
            )}
            <p className="text-xs text-slate-500">
              নির্দিষ্ট সেকশন অনুযায়ী দেখতে নিচের ফিল্টার ট্যাব নির্বাচন করুন
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => handleTypeChange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentType === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              সকল ({total})
            </button>
            <button
              onClick={() => handleTypeChange('questions')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                currentType === 'questions'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>প্রশ্নব্যাংক</span>
              {data && <span className="text-[10px] opacity-80 font-mono-numbers">({questionsList.length})</span>}
            </button>
            <button
              onClick={() => handleTypeChange('exams')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                currentType === 'exams'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>মডেল টেস্ট</span>
              {data && <span className="text-[10px] opacity-80 font-mono-numbers">({examsList.length})</span>}
            </button>
            <button
              onClick={() => handleTypeChange('papers')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                currentType === 'papers'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>প্রশ্নপত্র</span>
              {data && <span className="text-[10px] opacity-80 font-mono-numbers">({papersList.length})</span>}
            </button>
            <button
              onClick={() => handleTypeChange('topics')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                currentType === 'topics'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>বিষয় ও ক্যাটাগরি</span>
              {data && <span className="text-[10px] opacity-80 font-mono-numbers">({topicsList.length})</span>}
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="py-6">
            <SearchResultsSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!loading && query && total === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">কোনো ফলাফল পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">
                ‘{query}’ দিয়ে কোনো প্রশ্নপত্র, এমসিকিউ বা পরীক্ষা পাওয়া যায়নি। অনুগ্রহ করে বানান চেক করুন অথবা অন্যান্য সাধারণ কীওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link
                to="/questions"
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                সকল প্রশ্নপত্র ব্রাউজ করুন
              </Link>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {!loading && total > 0 && (
          <div className="space-y-10">
            {/* SECTION 1: SPECIFIC QUESTIONS */}
            {(currentType === 'all' || currentType === 'questions') && questionsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>নির্দিষ্ট প্রশ্ন ও সমাধান (MCQ Items)</span>
                    <span className="text-xs font-normal text-slate-500">({questionsList.length} টি)</span>
                  </h3>
                  <span className="text-xs text-indigo-600 font-bold">সরাসরি সমাধান ও ব্যাখ্যা</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionsList.map((q: any) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">
                            {q.subject_name || 'সাধারণ জ্ঞান'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono-numbers">
                            মান: {q.marks}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                          {highlightMatch(q.question_text, query)}
                        </h4>

                        {/* Options preview */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {q.options.slice(0, 4).map((opt: any, optIdx: number) => (
                              <div key={opt.id} className="truncate">
                                <span className="font-bold text-slate-400 mr-1">
                                  {['ক', 'খ', 'গ', 'ঘ'][optIdx] || optIdx + 1})
                                </span>
                                <span>{highlightMatch(opt.text_bn || opt.text, query)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] truncate">
                          {q.paper_title ? highlightMatch(q.paper_title, query) : 'বিগত সালের প্রশ্ন'}
                        </span>
                        <Link
                          to={q.link}
                          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
                        >
                          <span>সমাধান দেখুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: EXAMS */}
            {(currentType === 'all' || currentType === 'exams') && examsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>অনলাইন মডেল টেস্ট ও পরীক্ষা ({examsList.length} টি)</span>
                  </h3>
                  <Link to="/exams" className="text-xs text-emerald-700 font-bold hover:underline">
                    সকল পরীক্ষা দেখুন →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examsList.map((ex: any) => (
                    <div
                      key={ex.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            লাইভ মডেল টেস্ট
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {ex.category_name}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {highlightMatch(ex.title, query)}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {ex.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono-numbers">
                          <span>পূর্ণমান: <strong>{ex.total_marks}</strong></span>
                          <span>সময়: <strong>{ex.duration_minutes} মিনিট</strong></span>
                        </div>
                        <Link
                          to={ex.link}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>মডেল টেস্ট শুরু করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: QUESTION PAPERS */}
            {(currentType === 'all' || currentType === 'papers') && papersList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    <span>বিগত সালের প্রশ্নপত্র ({papersList.length} টি)</span>
                  </h3>
                  <Link to="/questions" className="text-xs text-sky-700 font-bold hover:underline">
                    প্রশ্নব্যাংক ব্রাউজ করুন →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {papersList.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono-numbers">
                            সাল {p.exam_year}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {p.category_name}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {highlightMatch(p.title, query)}
                        </h4>
                        <div className="text-xs text-slate-500">
                          {p.org_name && <span>{p.org_name} · </span>}
                          <span className="font-mono-numbers">{p.question_count} টি প্রশ্ন</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <Link
                          to={p.link}
                          className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>প্রশ্নপত্র অনুশীলন করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: TOPICS & CATEGORIES */}
            {(currentType === 'all' || currentType === 'topics') && topicsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>পরীক্ষার বিষয় ও ক্যাটাগরি ({topicsList.length} টি)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topicsList.map((item: any) => (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                          {item.type === 'category' ? 'ক্যাটাগরি' : 'টপিক / বিষয়'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                          {highlightMatch(item.title, query)}
                        </h4>
                        {item.paper_count !== undefined && (
                          <p className="text-[11px] text-slate-400 font-mono-numbers">
                            {item.paper_count} টি প্রশ্নপত্র
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-Content / Bottom AdSlot */}
      <AdSlot placement="question_bottom" />
    </div>
  );
};
