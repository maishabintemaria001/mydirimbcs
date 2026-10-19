import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  User as UserIcon,
  Phone,
  KeyRound,
  ArrowRight,
  RefreshCw,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { login, register, forgotPassword, resetPassword, switchRole, getRedirectPathForUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTrack, setRegTrack] = useState('bcs');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regTerms, setRegTerms] = useState(true);

  // Forgot Password Form
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPass) {
      setErrorMsg('অনুগ্রহ করে ইমেইল অথবা মোবাইল নম্বর এবং পাসওয়ার্ড লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(loginIdentifier.trim(), loginPass);
      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...');
      const destination = getRedirectPathForUser(loggedUser);
      setTimeout(() => {
        onClose();
        navigate(destination);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'ইমেইল/মোবাইল অথবা পাসওয়ার্ড সঠিক নয়');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPass) {
      setErrorMsg('নাম, ইমেইল এবং পাসওয়ার্ড প্রদান করা আবশ্যক');
      return;
    }

    if (regPass.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (regPass !== regConfirmPass) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }

    if (!regTerms) {
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলী মেনে নেওয়া আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPass,
        track: regTrack,
      });
      setSuccessMsg('নিবন্ধন সফলভাবে সম্পন্ন হয়েছে! স্বাগতম।');
      const destination = getRedirectPathForUser(newUser);
      setTimeout(() => {
        onClose();
        navigate(destination);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('ইমেইল অথবা মোবাইল নম্বর প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      setSuccessMsg(res.message || 'ওটিপি কোড পাঠানো হয়েছে');
      setForgotStep(2);
      if (res.otp) {
        setOtpCode(res.otp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'অ্যাকাউন্ট খুঁজে পাওয়া যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otpCode.trim() || !newPassword) {
      setErrorMsg('ওটিপি কোড এবং নতুন পাসওয়ার্ড প্রদান করুন');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({
        identifier: forgotIdentifier.trim(),
        otp: otpCode.trim(),
        new_password: newPassword,
      });
      setSuccessMsg('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে এবং লগইন সম্পন্ন হয়েছে!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-click auto-fill and login
  const handleAutoFillAndLogin = async (
    role: 'admin' | 'content_manager' | 'paid_user' | 'user',
    email: string,
    pass: string
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginIdentifier(email);
    setLoginPass(pass);
    setSubmitting(true);

    try {
      const loggedUser = await login(email, pass);
      setSuccessMsg(`"${role.replace('_', ' ').toUpperCase()}" অ্যাকাউন্টে সফলভাবে লগইন হয়েছে!`);
      const destination = getRedirectPathForUser(loggedUser);
      setTimeout(() => {
        onClose();
        navigate(destination);
      }, 600);
    } catch {
      try {
        const switched = await switchRole(role);
        setSuccessMsg(`"${role.replace('_', ' ').toUpperCase()}" অ্যাকাউন্টে সফলভাবে প্রবেশ করেছেন!`);
        const destination = getRedirectPathForUser(switched);
        setTimeout(() => {
          onClose();
          navigate(destination);
        }, 600);
      } catch (e: any) {
        setErrorMsg('লগইনে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              প্ৰ
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">প্রেরণা অ্যাকাউন্টে প্রবেশ</h3>
              <p className="text-[11px] text-slate-400">বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার প্রস্তুতি পোর্টাল</p>
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
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>লগইন (Sign In)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>নতুন নিবন্ধন (Sign Up)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot');
              setForgotStep(1);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'forgot'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>পাসওয়ার্ড রিসেট</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Notifications */}
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

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ইমেইল অ্যাড্রেস বা মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="যেমন: rahim.bcs@gmail.com বা 01911444555"
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
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
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

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="rounded text-indigo-600" 
                  />
                  <span>আমাকে মনে রাখুন</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setForgotStep(1);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-indigo-600 hover:underline cursor-pointer font-medium"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>লগইন করুন (Secure Sign In)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="যেমন: সাইমা সুলতানা"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ইমেইল অ্যাড্রেস *
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
                    মোবাইল নম্বর
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
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  আপনার লক্ষ্য / পরীক্ষার ট্র্যাক
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={regTrack}
                    onChange={(e) => setRegTrack(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-white"
                  >
                    <option value="bcs">বিসিএস প্রিলিমিনারি ও লিখিত (BCS Prep)</option>
                    <option value="bank">ব্যাংক অফিসার ও সমন্বিত ব্যাংক নিয়োগ</option>
                    <option value="primary">প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ</option>
                    <option value="ministry">মন্ত্রণালয় ও সরকারি অধিদপ্তরের চাকরি</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    পাসওয়ার্ড *
                  </label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    কনফার্ম পাসওয়ার্ড *
                  </label>
                  <input
                    type="password"
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    placeholder="একই পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                    required
                  />
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
                  <span>আমি প্রেরণা প্ল্যাটফর্মের শর্তাবলী ও প্রাইভেসি পলিসিতে সম্মতি প্রদান করছি।</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>বিনামূল্যে অ্যাকাউন্ট তৈরি করুন</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD & OTP RESET */}
          {activeTab === 'forgot' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11.5px] leading-relaxed">
                পাসওয়ার্ড ভুলে গেলে আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর লিখুন। আপনার ভেরিফিকেশনের জন্য তাৎক্ষণিক ওটিপি কোড প্রদান করা হবে।
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      নিবন্ধিত ইমেইল বা মোবাইল নম্বর
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="rahim.bcs@gmail.com অথবা 01911444555"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>রিসেট কোড (OTP) পাঠান</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      ৬-সংখ্যার ওটিপি কোড (OTP Code)
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="যেমন: 202646"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-mono-numbers text-center text-sm font-bold tracking-widest"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">টেস্ট সিস্টেমে ভেরিফিকেশন কোড: <strong>202646</strong></p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      নতুন পাসওয়ার্ড সেট করুন
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                      পেছনে
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>পাসওয়ার্ড পরিবর্তন ও লগইন সম্পন্ন করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ALL PRODUCTION DEMO ACCOUNTS (Zero-barrier Reviewer Strip) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                ⚡ প্রোডাকশন অ্যাকাউন্টস ও রোল টেস্টিং
              </span>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                ১-ক্লিক অটো-ফিল ও লগইন
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Role 1: Admin */}
              <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>এডমিন (Administrator)</span>
                    </div>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-1.5 py-0.2 rounded">Master</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono-numbers truncate">
                    admin@prerona.edu.bd · 01711000111
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-indigo-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono-numbers">পাস: admin123@secure</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillAndLogin('admin', 'admin@prerona.edu.bd', 'admin123@secure')}
                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    লগইন করুন →
                  </button>
                </div>
              </div>

              {/* Role 2: Content Manager */}
              <div className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-sky-100/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-sky-950">
                      <span>✍️ কন্টেন্ট ম্যানেজার</span>
                    </div>
                    <span className="text-[10px] bg-sky-200/60 text-sky-900 font-bold px-1.5 py-0.2 rounded">Staff</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono-numbers truncate">
                    content@prerona.edu.bd · 01811222333
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-sky-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono-numbers">পাস: content123@secure</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillAndLogin('content_manager', 'content@prerona.edu.bd', 'content123@secure')}
                    className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    লগইন করুন →
                  </button>
                </div>
              </div>

              {/* Role 3: Paid Student */}
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>পেইড প্রো শিক্ষার্থী</span>
                    </div>
                    <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-1.5 py-0.2 rounded">Pro Student</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono-numbers truncate">
                    rahim.bcs@gmail.com · 01911444555
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono-numbers">পাস: user123@secure</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillAndLogin('paid_user', 'rahim.bcs@gmail.com', 'user123@secure')}
                    className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    লগইন করুন →
                  </button>
                </div>
              </div>

              {/* Role 4: Free Candidate */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>ফ্রি পরীক্ষার্থী (Free)</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">Free</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono-numbers truncate">
                    nusrat.prep@gmail.com · 01611777888
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono-numbers">পাস: user123@secure</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFillAndLogin('user', 'nusrat.prep@gmail.com', 'user123@secure')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    লগইন করুন →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>🔒 সুরক্ষিত সেশন ও স্থায়ী ডেটা সুরক্ষা</span>
          <span className="font-mono-numbers">v2.4.0 Production Ready</span>
        </div>
      </div>
    </div>
  );
};
