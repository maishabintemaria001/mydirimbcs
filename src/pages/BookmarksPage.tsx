import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      ApiClient.getBookmarks()
        .then(res => {
          setBookmarks(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-800">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">সংরক্ষিত প্রশ্ন ও বুকমার্কস</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          বুকমার্ক করা প্রশ্নাবলী
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          কঠিন বা গুরুত্বপূর্ণ যেসব প্রশ্ন আপনি পরবর্তীতে রিভিশন দেওয়ার জন্য চিহ্নিত করেছেন
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">বুকমার্ক লোড হচ্ছে...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-sm">আপনার কোনো সংরক্ষিত প্রশ্ন নেই।</p>
          <Link to="/questions" className="text-xs text-indigo-600 font-semibold underline">
            প্রশ্নব্যাংক ব্রাউজ করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">{b.paper?.title_bn || b.paper?.title}</span>
                <span className="font-mono-numbers">{new Date(b.created_at).toLocaleDateString()}</span>
              </div>

              {b.question && (
                <p className="text-sm font-bold text-slate-900">
                  {b.question.question_text_bn || b.question.question_text}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/questions/${b.paper?.slug || b.paper_id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  প্রশ্নপত্রে যান <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
