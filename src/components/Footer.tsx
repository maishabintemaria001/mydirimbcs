import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                প্ৰ
              </span>
              <span>Prerona Exam Portal</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              বাংলাদেশের প্রথম পূর্ণাঙ্গ অনলাইন বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি চাকরি পরীক্ষার প্রশ্নব্যাংক এবং রিয়েল-টাইম মডেল টেস্ট প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Solutions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span>Official BPSC & BB Patterns</span>
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Question Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/questions?category_id=cat_bcs" className="hover:text-white transition-colors">বিসিএস প্রিলিমিনারি (BCS)</Link></li>
              <li><Link to="/questions?category_id=cat_bank" className="hover:text-white transition-colors">বাংলাদেশ ব্যাংক ও সমন্বিত ব্যাংক</Link></li>
              <li><Link to="/questions?category_id=cat_primary" className="hover:text-white transition-colors">প্রাথমিক সহকারী শিক্ষক নিয়োগ</Link></li>
              <li><Link to="/questions?category_id=cat_ntrca" className="hover:text-white transition-colors">এনটিআরসিএ শিক্ষক নিবন্ধন</Link></li>
              <li><Link to="/questions?category_id=cat_varsity" className="hover:text-white transition-colors">বিশ্ববিদ্যালয় ভর্তি পরীক্ষা</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Study Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/questions" className="hover:text-white transition-colors">বিগত সালের প্রশ্ন ও সমাধান</Link></li>
              <li><Link to="/mcq-practice" className="hover:text-white transition-colors">বিষয়ভিত্তিক এমসিকিউ প্র্যাকটিস</Link></li>
              <li><Link to="/exams" className="hover:text-white transition-colors">লাইভ অনলাইন মডেল টেস্ট</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors text-amber-300 font-medium">টপ পারফরমার্স ও মেধা তালিকা</Link></li>
              <li><Link to="/premium" className="hover:text-white transition-colors">প্রিমিয়াম প্যাকেজ ও মেম্বারশিপ</Link></li>
              <li><Link to="/notices" className="hover:text-white transition-colors">পরীক্ষার নোটিশ ও রুটিন</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Support & Office</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+880 1711-000111 (10 AM - 8 PM)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>support@prerona.edu.bd</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Panthapath, Dhaka-1205, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Prerona Exam Portal. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <p className="flex items-center gap-1.5 text-slate-400">
              <span>ডেভেলপমেন্ট ও আইটি সাপোর্ট:</span>
              <a
                href="https://tazora.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors hover:underline inline-flex items-center gap-1"
              >
                <span>Tazora IT</span>
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-slate-400 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
