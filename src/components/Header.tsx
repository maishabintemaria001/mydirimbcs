import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { AuthModal } from './AuthModal.js';
import { FreeAccessGuideModal } from './FreeAccessGuideModal.js';
import { 
  User as UserIcon, 
  Shield, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  BookMarked,
  Award,
  LogIn,
  UserPlus,
  HelpCircle,
  LayoutDashboard,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeEntitlement, logout, switchRole } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [freeGuideOpen, setFreeGuideOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = async (role: UserRole) => {
    await switchRole(role);
    setUserMenuOpen(false);
    if (role === 'admin' || role === 'content_manager') {
      navigate('/admin');
    } else if (role === 'paid_user') {
      navigate('/dashboard');
    }
  };

  const isStaff = user?.role === 'admin' || user?.role === 'content_manager' || user?.role === 'exam_manager';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-indigo-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span>📢 ৪৭তম বিসিএস প্রিলিমিনারি ও সমন্বিত ব্যাংক সিনিয়র অফিসার লাইভ মডেল টেস্ট চলছে!</span>
        <Link to="/exams" className="underline font-bold text-amber-300 hover:text-white transition-colors">
          অংশগ্রহণ করুন →
        </Link>
        <button
          onClick={() => setFreeGuideOpen(true)}
          className="ml-2 px-2 py-0.5 rounded bg-indigo-800 text-[11px] font-semibold text-indigo-200 hover:text-white transition-colors cursor-pointer hidden md:inline-flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3 text-amber-300" />
          <span>ফ্রি এক্সেস নির্দেশিকা</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              প্ৰ
            </span>
            <span>Prerona <span className="text-indigo-600 font-normal text-base">| প্রেরণা</span></span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
            <Link to="/questions" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0">
              Previous Questions
            </Link>
            <Link to="/mcq-practice" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0">
              MCQ Practice
            </Link>
            <Link to="/exams" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0">
              Online Exams
            </Link>
            <Link to="/leaderboard" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>টপ পারফরমার্স</span>
            </Link>
            <Link to="/premium" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-amber-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Premium Pass</span>
            </Link>
            <Link to="/notices" className="hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0">
              Notices
            </Link>
          </nav>

          {/* Zone 3: User Auth / Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Free access matrix button */}
            <button
              onClick={() => setFreeGuideOpen(true)}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              title="লগইন ছাড়া ও ফ্রি শিক্ষার্থীরা কী কী এক্সেস করতে পারেন"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>ফ্রি বনাম পেইড</span>
            </button>

            {/* Quick Role Switcher (Zero-barrier Reviewer Experience) */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors whitespace-nowrap"
                title="Switch demo account role"
              >
                <span className={`w-2 h-2 rounded-full ${
                  user?.role === 'admin' ? 'bg-indigo-600' :
                  user?.role === 'content_manager' ? 'bg-sky-500' :
                  user?.role === 'paid_user' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></span>
                <span className="capitalize">{user ? user.role.replace('_', ' ') : 'গেস্ট ইউজার'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">সক্রিয় অ্যাকাউন্ট</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'গেস্ট শিক্ষার্থী'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'লগইন ছাড়া ব্রাউজিং মোড'}</p>
                    {activeEntitlement && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        ⭐ প্রিমিয়াম পাস সক্রিয়
                      </span>
                    )}
                  </div>

                  {/* Switch Role Fast Test */}
                  <div className="px-2 py-2 border-b border-slate-100">
                    <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ১-ক্লিক রোল পরিবর্তন (Reviewer Demo)
                    </p>
                    <button
                      onClick={() => handleRoleChange('admin')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      👑 এডমিন (Full Control)
                    </button>
                    <button
                      onClick={() => handleRoleChange('content_manager')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'content_manager' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ✍️ কন্টেন্ট ম্যানেজার (Questions Only)
                    </button>
                    <button
                      onClick={() => handleRoleChange('paid_user')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'paid_user' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ⭐ পেইড স্টুডেন্ট (Full Activity Records)
                    </button>
                    <button
                      onClick={() => handleRoleChange('user')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'user' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      👤 ফ্রি শিক্ষার্থী (Free Candidate)
                    </button>
                  </div>

                  <div className="px-2 py-1.5 space-y-1">
                    {/* Dashboard link depending on user type */}
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি</span>
                    </Link>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        <span>অ্যাডমিন ও কনটেন্ট প্যানেল</span>
                      </Link>
                    )}

                    <Link
                      to="/leaderboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>টপ পারফরমার্স ও মেধা তালিকা</span>
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>সংরক্ষিত বুকমার্ক প্রশ্ন</span>
                    </Link>

                    {user ? (
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors pt-2 border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগআউট করুন</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setAuthInitialTab('login');
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors pt-2 border-t border-slate-100"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>লগইন বা সাইন আপ করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Login / Register or Dashboard buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {isStaff ? (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>এডমিন প্যানেল</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>আমার ড্যাশবোর্ড</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  লগইন
                </button>
                <button
                  onClick={() => {
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  রেজিস্ট্রেশন
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 text-xs font-semibold">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-indigo-700 bg-indigo-50 rounded-lg font-bold"
          >
            📊 শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি
          </Link>
          <Link
            to="/questions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            বিগত বছরের প্রশ্নপত্র (Question Bank)
          </Link>
          <Link
            to="/mcq-practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            MCQ প্র্যাকটিস এরিনা
          </Link>
          <Link
            to="/exams"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            অনলাইন মডেল টেস্ট ও পরীক্ষা
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-700 hover:bg-amber-50 rounded-lg font-bold"
          >
            🏆 টপ পারফরমার্স ও মেধা তালিকা
          </Link>
          <Link
            to="/premium"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg"
          >
            ⭐ প্রিমিয়াম পাস ও প্যাকেজ সমূহ
          </Link>
          <Link
            to="/notices"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            পরীক্ষার অফিশিয়াল নোটিশ
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setFreeGuideOpen(true);
            }}
            className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>ফ্রি এক্সেস নির্দেশিকা</span>
          </button>

          {!user && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthInitialTab('login');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2 text-center border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                লগইন
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthInitialTab('register');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg font-bold"
              >
                রেজিস্ট্রেশন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      <FreeAccessGuideModal
        isOpen={freeGuideOpen}
        onClose={() => setFreeGuideOpen(false)}
        onOpenLogin={() => {
          setFreeGuideOpen(false);
          setAuthInitialTab('login');
          setAuthModalOpen(true);
        }}
      />
    </header>
  );
};
