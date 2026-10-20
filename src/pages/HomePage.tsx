import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { AdSlot } from '../components/AdSlot.js';
import { TopPerformersSection } from '../components/TopPerformersSection.js';
import { Skeleton, QuestionPaperSkeleton, ExamListSkeleton } from '../components/Skeleton.js';
import { 
  Search, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  School, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
  Award,
  HelpCircle,
  LayoutDashboard,
  Shield,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { FreeAccessGuideModal } from '../components/FreeAccessGuideModal.js';
import { AuthModal } from '../components/AuthModal.js';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [freeGuideOpen, setFreeGuideOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    ApiClient.getHomeData()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load home data', err);
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6 text-indigo-600" />;
      case 'School': return <School className="w-6 h-6 text-emerald-600" />;
      default: return <GraduationCap className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white overflow-hidden py-14 lg:py-20">
        {/* Subtle decorative background mesh */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>১০ম থেকে ৪৬তম বিসিএস ও সকল ব্যাংক পরীক্ষার প্রশ্নব্যাংক</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                বিগত সালের প্রশ্ন সমাধান ও <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-amber-200">
                  রিয়েল-টাইম অনলাইন মডেল টেস্ট
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                বিসিএস প্রিলিমিনারি, বাংলাদেশ ব্যাংক এডি, প্রাথমিক শিক্ষক নিয়োগ এবং মন্ত্রণালয়ের সরকারি চাকরির বিগত বছরের প্রশ্ন নির্ভুল ব্যাখ্যাসহ অনুশীলন করুন।
              </p>

              {/* Prominent Question Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
                <div className="flex items-center bg-white rounded-xl shadow-xl p-1.5 border border-slate-200 text-slate-900">
                  <div className="pl-3 pr-2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="প্রশ্ন, পদ বা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন (যেমন: ৪৬তম বিসিএস, বাংলাদেশ ব্যাংক AD)..."
                    className="w-full py-2.5 px-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
                  >
                    অনুসন্ধান
                  </button>
                </div>

                {/* Quick year triggers */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                  <span className="text-slate-400">জনপ্রিয় বছর:</span>
                  {[2024, 2023, 2022, 2021].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => navigate(`/questions?year=${yr}`)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-slate-200 font-mono-numbers text-[11px]"
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Right Column: Hero Educational Image */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative aspect-16/9 lg:aspect-auto lg:h-[360px]">
                <img
                  src="/src/assets/images/hero_bcs_study_1792337524122.jpg"
                  alt="Bangladeshi students preparing for BCS and Bank recruitment"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white text-xs">
                    <p className="font-semibold text-white">নির্ভুল প্রশ্ন সমাধান ও ব্যাখ্যা</p>
                    <p className="text-slate-300 text-[11px]">প্রতিটি প্রশ্নের সাথে রেফারেন্স ও শর্টকাট টেকনিক</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers KPI Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl shadow-md border border-slate-200 p-4">
          <div className="p-3 text-center sm:text-left border-r border-slate-100 last:border-0">
            <p className="text-xs text-slate-600 font-medium">মোট প্রশ্নব্যাংক</p>
            <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
              {data?.stats?.total_questions ? `${data.stats.total_questions * 45}+` : '15,000+'}
            </p>
          </div>
          <div className="p-3 text-center sm:text-left border-r border-slate-100 last:border-0">
            <p className="text-xs text-slate-600 font-medium">সমাধানকৃত প্রশ্নপত্র</p>
            <p className="text-2xl font-bold text-indigo-600 font-mono-numbers">
              {data?.stats?.total_papers || '120+'}
            </p>
          </div>
          <div className="p-3 text-center sm:text-left border-r border-slate-100 last:border-0">
            <p className="text-xs text-slate-600 font-medium">অনলাইন মডেল টেস্ট</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono-numbers">
              {data?.stats?.total_exams || '48+'}
            </p>
          </div>
          <div className="p-3 text-center sm:text-left">
            <p className="text-xs text-slate-600 font-medium">পরীক্ষার্থী সংখ্যা</p>
            <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
              {data?.stats?.active_candidates ? `${data.stats.active_candidates * 250}+` : '35,000+'}
            </p>
          </div>
        </div>
      </div>

      {/* Role & Access Guidance Grid (Free Guest vs Paid Student vs Admin) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Free Guest Access */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  লগইন ছাড়াও উন্মুক্ত
                </span>
                <HelpCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ফ্রি শিক্ষার্থীদের সুবিধা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                কোনো অ্যাকাউন্ট বা লগইন ছাড়াই বিগত বছরের প্রশ্নব্যাংক, অফিশিয়াল সরকারি চাকরির সার্কুলার, বিষয়ভিত্তিক সিলেবাস ও ডেমো টেস্ট অনুশীলন করতে পারেন।
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFreeGuideOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>ফ্রি সুবিধা তালিকা দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Paid Student Dedicated Dashboard */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900">
                  স্থায়ী রেকর্ড ও বিশ্লেষণ
                </span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">পেইড শিক্ষার্থী ড্যাশবোর্ড</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                সকল পরীক্ষার ফলাফল, D3 স্কিলস হিটম্যাপ, বুকমার্ক, স্কোর ট্র্যাকিং ও পেমেন্ট হিস্ট্রি আজীবন সুরক্ষিত থাকে। রেকর্ড কখনো ডিলেট বা নষ্ট হয় না।
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-amber-200/60 flex items-center justify-between">
              <Link
                to="/dashboard"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors flex items-center gap-1"
              >
                <span>আমার ড্যাশবোর্ড খুলুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded">
                🔒 অডিটেড রেকর্ড
              </span>
            </div>
          </div>

          {/* Card 3: Admin & Content Manager */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900">
                  রোল-বেইজড অ্যাক্সেস
                </span>
                <Shield className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">এডমিন ও কন্টেন্ট ম্যানেজার</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                কন্টেন্ট ম্যানেজার প্রশ্ন ও পরীক্ষা পরিচালনা করতে পারেন; অ্যাডমিনিস্ট্রেটর পেমেন্ট অনুমোদন, ইউজার নিয়ন্ত্রণ ও স্পন্সর বিজ্ঞাপন পরিচালনা করেন।
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-indigo-200/60 flex items-center justify-between">
              <Link
                to="/admin"
                className="text-xs font-bold text-indigo-700 hover:text-indigo-950 transition-colors flex items-center gap-1"
              >
                <span>কন্ট্রোল প্যানেল দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Header Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="header" />
      </div>

      {/* Examination Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">পরীক্ষার ক্যাটাগরি</h2>
            <p className="text-xs text-slate-500">আপনার লক্ষ্য অনুযায়ী ক্যাটাগরি বেছে নিন</p>
          </div>
          <Link to="/questions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            সকল দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.categories?.map((cat: any) => (
            <Link
              key={cat.id}
              to={`/questions?category_id=${cat.id}`}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="p-2.5 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name_bn || cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                <div className="text-[11px] text-indigo-600 font-medium pt-1">
                  প্রশ্নপত্র ব্রাউজ করুন →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Student System: Free User vs Paid Dashboard Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>স্বচ্ছ শিক্ষার্থী মূল্যায়ন পলিসি</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ফ্রি ইউজার বনাম পেইড স্টুডেন্ট ড্যাশবোর্ড
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                কোনো লগইন ছাড়াই ফ্রি ইউজার হিসেবে বিগত প্রশ্নপত্র ও মেধা তালিকা পড়তে পারবেন। পেইড শিক্ষার্থীদের জন্য রয়েছে অপরিবর্তনীয় বিস্তারিত পরীক্ষার রেকর্ড ও D3 স্কিলস হিটম্যাপ সহ ডেডিকেটেড ড্যাশবোর্ড।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                পেইড ড্যাশবোর্ড দেখুন →
              </Link>
              <Link
                to="/premium"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                প্রিমিয়াম প্যাকেজ সমূহ
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
            {/* Free Candidate Features */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-200">
                  লগইন ছাড়া ফ্রি ইউজারের সুবিধাসমূহ:
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  ১০০% ফ্রি এক্সেস
                </span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>সকল বিগত বিসিএস ও ব্যাংক পরীক্ষার প্রশ্নপত্র ব্রাউজ ও সার্চ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>প্রতিটি বিষয়ের নমুনা প্রশ্ন ও নির্ভুল সমাধান ফ্রিতে পড়ার সুযোগ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>জাতীয় মেধা তালিকা ও টপ পারফরমার্সদের স্কোর ট্রেন্ড চার্ট দর্শন</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>সরকারি ও ব্যাংক চাকরির সর্বশেষ নোটিশ ও সার্কুলার দেখা</span>
                </li>
              </ul>
            </div>

            {/* Paid Student Features */}
            <div className="bg-white/10 rounded-xl p-5 border border-amber-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>পেইড স্টুডেন্টদের ডেডিকেটেড ড্যাশবোর্ড:</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold">
                  PRO MEMBER
                </span>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">★</span>
                  <span><strong>অপরিবর্তনীয় অ্যাক্টিভিটি হিস্ট্রি:</strong> পরীক্ষার সুরক্ষায় আপনার সকল মডেল টেস্ট ফলাফল স্থায়ীভাবে সংরক্ষিত থাকে</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">★</span>
                  <span><strong>D3 স্কিলস হিটম্যাপ:</strong> বিষয়ভিত্তিক নির্ভুলতা ও ঘাটতির রিয়েল-টাইম ডাটা চার্ট</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">★</span>
                  <span><strong>পেজিনেশন সমৃদ্ধ ড্যাশবোর্ড:</strong> সকল পরীক্ষার বিস্তারিত নম্বরপত্র, ভুল উত্তর ও র‍্যাঙ্কিং ট্র্যাকিং</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">★</span>
                  <span>সকল প্রিমিয়াম পূর্ণাঙ্গ প্রশ্নব্যাংক ও লাইভ টাইমার মডেল টেস্টে আনলিমিটেড অংশগ্রহণ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Solved Question Papers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">সাম্প্রতিক প্রশ্ন ও নির্ভুল সমাধান</h2>
            <p className="text-xs text-slate-500">সদ্য অনুষ্ঠিত পরীক্ষার প্রশ্নপত্র এবং বিষয়ভিত্তিক বিশ্লেষণ</p>
          </div>
          <Link to="/questions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            সকল প্রশ্নপত্র ({data?.featured_papers?.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-3/4 h-6 rounded-md" />
                <Skeleton className="w-full h-10 rounded-md" />
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <Skeleton className="w-16 h-4 rounded-md" />
                  <Skeleton className="w-20 h-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.featured_papers?.map((paper: any) => (
            <div
              key={paper.id}
              className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-indigo-700">{paper.exam_year} Examination</span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.duration_minutes} Minutes</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700">{paper.total_marks} Marks</span>
                </div>

                <Link to={`/questions/${paper.slug}`}>
                  <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug">
                    {paper.title_bn || paper.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {paper.description}
                </p>

                {/* Tags / Metadata without pill boxes */}
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 flex-wrap">
                  {paper.tags?.slice(0, 3).map((tag: string, idx: number) => (
                    <span key={idx}>#{tag}</span>
                  ))}
                  {paper.is_paid && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 ml-auto">
                      <Lock className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/questions/${paper.slug}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  উত্তর ও ব্যাখ্যা দেখুন →
                </Link>
                <Link
                  to={`/mcq-practice?paper_id=${paper.id}`}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                >
                  প্র্যাকটিস শুরু
                </Link>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>

      {/* Live Online Exams Section */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 mb-2">
                <span>🔴 লাইভ পরীক্ষা চলমান</span>
              </div>
              <h2 className="text-2xl font-bold">অনলাইন মডেল টেস্ট ও র‍্যাঙ্কিং</h2>
              <p className="text-xs text-slate-400">টাইমার ও নেগেটিভ মার্কিং সহ নিজেকে যাচাই করুন</p>
            </div>
            <Link
              to="/exams"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              সকল মডেল টেস্ট দেখুন
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-4 bg-slate-700" />
                    <Skeleton className="w-16 h-4 bg-slate-700" />
                  </div>
                  <Skeleton className="w-3/4 h-6 bg-slate-700" />
                  <Skeleton className="w-full h-10 bg-slate-700" />
                  <div className="pt-4 border-t border-slate-700 flex justify-between">
                    <Skeleton className="w-20 h-4 bg-slate-700" />
                    <Skeleton className="w-24 h-8 rounded-lg bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data?.recent_exams?.map((exam: any) => (
              <div key={exam.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {exam.duration_minutes} মিনিট
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      পূর্ণমান: {exam.total_marks}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {exam.title_bn || exam.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-700/60">
                    <p>• পাস নম্বর: {exam.pass_marks}</p>
                    <p>• প্রতি ভুল উত্তরে কর্তন: -{exam.negative_mark_per_question}</p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    {exam.is_paid ? '⭐ Premium Test' : '🟢 Free Test'}
                  </span>
                  <Link
                    to={`/exams/${exam.slug}`}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    পরীক্ষা শুরু
                  </Link>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* D3 Top Performers & Exam Score Trends Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TopPerformersSection />
      </div>

      {/* Premium Membership Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Premium Access</span>
          <h2 className="text-2xl font-bold text-slate-900">সেরা প্রস্তুতি নিশ্চিত করতে প্রিমিয়াম প্যাকেজ</h2>
          <p className="text-xs text-slate-500">
            বিকাশ, নগদ বা রকেটের মাধ্যমে সহজে সাবস্ক্রিপশন নিন এবং সকল পেইড প্রশ্নপত্র ও আনলিমিটেড মডেল টেস্ট আনলক করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.packages?.map((pkg: any) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-6 bg-white border flex flex-col justify-between transition-all ${
                pkg.badge ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg' : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {pkg.badge && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {pkg.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{pkg.name_bn || pkg.name}</h3>
                
                <div className="flex items-baseline gap-1 font-mono-numbers">
                  <span className="text-3xl font-extrabold text-slate-900">৳{pkg.discount_price_bdt || pkg.price_bdt}</span>
                  {pkg.discount_price_bdt && (
                    <span className="text-xs text-slate-400 line-through">৳{pkg.price_bdt}</span>
                  )}
                  <span className="text-xs text-slate-500">/{pkg.duration_days} দিন</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  {pkg.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  to={`/premium?pkg=${pkg.id}`}
                  className="w-full block text-center py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  প্যাকেজটি কিনুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Notices & Updates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">জরুরি পরীক্ষার নোটিশ ও সার্কুলার</h3>
            <Link to="/notices" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              সকল নোটিশ দেখুন →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.notices?.map((n: any) => (
              <div key={n.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {n.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    )}
                    <h4 className="text-sm font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer">
                      {n.title_bn || n.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">{n.content}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap font-mono-numbers shrink-0">
                  {n.publish_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <FreeAccessGuideModal
        isOpen={freeGuideOpen}
        onClose={() => setFreeGuideOpen(false)}
        onOpenLogin={() => {
          setFreeGuideOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />
    </div>
  );
};
