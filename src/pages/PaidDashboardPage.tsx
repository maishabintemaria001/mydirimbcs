import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { SkillsHeatmap } from '../components/SkillsHeatmap.js';
import { AdSlot } from '../components/AdSlot.js';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Bookmark, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  User as UserIcon,
  BookOpen
} from 'lucide-react';

export const PaidDashboardPage: React.FC = () => {
  const { user, activeEntitlement } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'practice' | 'bookmarks' | 'orders'>('overview');

  // Pagination states for Exams
  const [examPage, setExamPage] = useState<number>(1);
  const [examLimit] = useState<number>(5);
  const [examSearch, setExamSearch] = useState<string>('');

  // Pagination states for Orders
  const [orderPage, setOrderPage] = useState<number>(1);
  const [orderLimit] = useState<number>(5);

  // Pagination states for Bookmarks
  const [bmkPage, setBmkPage] = useState<number>(1);
  const [bmkLimit] = useState<number>(6);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getStudentDashboard({ limit: 50 });
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি রেকর্ড প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  // Fallback data if needed
  const candidateUser = dashboardData?.user || user;
  const entitlement = dashboardData?.entitlement || activeEntitlement;
  const stats = dashboardData?.stats || {
    total_exams_taken: 0,
    avg_score: 0,
    best_score: 0,
    total_orders: 0,
    saved_bookmarks: 0,
  };
  const allAttempts = dashboardData?.exam_attempts || [];
  const allOrders = dashboardData?.orders || [];
  const allBookmarks = dashboardData?.bookmarks || [];

  // Filter and Paginate Exams
  const filteredAttempts = allAttempts.filter((att: any) => {
    if (!examSearch) return true;
    const term = examSearch.toLowerCase();
    const title = (att.exam?.title_bn || att.exam?.title || '').toLowerCase();
    return title.includes(term);
  });
  const totalExamPages = Math.ceil(filteredAttempts.length / examLimit) || 1;
  const paginatedAttempts = filteredAttempts.slice((examPage - 1) * examLimit, examPage * examLimit);

  // Paginate Orders
  const totalOrderPages = Math.ceil(allOrders.length / orderLimit) || 1;
  const paginatedOrders = allOrders.slice((orderPage - 1) * orderLimit, orderPage * orderLimit);

  // Paginate Bookmarks
  const totalBmkPages = Math.ceil(allBookmarks.length / bmkLimit) || 1;
  const paginatedBookmarks = allBookmarks.slice((bmkPage - 1) * bmkLimit, bmkPage * bmkLimit);

  const isPro = candidateUser?.role === 'paid_user' || Boolean(entitlement);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">হোম</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি</span>
      </div>

      {/* Profile & Entitlement Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-xl font-extrabold text-white shadow-sm shrink-0">
              {candidateUser?.name ? candidateUser.name.charAt(0) : 'প্ৰ'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {candidateUser?.name || 'শিক্ষার্থী'}
                </h1>
                {isPro ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>পেইড প্রো মেম্বার</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
                    ফ্রি শিক্ষার্থী (Candidate)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                ইমেইল: <strong className="text-white font-mono-numbers">{candidateUser?.email}</strong> · ফোন: <span className="font-mono-numbers">{candidateUser?.phone || '০১৭xxxxxxxx'}</span>
              </p>
              <p className="text-[11px] text-indigo-200/80">
                রেজিস্ট্রেশন: {new Date(candidateUser?.created_at || Date.now()).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Subscription Action Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2.5 self-start md:self-auto min-w-[260px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">বর্তমান প্যাকেজ:</span>
              <span className="font-bold text-amber-300">
                {entitlement ? (entitlement.package_name || 'প্রো মেম্বারশিপ') : 'ফ্রি মেম্বার'}
              </span>
            </div>

            {entitlement && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-slate-300">মেয়াদ বাকি:</span>
                <span className="font-bold text-emerald-400 font-mono-numbers">
                  {entitlement.remaining_days || 13} দিন
                </span>
              </div>
            )}

            <div className="pt-1">
              <Link
                to="/premium"
                className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{entitlement ? 'প্যাকেজ নবায়ন / পরিবর্তন' : 'প্রিমিয়ামে আপগ্রেড করুন'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Records Notice Banner (Strict Requirement: "সে ডিলেট করতে পারবেনা") */}
      <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs shadow-xs">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
            🔒 অপরিবর্তনীয় শিক্ষার্থী রেকর্ড নীতি (Immutable Records Policy)
          </h4>
          <p className="text-amber-900/90 leading-relaxed text-[11.5px]">
            পরীক্ষার স্বচ্ছতা, অ্যাকাডেমিক মূল্যায়নের বিশুদ্ধতা এবং জাতীয় মেধা তালিকার সুরক্ষা বজায় রাখতে এই ড্যাশবোর্ডে সংরক্ষিত আপনার কোনো পরীক্ষা, প্রাপ্ত নম্বর বা পেমেন্ট রেকর্ড ডিলিট বা এডিট করার অনুমতি নেই। আপনার সকল অংশগ্রহণ সুরক্ষিত ও অফিশিয়াল।
          </p>
        </div>
      </div>

      {/* 4 Key Performance Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Exams */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>সম্পন্ন পরীক্ষা</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {stats.total_exams_taken} <span className="text-xs font-normal text-slate-400">টি</span>
          </p>
          <p className="text-[11px] text-slate-500">জাতীয় মডেল টেস্ট</p>
        </div>

        {/* Avg Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>গড় প্রাপ্ত নম্বর</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono-numbers">
            {stats.avg_score} <span className="text-xs font-normal text-slate-400">pts</span>
          </p>
          <p className="text-[11px] text-slate-500">সার্বিক গড় স্কোর</p>
        </div>

        {/* Best Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>শীর্ষ রেকর্ড</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 font-mono-numbers">
            {stats.best_score} <span className="text-xs font-normal text-slate-400">pts</span>
          </p>
          <p className="text-[11px] text-slate-500">সর্বোচ্চ প্রাপ্ত ফলাফল</p>
        </div>

        {/* Bookmarks */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>সংরক্ষিত প্রশ্ন</span>
            <Bookmark className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-sky-600 font-mono-numbers">
            {stats.saved_bookmarks} <span className="text-xs font-normal text-slate-400">টি</span>
          </p>
          <p className="text-[11px] text-slate-500">রিভিশনের জন্য সেভ করা</p>
        </div>
      </div>

      {/* Responsive Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          📊 সার্বিক অগ্রগতি ও D3 স্কিলস হিটম্যাপ
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-all relative ${
            activeTab === 'exams'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          📝 মডেল টেস্ট ও পরীক্ষার ফলাফল ({allAttempts.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'bookmarks'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          📌 বুকমার্ককৃত প্রশ্নাবলী ({allBookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          💳 পেমেন্ট ও ইনভয়েস হিস্ট্রি ({allOrders.length})
        </button>
      </div>

      {/* Tab 1: Overview & D3 Skills Heatmap */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Integrated D3 Skills Heatmap */}
          <SkillsHeatmap candidateId={candidateUser?.id} />

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-white rounded-xl border border-indigo-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">নতুন মডেল টেস্ট দিন</h4>
                <p className="text-xs text-slate-500">
                  বিসিএস ও ব্যাংক জবসের চলমান লাইভ পরীক্ষায় অংশ নিয়ে প্রস্তুতি যাচাই করুন
                </p>
              </div>
              <Link
                to="/exams"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                পরীক্ষা শুরু করুন →
              </Link>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50/60 to-white rounded-xl border border-amber-100 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">টপ পারফরমার্স মেধা তালিকা</h4>
                <p className="text-xs text-slate-500">
                  জাতীয় পর্যায়ে শীর্ষ শিক্ষার্থীদের স্কোর ট্রেন্ড এবং র‍্যাঙ্কিং দেখুন
                </p>
              </div>
              <Link
                to="/leaderboard"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                মেধা তালিকা দেখুন →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Exam Attempts (Paginated, Responsive, Immutable) */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                সকল মডেল টেস্ট ও পরীক্ষার ফলাফল রেকর্ড
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার দেওয়া প্রতিটি পরীক্ষার সংরক্ষিত রেকর্ড (অপরিবর্তনীয়)
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="পরীক্ষার নাম খুঁজুন..."
                value={examSearch}
                onChange={(e) => {
                  setExamSearch(e.target.value);
                  setExamPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">কোনো পরীক্ষা রেকর্ড পাওয়া যায়নি</p>
              <Link
                to="/exams"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                এখনই একটি পরীক্ষা দিন
              </Link>
            </div>
          ) : (
            <>
              {/* Responsive Table for Desktop & Tablet */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">পরীক্ষার নাম</th>
                      <th className="py-3 px-4">তারিখ ও সময়</th>
                      <th className="py-3 px-4">পূর্ণমান</th>
                      <th className="py-3 px-4">প্রাপ্ত নম্বর</th>
                      <th className="py-3 px-4">সঠিক / ভুল</th>
                      <th className="py-3 px-4">জাতীয় মেধা</th>
                      <th className="py-3 px-4">ফলাফল</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAttempts.map((att: any) => (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {att.exam?.title_bn || att.exam?.title || 'মডেল টেস্ট পরীক্ষা'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono-numbers">
                          {new Date(att.submitted_at || att.start_time).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers text-slate-600">
                          {att.total_marks}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers font-bold text-indigo-700 text-sm">
                          {att.score?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers">
                          <span className="text-emerald-700 font-bold">{att.correct_count}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-rose-600 font-bold">{att.incorrect_count}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers font-semibold text-amber-700">
                          #{att.rank || 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{att.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            to={`/results/${att.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-md transition-colors"
                          >
                            <span>ফলাফল ও সমাধান</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                          {/* Indicator that delete is disabled */}
                          <span 
                            title="অফিশিয়াল মূল্যায়ন সুরক্ষায় পরীক্ষার রেকর্ড মুছে ফেলা নিষিদ্ধ"
                            className="inline-flex items-center text-slate-400 cursor-not-allowed p-1"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-mono-numbers">
                  মোট <strong>{filteredAttempts.length}</strong> টির মধ্যে{' '}
                  <strong>{(examPage - 1) * examLimit + 1}</strong> থেকে{' '}
                  <strong>{Math.min(examPage * examLimit, filteredAttempts.length)}</strong> দেখানো হচ্ছে
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExamPage((p) => Math.max(1, p - 1))}
                    disabled={examPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalExamPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExamPage(idx + 1)}
                      className={`w-7 h-7 rounded-lg font-mono-numbers text-xs font-bold transition-colors ${
                        examPage === idx + 1
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setExamPage((p) => Math.min(totalExamPages, p + 1))}
                    disabled={examPage === totalExamPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Bookmarks (Paginated) */}
      {activeTab === 'bookmarks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                সংরক্ষিত রিভিশন প্রশ্নসমূহ (Bookmarks)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                কঠিন বা গুরুত্বপূর্ণ যেসব প্রশ্ন আপনি পরবর্তীতে অনুশীলনের জন্য সেভ করেছেন
              </p>
            </div>
            <Link
              to="/bookmarks"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>বুকমার্ক মোডে যান</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allBookmarks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">বর্তমানে কোনো সংরক্ষিত প্রশ্ন নেই</p>
              <Link
                to="/questions"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                প্রশ্ন ব্যাংক থেকে বুকমার্ক করুন
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedBookmarks.map((bmk: any) => (
                  <div
                    key={bmk.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-indigo-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 line-clamp-1">
                        {bmk.paper?.title_bn || bmk.paper?.title || 'প্রশ্নপত্র'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-numbers">
                        {new Date(bmk.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium line-clamp-2">
                      {bmk.question?.question_text_bn || bmk.question?.question_text || 'অনুশীলনের প্রশ্নপত্র সংরক্ষণ'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        সংরক্ষিত
                      </span>
                      {bmk.paper?.slug && (
                        <Link
                          to={`/questions/${bmk.paper.slug}`}
                          className="text-indigo-600 font-bold text-[11px] hover:underline flex items-center gap-1"
                        >
                          <span>প্রশ্নটি সমাধান করুন</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalBmkPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-mono-numbers">
                    পৃষ্ঠা {bmkPage} / {totalBmkPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBmkPage((p) => Math.max(1, p - 1))}
                      disabled={bmkPage === 1}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBmkPage((p) => Math.min(totalBmkPages, p + 1))}
                      disabled={bmkPage === totalBmkPages}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 4: Orders & Invoices (Paginated, Immutable) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs animate-fade-in">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                পেমেন্ট ইনভয়েস ও মেম্বারশিপ ইতিহাস
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার সকল সাবস্ক্রিপশন ফি ও লেনদেন রসিদ (অপরিবর্তনীয় ও স্থায়ী)
              </p>
            </div>
            <Link
              to="/premium"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              নতুন প্যাকেজ কিনুন
            </Link>
          </div>

          {allOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">কোনো পেমেন্ট ইনভয়েস পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">অর্ডার নম্বর</th>
                      <th className="py-3 px-4">প্যাকেজ বিবরণ</th>
                      <th className="py-3 px-4">পরিমাণ (BDT)</th>
                      <th className="py-3 px-4">পেমেন্ট মেথড</th>
                      <th className="py-3 px-4">TrxID / প্রেরক</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedOrders.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono-numbers font-bold text-slate-900">
                          {ord.order_number || ord.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {ord.package_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers font-bold text-emerald-700">
                          ৳ {ord.amount_bdt}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers uppercase text-slate-700 font-semibold">
                          {ord.payment_method}
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers text-slate-600">
                          <div>{ord.transaction_id}</div>
                          <div className="text-[10px] text-slate-400">{ord.sender_number}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ord.status === 'approved' ? 'অনুমোদিত' : ord.status === 'pending' ? 'যাচাইাধীন' : 'প্রত্যাখ্যাত'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono-numbers text-slate-500 text-right">
                          {new Date(ord.created_at).toLocaleDateString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalOrderPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-mono-numbers">
                    মোট {allOrders.length} টির মধ্যে পৃষ্ঠা {orderPage} / {totalOrderPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                      disabled={orderPage === totalOrderPages}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Ad placement */}
      <AdSlot placement="footer" />
    </div>
  );
};
