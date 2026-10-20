import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { Bell, Calendar, ArrowLeft } from 'lucide-react';
import { NoticeSkeleton } from '../components/Skeleton.js';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.getNotices()
      .then(res => {
        setNotices(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-slate-800">হোম</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">পরীক্ষার নোটিশ ও বিজ্ঞপ্তি</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          পরীক্ষা সংক্রান্ত সর্বশেষ বিজ্ঞপ্তি
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          বিপিএসসি, বাংলাদেশ ব্যাংক, প্রাথমিক শিক্ষা অধিদপ্তর ও শিক্ষক নিবন্ধনের অফিসিয়াল ঘোষণা
        </p>
      </div>

      {loading ? (
        <NoticeSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div key={notice.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {notice.priority === 'urgent' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      জরুরি
                    </span>
                  )}
                  <span className="text-slate-400 font-mono-numbers flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {notice.publish_date}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {notice.title_bn || notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
