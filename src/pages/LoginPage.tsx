import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
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
  GraduationCap,
  Building2,
  BookOpen
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, register, forgotPassword, resetPassword, switchRole, getRedirectPathForUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // If already logged in, redirect immediately to their dashboard
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname;
      const targetPath = from || getRedirectPathForUser(user);
      navigate(targetPath, { replace: true });
    }
  }, [user, navigate, location, getRedirectPathForUser]);

  const initialTabParam = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTabParam);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPass) {
      setErrorMsg('অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর এবং পাসওয়ার্ড লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(loginIdentifier.trim(), loginPass);
      setSuccessMsg('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...');
      const from = (location.state as any)?.from?.pathname;
      const destination = from || getRedirectPathForUser(loggedUser);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'ইমেইল/মোবাইল অথবা পাসওয়ার্ড সঠিক নয়। পুনরায় চেষ্টা করুন।');
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
      setErrorMsg('প্ল্যাটফর্মের শর্তাবলীতে সম্মতি প্রদান আবশ্যক');
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
      setSuccessMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে স্বাগতম...');
      const destination = getRedirectPathForUser(newUser);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি। এই ইমেইল ইতিমধ্যে ব্যবহৃত হতে পারে।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('অনুগ্রহ করে ইমেইল বা মোবাইল নম্বর লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      setSuccessMsg(res.message || 'যাচাইকরণ ওটিপি কোড পাঠানো হয়েছে');
      setForgotStep(2);
      if (res.otp) {
        setOtpCode(res.otp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'এই অ্যাকাউন্টের কোনো রেকর্ড পাওয়া যায়নি');
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
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await resetPassword({
        identifier: forgotIdentifier.trim(),
        otp: otpCode.trim(),
        new_password: newPassword,
      });
      setSuccessMsg('পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে! প্রবেশ করানো হচ্ছে...');
      const destination = getRedirectPathForUser(updatedUser);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (
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
      const from = (location.state as any)?.from?.pathname;
      const destination = from || getRedirectPathForUser(loggedUser);
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 600);
    } catch {
      try {
        const switched = await switchRole(role);
        setSuccessMsg(`"${role.replace('_', ' ').toUpperCase()}" অ্যাকাউন্টে সফলভাবে প্রবেশ করেছেন!`);
        const from = (location.state as any)?.from?.pathname;
        const destination = from || getRedirectPathForUser(switched);
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 600);
      } catch {
        setErrorMsg('লগইন ব্যর্থ হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-gradient-to-b from-slate-100 to-slate-50">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              প্ৰ
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              Prerona Portal
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'login' ? 'অ্যাকাউন্টে প্রবেশ করুন (Login Panel)' :
             activeTab === 'register' ? 'নতুন অ্যাকাউন্ট খুলুন (Registration)' :
             'পাসওয়ার্ড পুনরুদ্ধার (Reset Password)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি চাকরির পূর্ণাঙ্গ প্রশ্নব্যাংক ও লাইভ পরীক্ষা
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>১. লগইন (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>২. সাইন আপ (Register)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('forgot');
                setErrorMsg(null);
                setSuccessMsg(null);
                setForgotStep(1);
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'forgot'
                  ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>৩. রিসেট পাসওয়ার্ড</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Notifications */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ইমেইল অথবা মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="admin@prerona.edu.bd বা 017xxxxxxxx"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-medium"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল বা মোবাইল ফোন নম্বর দিন
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      className="rounded text-indigo-600" 
                    />
                    <span>লগইন মনে রাখুন</span>
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
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
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
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    প্রস্তুতির মূল লক্ষ্য (Target Track)
                  </label>
                  <select
                    value={regTrack}
                    onChange={(e) => setRegTrack(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-white"
                  >
                    <option value="bcs">৪৬তম ও ৪৭তম বিসিএস প্রিলিমিনারি</option>
                    <option value="bank">বাংলাদেশ ব্যাংক ও সমন্বিত সরকারি ব্যাংক</option>
                    <option value="primary">প্রাথমিক সহকারী শিক্ষক নিয়োগ</option>
                    <option value="govt">অন্যান্য ৯ম-২০তম গ্রেড সরকারি চাকরি</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
                    </label>
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
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
                      placeholder="••••••••"
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
                    <span>আমি প্রেরণা পোর্টালের নীতিমালা ও শর্তাবলীতে সম্মতি প্রদান করছি।</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>বিনামূল্যে অ্যাকাউন্ট খুলুন (Sign Up Free)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {activeTab === 'forgot' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                  পাসওয়ার্ড ভুলে গেলে আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন। সিস্টেমে তাত্ক্ষণিক ওটিপি কোড (OTP) প্রদান করা হবে।
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="rahim.bcs@gmail.com বা 01911444555"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                        placeholder="202646"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-mono-numbers text-center text-sm font-bold tracking-widest"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-1">টেস্ট সিস্টেমে ভেরিফিকেশন কোড: <strong>202646</strong></p>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        নতুন পাসওয়ার্ড
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

                    <div className="flex items-center gap-2 pt-1">
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
                            <span>পাসওয়ার্ড সংরক্ষণ ও লগইন করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Quick Demo Test Accounts Panel for Reviewers */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡ টেস্ট ডেমো অ্যাকাউন্টস (Quick Reviewer Access)</span>
                </span>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  ১-ক্লিক অটো লগইন ও রোল টেস্ট
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Admin */}
                <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        <span>১. এডমিন (Administrator)</span>
                      </div>
                      <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-1.5 py-0.2 rounded">Master</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono-numbers">
                      admin@prerona.edu.bd · 01711000111
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono-numbers">
                      পাসওয়ার্ড: admin123@secure
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'admin@prerona.edu.bd', 'admin123@secure')}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors text-center"
                  >
                    এডমিন হিসেবে লগইন করুন →
                  </button>
                </div>

                {/* Content Manager */}
                <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-sky-100/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-sky-950">
                        <span>২. কন্টেন্ট ম্যানেজার</span>
                      </div>
                      <span className="text-[10px] bg-sky-200/60 text-sky-900 font-bold px-1.5 py-0.2 rounded">Staff</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono-numbers">
                      content@prerona.edu.bd · 01811222333
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono-numbers">
                      পাসওয়ার্ড: content123@secure
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('content_manager', 'content@prerona.edu.bd', 'content123@secure')}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer transition-colors text-center"
                  >
                    কন্টেন্ট ম্যানেজার হিসেবে লগইন →
                  </button>
                </div>

                {/* Paid Pro User */}
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>৩. পেইড প্রো শিক্ষার্থী</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-1.5 py-0.2 rounded">Pro</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono-numbers">
                      rahim.bcs@gmail.com · 01911444555
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono-numbers">
                      পাসওয়ার্ড: user123@secure
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('paid_user', 'rahim.bcs@gmail.com', 'user123@secure')}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors text-center"
                  >
                    পেইড স্টুডেন্ট হিসেবে লগইন →
                  </button>
                </div>

                {/* Free User */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                        <span>৪. ফ্রি নিবন্ধিত শিক্ষার্থী</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">Free</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono-numbers">
                      nusrat.prep@gmail.com · 01611777888
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono-numbers">
                      পাসওয়ার্ড: user123@secure
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('user', 'nusrat.prep@gmail.com', 'user123@secure')}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors text-center"
                  >
                    ফ্রি শিক্ষার্থী হিসেবে লগইন →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>🔒 এনক্রিপ্টেড সেশন ও ডেটা নিরাপত্তা</span>
            <Link to="/" className="text-indigo-600 hover:underline">
              ← হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
