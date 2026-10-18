import React from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Lock, 
  BookOpen, 
  Trophy, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FreeAccessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const FreeAccessGuideModal: React.FC<FreeAccessGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600/50 text-indigo-200 border border-indigo-400/30">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </span>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                শিক্ষার্থী পলিসি: ফ্রি ইউজার বনাম পেইড মেম্বারশিপ
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                লগইন ছাড়া যা যা এক্সেস করা যাবে এবং পেইড শিক্ষার্থীদের বিশেষ সুবিধাসমূহ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Level 1: Guest (No login) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 uppercase tracking-wide">
                  লেভেল ১: গেস্ট ইউজার
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5">লগইন ছাড়াই ফ্রি</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  কোনো অ্যাকাউন্ট বা সাইন ইন ছাড়াই প্ল্যাটফর্ম ভিজিট করে পড়ালেখা করার সুযোগ
                </p>
              </div>

              <ul className="space-y-2 text-slate-700 pt-2 border-t border-slate-200/80">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সকল বিগত প্রশ্ন ব্রাউজ ও সার্চ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>নমুনা এমসিকিউ ও ব্যাখ্যা দর্শন</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>জাতীয় মেধা তালিকা ও স্কোর ট্রেন্ড</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>পরীক্ষার নোটিশ ও চাকরির সার্কুলার</span>
                </li>
              </ul>
            </div>

            {/* Level 2: Registered Free Candidate */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                  লেভেল ২: ফ্রি শিক্ষার্থী
                </span>
                <h4 className="font-bold text-indigo-950 text-sm mt-1.5">ফ্রি অ্যাকাউন্ট সহ</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  বিনামূল্যে নিবন্ধন করে প্র্যাকটিস ও ব্যক্তিগত ডেটা ট্র্যাকিং
                </p>
              </div>

              <ul className="space-y-2 text-slate-700 pt-2 border-t border-indigo-100">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>গেস্টের সকল ফ্রি সুবিধা</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>কঠিন প্রশ্ন বুকমার্কে সংরক্ষণ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>পাবলিক ফ্রি মডেল টেস্টে অংশ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ব্যক্তিগত স্কোরবোর্ড ও স্ট্যাটাস</span>
                </li>
              </ul>
            </div>

            {/* Level 3: Paid Pro Student */}
            <div className="p-4 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50/70 to-white space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide flex items-center gap-1 w-fit">
                  <Sparkles className="w-2.5 h-2.5" /> লেভেল ৩: পেইড প্রো
                </span>
                <h4 className="font-bold text-amber-950 text-sm mt-1.5">ডেডিকেটেড ড্যাশবোর্ড</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  পূর্ণাঙ্গ লাইভ পরীক্ষা, অপরিবর্তনীয় অ্যাক্টিভিটি লগ ও D3 হিটম্যাপ
                </p>
              </div>

              <ul className="space-y-2 text-slate-800 pt-2 border-t border-amber-200">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সকল প্রিমিয়াম বিসিএস ও ব্যাংক পেপার</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>D3 বিষয়ভিত্তিক স্কিলস হিটম্যাপ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>লকড অফিশিয়াল অ্যাক্টিভিটি রেকর্ড</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>জাতীয় মেধা র‍্যাঙ্ক ও ব্যাখ্যা অ্যানালাইসিস</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Immutable Policy Notice */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900">
                অপরিবর্তনীয় অ্যাক্টিভিটি নীতি (Immutable Record Policy)
              </h5>
              <p className="text-slate-600 leading-relaxed">
                পেইড শিক্ষার্থীদের ড্যাশবোর্ডে সংরক্ষিত পরীক্ষার ফলাফল, প্রাপ্ত নম্বর, নেগেটিভ মার্কিং এবং পেমেন্ট সংক্রান্ত তথ্য
                অপরিবর্তনশীলভাবে সংরক্ষিত থাকে। পরীক্ষার স্বচ্ছতা এবং বাস্তব মেধা মূল্যায়নের সুরক্ষায় কোনো শিক্ষার্থী তার দেওয়া পরীক্ষার হিস্ট্রি ডিলিট করতে পারেন না।
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/questions"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <span>ফ্রি প্রশ্নপত্র এক্সপ্লোর করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>লগইন বা নিবন্ধন করুন</span>
            </button>
            <Link
              to="/premium"
              onClick={onClose}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>পেইড প্যাকেজ সমূহ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
