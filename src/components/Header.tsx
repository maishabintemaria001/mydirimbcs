import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { UserRole } from '../types/index.js';
import { AuthModal } from './AuthModal.js';
import { FreeAccessGuideModal } from './FreeAccessGuideModal.js';
import { GlobalSearchModal } from './GlobalSearchModal.js';
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
  CheckCircle2,
  Search,
  Sun,
  Moon
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeEntitlement, logout, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [freeGuideOpen, setFreeGuideOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 dark:bg-slate-950 text-indigo-100 text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-1.5 sm:gap-2 border-b border-slate-800">
        <span className="truncate">📢 ৪৭তম বিসিএস ও সমন্বিত ব্যাংক সিনিয়র অফিসার মডেল টেস্ট চলমান!</span>
        <Link to="/exams" className="underline font-bold text-amber-300 hover:text-white transition-colors shrink-0">
          অংশগ্রহণ →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              প্ৰ
            </span>
            <span className="flex items-baseline gap-1">
              <span>Prerona</span>
              <span className="hidden sm:inline text-indigo-600 dark:text-indigo-400 font-normal text-sm sm:text-base">| প্রেরণা</span>
            </span>
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/questions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0">
              Previous Questions
            </Link>
            <Link to="/mcq-practice" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0">
              MCQ Practice
            </Link>
            <Link to="/exams" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0">
              Online Exams
            </Link>
            <Link to="/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>টপ পারফরমার্স</span>
            </Link>
            <Link to="/premium" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Premium Pass</span>
            </Link>
            <Link to="/notices" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0">
              Notices
            </Link>
          </nav>

          {/* Zone 3: Actions & Controls - Single Search & Responsive Alignment */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 1. SINGLE Search Trigger: Expandable Pill on Tablet/Desktop, Icon on Mobile */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="অনুসন্ধান করুন (Ctrl+K)"
              aria-label="Global Search"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              <span className="hidden lg:inline">প্রশ্ন বা পরীক্ষা খুঁজুন...</span>
              <span className="lg:hidden">সার্চ</span>
              <kbd className="hidden lg:inline-flex text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Only: Single Search Icon (Hidden on md and up) */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="সার্চ করুন"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* 2. Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? "লাইট মোডে ফিরুন" : "ডার্ক মোড চালু করুন"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>

            {/* 3. Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                title="Switch demo account role"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  user?.role === 'admin' ? 'bg-indigo-600' :
                  user?.role === 'content_manager' ? 'bg-sky-500' :
                  user?.role === 'paid_user' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></span>
                <span className="capitalize hidden sm:inline">{user ? user.role.replace('_', ' ') : 'গেস্ট ইউজার'}</span>
                <span className="capitalize sm:hidden">{user?.role === 'admin' ? 'এডমিন' : user?.role === 'paid_user' ? 'পেইড' : user ? 'ইউজার' : 'গেস্ট'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">সক্রিয় অ্যাকাউন্ট</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'গেস্ট শিক্ষার্থী'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'লগইন ছাড়া ব্রাউজিং মোড'}</p>
                    {activeEntitlement && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                        ⭐ প্রিমিয়াম পাস সক্রিয়
                      </span>
                    )}
                  </div>

                  {/* Switch Role Fast Test */}
                  <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      ১-ক্লিক রোল পরিবর্তন (Reviewer Demo)
                    </p>
                    <button
                      onClick={() => handleRoleChange('admin')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      👑 এডমিন (Full Control)
                    </button>
                    <button
                      onClick={() => handleRoleChange('content_manager')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'content_manager' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      ✍️ কন্টেন্ট ম্যানেজার (Questions Only)
                    </button>
                    <button
                      onClick={() => handleRoleChange('paid_user')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'paid_user' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      ⭐ পেইড স্টুডেন্ট (Full Activity Records)
                    </button>
                    <button
                      onClick={() => handleRoleChange('user')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        user?.role === 'user' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      👤 ফ্রি শিক্ষার্থী (Registered Free)
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        !user ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      🌐 গেস্ট ইউজার (লগইন ছাড়া ফ্রি এক্সেস)
                    </button>
                  </div>

                  <div className="px-2 py-1.5 space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি</span>
                    </Link>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>অ্যাডমিন ও কনটেন্ট প্যানেল</span>
                      </Link>
                    )}

                    <Link
                      to="/leaderboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>টপ পারফরমার্স ও মেধা তালিকা</span>
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800"
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
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors pt-2 border-t border-slate-100 dark:border-slate-800"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>লগইন বা সাইন আপ করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Auth Buttons or Dashboard Link */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isStaff ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>এডমিন</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>ড্যাশবোর্ড</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  রেজিস্ট্রেশন
                </Link>
              </div>
            )}

            {/* 5. Mobile Menu Hamburger (Visible on < xl screens) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Responsive & Dark Mode Supported) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 text-xs font-semibold shadow-lg">
          {/* Quick Mobile Search Box in Drawer */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchModalOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 rounded-xl font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>গ্লোবাল সার্চ (প্রশ্ন, বিষয় বা পরীক্ষা)</span>
            </div>
            <kbd className="text-[10px] bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 font-mono">
              Ctrl+K
            </kbd>
          </button>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg font-bold"
          >
            📊 শিক্ষার্থী ড্যাশবোর্ড ও অ্যাক্টিভিটি
          </Link>
          <Link
            to="/questions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            বিগত বছরের প্রশ্নপত্র (Question Bank)
          </Link>
          <Link
            to="/mcq-practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            MCQ প্র্যাকটিস এরিনা
          </Link>
          <Link
            to="/exams"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            অনলাইন মডেল টেস্ট ও পরীক্ষা
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg font-bold"
          >
            🏆 টপ পারফরমার্স ও মেধা তালিকা
          </Link>
          <Link
            to="/premium"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg font-bold"
          >
            ⭐ প্রিমিয়াম পাস ও প্যাকেজ সমূহ
          </Link>
          <Link
            to="/notices"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          >
            পরীক্ষার অফিশিয়াল নোটিশ
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setFreeGuideOpen(true);
            }}
            className="w-full text-left px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>ফ্রি এক্সেস নির্দেশিকা</span>
          </button>

          {!user && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
              >
                রেজিস্ট্রেশন
              </Link>
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

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
};
