import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Shield, 
  Sparkles, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { login, register, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regTerms, setRegTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPass) {
      setErrorMsg('অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      await login(loginEmail, loginPass);
      setSuccessMsg('লগইন সফল হয়েছে! স্বাগতম।');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName || !regEmail || !regPass) {
      setErrorMsg('নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক');
      return;
    }

    if (!regTerms) {
      setErrorMsg('অনুগ্রহ করে ব্যবহারের শর্তাবলী মেনে নিন');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPass,
        phone: regPhone,
      });
      setSuccessMsg('রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (
    role: 'admin' | 'content_manager' | 'paid_user' | 'user',
    email: string,
    pass: string
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await switchRole(role);
      setSuccessMsg(`"${role.replace('_', ' ').toUpperCase()}" অ্যাকাউন্টে সফলভাবে লগইন হয়েছে!`);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      try {
        await login(email, pass);
        setSuccessMsg('লগইন সম্পন্ন হয়েছে!');
        setTimeout(() => onClose(), 600);
      } catch (e: any) {
        setErrorMsg('ডেমো লগইনে সমস্যা হয়েছে');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              প্ৰ
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">প্রেরণা অ্যাকাউন্টে প্রবেশ</h3>
              <p className="text-[11px] text-slate-400">পরীক্ষা প্রস্তুতি, মেধা যাচাই ও প্র্যাকটিস পোর্টাল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>লগইন করুন (Sign In)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>নতুন শিক্ষার্থী নিবন্ধন (Sign Up)</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ইমেইল অ্যাড্রেস
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@prerona.edu.bd"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span>মনে রাখুন</span>
                </label>
                <span className="text-indigo-600 hover:underline cursor-pointer">
                  পাসওয়ার্ড ভুলে গেছেন?
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  আপনার পূর্ণ নাম
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ইমেইল অ্যাড্রেস
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  পাসওয়ার্ড তৈরি করুন
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                  <input 
                    type="checkbox" 
                    checked={regTerms} 
                    onChange={(e) => setRegTerms(e.target.checked)} 
                    className="rounded text-indigo-600" 
                  />
                  <span>আমি প্ল্যাটফর্মের ব্যবহার বিধি ও পরীক্ষার শর্তাবলীতে সম্মত।</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>বিনামূল্যে অ্যাকাউন্ট খুলুন</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Role Switcher Demo Box */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ⚡ ১-ক্লিকে টেস্ট লগইন (Role Testing)
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                কোনো পাসওয়ার্ড ছাড়াই তাৎক্ষণিক এক্সেস
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Admin */}
              <button
                onClick={() => handleQuickDemoLogin('admin', 'admin@prerona.edu.bd', 'admin123@secure')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>এডমিন (Admin)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">সব ক্ষমতা ও অনুমোদন</p>
              </button>

              {/* Content Manager */}
              <button
                onClick={() => handleQuickDemoLogin('content_manager', 'content@prerona.edu.bd', 'content123@secure')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <span>✍️ কন্টেন্ট ম্যানেজার</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">প্রশ্ন তৈরি ও MCQ ইম্পোর্ট</p>
              </button>

              {/* Paid User */}
              <button
                onClick={() => handleQuickDemoLogin('paid_user', 'rahim.bcs@gmail.com', 'user123@secure')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>পেইড প্রো মেম্বার</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">সব অ্যাক্টিভিটি ও হিটম্যাপ</p>
              </button>

              {/* Free User */}
              <button
                onClick={() => handleQuickDemoLogin('user', 'nusrat.prep@gmail.com', 'user123@secure')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>ফ্রি শিক্ষার্থী (Student)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">ফ্রি প্র্যাকটিস ও বুকমার্ক</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <span>🔒 এন্ড-টু-এন্ড সুরক্ষিত সেশন · পরীক্ষার ফলাফল ও অ্যাক্টিভিটি স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে</span>
        </div>
      </div>
    </div>
  );
};
