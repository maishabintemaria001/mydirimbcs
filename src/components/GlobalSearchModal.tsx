import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { 
  Search, 
  X, 
  HelpCircle, 
  FileText, 
  Award, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  TrendingUp, 
  CornerDownLeft, 
  SlidersHorizontal 
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<'all' | 'questions' | 'exams' | 'papers' | 'topics'>('all');
  const [results, setResults] = useState<{
    total: number;
    categories: any[];
    subjects: any[];
    exams: any[];
    papers: any[];
    questions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      ApiClient.searchGlobal(query.trim(), activeType, 20)
        .then(res => {
          setResults(res.data);
        })
        .catch(err => {
          console.error('Global search error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, activeType]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectLink = (url: string) => {
    onClose();
    navigate(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}${activeType !== 'all' ? `&type=${activeType}` : ''}`);
    }
  };

  const trendingTags = [
    '৪৬তম বিসিএস প্রিলিমিনারি',
    '৪৫তম বিসিএস',
    'বাংলাদেশ ব্যাংক সহকারী পরিচালক',
    'সমন্বিত ৮ ব্যাংক সিনিয়র অফিসার',
    'প্রাথমিক সহকারী শিক্ষক নিয়োগ',
    'বাংলা ভাষা ও ব্যাকরণ',
    'বাংলাদেশ বিষয়াবলি',
    'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    'সংবিধান ও মুক্তিযুদ্ধ',
    'সাধারণ বিজ্ঞান ও আইসিটি',
  ];

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

  const questionsList = results?.questions || [];
  const examsList = results?.exams || [];
  const papersList = results?.papers || [];
  const topicsList = [...(results?.categories || []), ...(results?.subjects || [])];

  const totalResults = (results?.total || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-indigo-600 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="প্রশ্ন, বিষয়, সাল বা পরীক্ষা খুঁজুন (যেমন: ৪৬তম বিসিএস, গাণিতিক যুক্তি, ব্যাংক এডি)..."
            className="w-full px-3 py-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0 mr-2" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(null);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 mr-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            <span>খুঁজুন</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs font-semibold">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>ফিল্টার:</span>
          </span>
          <button
            type="button"
            onClick={() => setActiveType('all')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 ${
              activeType === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            সকল (All)
          </button>
          <button
            type="button"
            onClick={() => setActiveType('questions')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeType === 'questions'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>প্রশ্নব্যাংক (MCQs)</span>
            {results && <span className="text-[10px] opacity-80 font-mono-numbers">({questionsList.length})</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveType('exams')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeType === 'exams'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>মডেল টেস্ট (Exams)</span>
            {results && <span className="text-[10px] opacity-80 font-mono-numbers">({examsList.length})</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveType('papers')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeType === 'papers'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>প্রশ্নপত্র (Papers)</span>
            {results && <span className="text-[10px] opacity-80 font-mono-numbers">({papersList.length})</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveType('topics')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeType === 'topics'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>বিষয় ও ক্যাটাগরি</span>
            {results && <span className="text-[10px] opacity-80 font-mono-numbers">({topicsList.length})</span>}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Default / Trending State when query is empty */}
          {!query.trim() && (
            <div className="space-y-5 py-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>জনপ্রিয় অনুসন্ধান ও টপিক (Trending Topics)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(tag);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2.5">
                  দ্রুত এক্সেস (Quick Platform Sections)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectLink('/questions')}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-200 flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">বিগত সালের প্রশ্নপত্র</p>
                        <p className="text-[11px] text-slate-500">১০ম-৪৬তম বিসিএস ও সকল সরকারি ব্যাংক</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLink('/exams')}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200 flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">অনলাইন মডেল টেস্ট</p>
                        <p className="text-[11px] text-slate-500">নেগেটিভ মার্কিং ও লাইভ র‍্যাঙ্ক ট্র্যাকার</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLink('/mcq-practice')}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-sky-200 flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">বিষয়ভিত্তিক এমসিকিউ অনুশীলন</p>
                        <p className="text-[11px] text-slate-500">অধ্যায়ভিত্তিক প্রশ্ন ও নির্ভুল ব্যাখ্যা</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLink('/leaderboard')}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-amber-200 flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">টপ পারফরমার্স ও মেধা তালিকা</p>
                        <p className="text-[11px] text-slate-500">সাপ্তাহিক ও মাসিক শীর্ষ স্কোরারদের তালিকা</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {query.trim() && results && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  ‘<strong>{query}</strong>’ অনুসন্ধান করে <strong>{totalResults}</strong> টি ফলাফল পাওয়া গেছে
                </span>
                {totalResults > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>বিস্তারিত পেজে দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Zero State */}
              {totalResults === 0 && !loading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    ‘{query}’ সম্পর্কিত কোনো প্রশ্ন, পরীক্ষা বা ক্যাটাগরি পাওয়া যায়নি। বানানের সঠিকতা যাচাই করুন অথবা অন্যান্য কীওয়ার্ড চেষ্টা করুন।
                  </p>
                </div>
              )}

              {/* SECTION 1: SPECIFIC QUESTIONS */}
              {(activeType === 'all' || activeType === 'questions') && questionsList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-indigo-900">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>নির্দিষ্ট প্রশ্ন ও সমাধান ({questionsList.length})</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {questionsList.map((q: any) => (
                      <div
                        key={q.id}
                        onClick={() => handleSelectLink(q.link)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-relaxed">
                            {highlightMatch(q.question_text, query)}
                          </p>
                          <span className="shrink-0 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            MCQ
                          </span>
                        </div>

                        {/* Options preview */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg">
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

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="truncate">
                            {q.paper_title ? highlightMatch(q.paper_title, query) : 'বিগত সালের প্রশ্নপত্র'}
                            {q.paper_year && ` · ${q.paper_year}`}
                          </span>
                          <span className="text-indigo-600 font-semibold group-hover:underline shrink-0">
                            ব্যাখ্যা ও উত্তর দেখুন →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: EXAMS */}
              {(activeType === 'all' || activeType === 'exams') && examsList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>লাইভ ও প্র্যাকটিস মডেল টেস্ট ({examsList.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {examsList.map((ex: any) => (
                      <div
                        key={ex.id}
                        onClick={() => handleSelectLink(ex.link)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-200 transition-all cursor-pointer group flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded">
                              মডেল টেস্ট
                            </span>
                            {ex.category_name && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {ex.category_name}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {highlightMatch(ex.title, query)}
                          </h5>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono-numbers">
                            <span>পূর্ণমান: {ex.total_marks}</span>
                            <span>সময়: {ex.duration_minutes} মিনিট</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                        >
                          পরীক্ষা শুরু →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: QUESTION PAPERS */}
              {(activeType === 'all' || activeType === 'papers') && papersList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-sky-900">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>বিগত সালের প্রশ্নপত্র ({papersList.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {papersList.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectLink(p.link)}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-sky-50/40 hover:border-sky-200 transition-all cursor-pointer group flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.2 rounded font-mono-numbers">
                              {p.exam_year}
                            </span>
                            {p.category_name && (
                              <span className="text-[11px] text-slate-500">
                                {p.category_name}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {highlightMatch(p.title, query)}
                          </h5>
                        </div>
                        <span className="text-xs text-sky-600 font-bold group-hover:underline shrink-0 flex items-center gap-1">
                          <span>প্রশ্নপত্র</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: TOPICS & CATEGORIES */}
              {(activeType === 'all' || activeType === 'topics') && topicsList.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-amber-900">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>পরীক্ষার বিষয় ও ক্যাটাগরি ({topicsList.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topicsList.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectLink(item.link)}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-amber-50/40 hover:border-amber-200 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                            {item.type === 'category' ? 'ক্যাটাগরি' : 'বিষয় / টপিক'}
                          </span>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 mt-1">
                            {highlightMatch(item.title, query)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Key Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">Esc</kbd> বন্ধ করতে
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">Enter</kbd> পুরো পেজে সার্চ করতে
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">⌘K</kbd> যে কোনো সময় খুলুন
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            পূর্ণাঙ্গ সার্চ রেজাল্ট পেজ →
          </button>
        </div>
      </div>
    </div>
  );
};
