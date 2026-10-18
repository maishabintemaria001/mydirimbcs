import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { AdSlot } from '../components/AdSlot.js';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  CheckCircle, 
  Lock, 
  Calendar, 
  Clock, 
  Building2, 
  GraduationCap, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const QuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [loading, setLoading] = useState<boolean>(true);

  // Read current filters from URL params
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('category_id') || '';
  const organizationId = searchParams.get('organization_id') || '';
  const positionId = searchParams.get('position_id') || '';
  const year = searchParams.get('year') || '';
  const isPaid = searchParams.get('is_paid') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') || '1';

  // Load taxonomies once
  useEffect(() => {
    Promise.all([
      ApiClient.getCategories(),
      ApiClient.getOrganizations(),
      ApiClient.getYears(),
    ]).then(([catRes, orgRes, yrsRes]) => {
      setCategories(catRes.data);
      setOrganizations(orgRes.data);
      setYears(yrsRes.data);
    }).catch(err => console.error('Error fetching taxonomies', err));
  }, []);

  // When organization changes, update positions list
  useEffect(() => {
    ApiClient.getPositions(organizationId || undefined)
      .then(res => setPositions(res.data))
      .catch(() => {});
  }, [organizationId]);

  // Fetch filtered questions
  useEffect(() => {
    setLoading(true);
    ApiClient.getQuestions({
      q,
      category_id: categoryId,
      organization_id: organizationId,
      position_id: positionId,
      year,
      is_paid: isPaid,
      sort,
      page,
      limit: 10,
    })
      .then(res => {
        setPapers(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching questions', err);
        setLoading(false);
      });
  }, [q, categoryId, organizationId, positionId, year, isPaid, sort, page]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-800">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">বিগত সালের প্রশ্ন ও সমাধান</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          বিগত সালের পরীক্ষার প্রশ্নব্যাংক
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি নিয়োগ পরীক্ষার প্রশ্ন সমাধান, ব্যাখ্যা ও ডাউনলোড
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="কী-ওয়ার্ড দিয়ে প্রশ্ন খুঁজুন (যেমন: ৪৬তম বিসিএস, অংক, ইংরেজি, চর্যাপদ)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">ক্যাটাগরি</label>
            <select
              value={categoryId}
              onChange={(e) => updateFilter('category_id', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
              ))}
            </select>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">প্রতিষ্ঠান / সংস্থা</label>
            <select
              value={organizationId}
              onChange={(e) => updateFilter('organization_id', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="">সকল প্রতিষ্ঠান</option>
              {organizations.map(o => (
                <option key={o.id} value={o.id}>{o.name_bn || o.name}</option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">পদবী</label>
            <select
              value={positionId}
              onChange={(e) => updateFilter('position_id', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="">সকল পদ</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">পরীক্ষার সাল</label>
            <select
              value={year}
              onChange={(e) => updateFilter('year', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none font-mono-numbers"
            >
              <option value="">সকল সাল</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Free vs Paid */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">অ্যাক্সেস টাইপ</label>
            <select
              value={isPaid}
              onChange={(e) => updateFilter('is_paid', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="">সকল (ফ্রি ও পেইড)</option>
              <option value="false">শুধুমাত্র ফ্রি প্রশ্ন</option>
              <option value="true">প্রিমিয়াম স্পেশাল</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">সাজান (Sort)</label>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
            >
              <option value="newest">সর্বশেষ বছর আগে</option>
              <option value="oldest">পুরাতন সাল আগে</option>
              <option value="views">সর্বাধিক পঠিত</option>
            </select>
          </div>
        </div>

        {/* Active Filters count & reset button */}
        {(q || categoryId || organizationId || positionId || year || isPaid) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              ফিল্টার সক্রিয় করা আছে
            </span>
            <button
              onClick={handleResetFilters}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> সকল ফিল্টার মুছুন
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Question Papers + Sidebar Ad */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 Cols: Question Papers List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>মোট ফলাফল: <strong className="text-slate-800 font-mono-numbers">{pagination.total}</strong> টি প্রশ্নপত্র</span>
            <span>পৃষ্ঠা: {pagination.page} / {pagination.total_pages}</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">প্রশ্নপত্র লোড হচ্ছে...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <p className="text-slate-400 text-sm">কোনো প্রশ্নপত্র পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            papers.map(paper => (
              <div
                key={paper.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{paper.category?.name_bn || paper.category?.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-numbers">{paper.exam_year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{paper.organization?.name_bn || paper.organization?.name}</span>
                  </div>
                  {paper.is_paid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      <Lock className="w-3 h-3" /> Premium Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full self-start sm:self-auto">
                      <CheckCircle className="w-3 h-3" /> Free Access
                    </span>
                  )}
                </div>

                <Link to={`/questions/${paper.slug}`}>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug">
                    {paper.title_bn || paper.title}
                  </h2>
                </Link>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {paper.description}
                </p>

                {/* Specs and actions bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {paper.duration_minutes} মিনিট
                    </span>
                    <span>পূর্ণমান: <strong className="text-slate-700 font-mono-numbers">{paper.total_marks}</strong></span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono-numbers">{paper.view_count || 120}</span> বার পঠিত
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/questions/${paper.slug}`}
                      className="px-3.5 py-1.5 font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      সম্পূর্ণ সমাধান দেখুন
                    </Link>
                    <Link
                      to={`/mcq-practice?paper_id=${paper.id}`}
                      className="px-3.5 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    >
                      এমসিকিউ প্র্যাকটিস
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', String(pagination.page - 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.total_pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter('page', String(i + 1))}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    pagination.page === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => updateFilter('page', String(pagination.page + 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Dynamic Sidebar Ad & Study Tips */}
        <div className="space-y-6">
          <AdSlot placement="sidebar" />

          {/* Quick Notice Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-indigo-900">পরীক্ষার প্রস্তুতি টিপস</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              বিগত সালের প্রতিটি প্রশ্নের ব্যাকগ্রাউন্ড এবং প্রাসঙ্গিক অপশনগুলো বিশদভাবে পড়া জরুরি। প্রতিটি অপশন বিশ্লেষণ করলে একটি প্রশ্ন থেকে চার গুণ প্রস্তুতি নেওয়া যায়।
            </p>
            <Link
              to="/premium"
              className="block text-center py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              প্রিমিয়াম স্পেশাল আনলক করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
