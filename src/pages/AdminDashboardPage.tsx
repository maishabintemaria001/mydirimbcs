import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DashboardSkeleton } from '../components/Skeleton.js';
import { 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Shield, 
  Users, 
  CreditCard, 
  Sparkles, 
  UploadCloud, 
  Layers, 
  Clock, 
  AlertCircle,
  Eye,
  Check,
  Lock,
  ChevronRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'bulk_mcq' | 'exams' | 'payments' | 'users' | 'ads' | 'audit'>('overview');
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [examsList, setExamsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adsData, setAdsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [newPaperModal, setNewPaperModal] = useState(false);
  const [newPaperTitle, setNewPaperTitle] = useState('');
  const [newPaperTitleBn, setNewPaperTitleBn] = useState('');
  const [newPaperCategory, setNewPaperCategory] = useState('cat_bcs');
  const [newPaperYear, setNewPaperYear] = useState('2024');
  const [newPaperTotalMarks, setNewPaperTotalMarks] = useState('100');
  const [newPaperDuration, setNewPaperDuration] = useState('60');
  const [newPaperIsPaid, setNewPaperIsPaid] = useState(false);

  // Add question to paper modal
  const [addQModal, setAddQModal] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctOpt, setCorrectOpt] = useState('opt_1');
  const [qExplanation, setQExplanation] = useState('');

  // Bulk MCQ Importer state
  const [bulkPaperId, setBulkPaperId] = useState('');
  const [bulkJsonPayload, setBulkJsonPayload] = useState('');
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // New Exam Modal
  const [newExamModal, setNewExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examTitleBn, setExamTitleBn] = useState('');
  const [examCategory, setExamCategory] = useState('cat_bcs');
  const [examDuration, setExamDuration] = useState('15');
  const [examTotalMarks, setExamTotalMarks] = useState('10');
  const [examPassMarks, setExamPassMarks] = useState('5');
  const [examNegative, setExamNegative] = useState('0.25');

  // Google AdSense settings state
  const [adSenseEnabled, setAdSenseEnabled] = useState(true);
  const [adSensePubId, setAdSensePubId] = useState('ca-pub-9847291847192841');
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(true);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  
  // Slot toggles and IDs
  const [headerAdEnabled, setHeaderAdEnabled] = useState(true);
  const [headerSlotId, setHeaderSlotId] = useState('slot_header_728x90');
  
  const [sidebarAdEnabled, setSidebarAdEnabled] = useState(true);
  const [sidebarSlotId, setSidebarSlotId] = useState('slot_sidebar_300x250');
  
  const [contentAdEnabled, setContentAdEnabled] = useState(true);
  const [contentSlotId, setContentSlotId] = useState('slot_inarticle_fluid');
  
  const [footerAdEnabled, setFooterAdEnabled] = useState(true);
  const [footerSlotId, setFooterSlotId] = useState('slot_footer_leaderboard');
  
  const [newSponsorModal, setNewSponsorModal] = useState(false);
  const [spnTitle, setSpnTitle] = useState('');
  const [spnClient, setSpnClient] = useState('');
  const [spnBanner, setSpnBanner] = useState('');
  const [spnUrl, setSpnUrl] = useState('');
  const [spnPlacement, setSpnPlacement] = useState<'header' | 'sidebar' | 'footer' | 'question_bottom'>('header');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, qp, ex, pay, usr, ads, aud] = await Promise.all([
        ApiClient.getAdminDashboard(),
        ApiClient.getAdminQuestions(),
        ApiClient.getAdminExams(),
        ApiClient.getAdminPayments(),
        ApiClient.getAdminUsers(),
        ApiClient.getAdminAds(),
        ApiClient.getAdminAuditLogs(),
      ]);

      setDashboardData(dash.data);
      setQuestionsList(qp.data);
      setExamsList(ex.data);
      setPaymentsList(pay.data);
      setUsersList(usr.data);
      setAdsData(ads.data);
      setAuditLogs(aud.data);

      if (ads.data?.settings) {
        setAdSenseEnabled(ads.data.settings.adsense_enabled !== false);
        setAdSensePubId(ads.data.settings.publisher_id || 'ca-pub-9847291847192841');
        setAutoAdsEnabled(ads.data.settings.auto_ads !== false);
        setTestModeEnabled(Boolean(ads.data.settings.test_mode));
        setHeaderAdEnabled(ads.data.settings.header_ad_enabled !== false);
        setHeaderSlotId(ads.data.settings.header_slot_id || 'slot_header_728x90');
        setSidebarAdEnabled(ads.data.settings.sidebar_ad_enabled !== false);
        setSidebarSlotId(ads.data.settings.sidebar_slot_id || 'slot_sidebar_300x250');
        setContentAdEnabled(ads.data.settings.content_ad_enabled !== false);
        setContentSlotId(ads.data.settings.content_slot_id || 'slot_inarticle_fluid');
        setFooterAdEnabled(ads.data.settings.footer_ad_enabled !== false);
        setFooterSlotId(ads.data.settings.footer_slot_id || 'slot_footer_leaderboard');
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createQuestionPaper({
        title: newPaperTitle,
        title_bn: newPaperTitleBn || newPaperTitle,
        category_id: newPaperCategory,
        organization_id: 'org_bpsc',
        position_id: 'pos_bcs_cadre',
        exam_year: Number(newPaperYear),
        total_marks: Number(newPaperTotalMarks),
        duration_minutes: Number(newPaperDuration),
        is_paid: newPaperIsPaid,
        publication_status: 'published',
      });
      setNewPaperModal(false);
      showToast('নতুন প্রশ্নপত্র সফলভাবে যুক্ত হয়েছে');
      loadData();
    } catch (e: any) {
      alert(e.message || 'প্রশ্নপত্র তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleAddQuestionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaperId) return;

    try {
      await ApiClient.addQuestionItem(selectedPaperId, {
        question_text: qText,
        question_text_bn: qText,
        options: [
          { id: 'opt_1', text: opt1 },
          { id: 'opt_2', text: opt2 },
          { id: 'opt_3', text: opt3 },
          { id: 'opt_4', text: opt4 },
        ],
        correct_option_ids: [correctOpt],
        explanation: qExplanation,
        marks: 1,
        negative_marks: 0.25,
      });

      setAddQModal(false);
      setQText('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setOpt4('');
      setQExplanation('');
      showToast('এমসিকিউ সফলভাবে যোগ করা হয়েছে');
      loadData();
    } catch (e: any) {
      alert(e.message || 'প্রশ্ন যোগ করা ব্যর্থ হয়েছে');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkPaperId || !bulkJsonPayload) {
      alert('অনুগ্রহ করে প্রশ্নপত্র এবং JSON ডেটা প্রদান করুন');
      return;
    }

    try {
      const parsed = JSON.parse(bulkJsonPayload);
      const res = await ApiClient.bulkImportMCQs(bulkPaperId, parsed);
      setBulkStatus(res.message);
      showToast(res.message);
      loadData();
    } catch (e: any) {
      setBulkStatus('JSON ফরম্যাট ভুল হয়েছে: ' + e.message);
    }
  };

  const handleApprovePayment = async (orderId: string) => {
    try {
      const res = await ApiClient.approvePayment(orderId, 'Verified via bank/bKash statement');
      showToast(res.message);
      loadData();
    } catch (e: any) {
      alert(e.message || 'অনুমোদন ব্যর্থ হয়েছে');
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    const reason = prompt('বাতিলের কারণ লিখুন:');
    if (!reason) return;

    try {
      const res = await ApiClient.rejectPayment(orderId, reason);
      showToast(res.message);
      loadData();
    } catch (e: any) {
      alert(e.message || 'বাতিলকরণ ব্যর্থ হয়েছে');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pick first 5 questions for demo
      const qIds = ['q_46_01', 'q_46_02', 'q_46_03', 'q_46_04', 'q_46_05'];
      await ApiClient.createExam({
        title: examTitle,
        title_bn: examTitleBn || examTitle,
        category_id: examCategory,
        duration_minutes: Number(examDuration),
        total_marks: Number(examTotalMarks),
        pass_marks: Number(examPassMarks),
        negative_mark_per_question: Number(examNegative),
        question_ids: qIds,
        is_paid: false,
        is_active: true,
      });

      setNewExamModal(false);
      showToast('অনলাইন পরীক্ষা সফলভাবে শিডিউল করা হয়েছে');
      loadData();
    } catch (e: any) {
      alert(e.message || 'পরীক্ষা তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleSaveAdSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.updateAdSettings({
        adsense_enabled: adSenseEnabled,
        publisher_id: adSensePubId.trim(),
        auto_ads: autoAdsEnabled,
        test_mode: testModeEnabled,
        header_ad_enabled: headerAdEnabled,
        header_slot_id: headerSlotId.trim(),
        sidebar_ad_enabled: sidebarAdEnabled,
        sidebar_slot_id: sidebarSlotId.trim(),
        content_ad_enabled: contentAdEnabled,
        content_slot_id: contentSlotId.trim(),
        footer_ad_enabled: footerAdEnabled,
        footer_slot_id: footerSlotId.trim(),
      });
      showToast('গুগল অ্যাডসেন্স ও ব্যানার স্লট সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
      loadData();
    } catch (e: any) {
      alert(e.message || 'বিজ্ঞাপন সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createSponsor({
        title: spnTitle,
        client_name: spnClient,
        banner_url: spnBanner || '/src/assets/images/sponsor_ad_career_hub_1792337525434.jpg',
        target_url: spnUrl || 'https://example.com',
        placement: spnPlacement,
      });
      setNewSponsorModal(false);
      showToast('স্পন্সর বিজ্ঞাপন সফলভাবে চালু করা হয়েছে');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const isContentManager = user?.role === 'content_manager';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'user' || user?.role === 'paid_user';

  // Security guard: Ensure non-admins cannot access or stay on admin-only tabs
  useEffect(() => {
    if (!isAdmin && ['payments', 'users', 'ads', 'audit'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [isAdmin, activeTab]);

  // Guard: If regular student accesses /admin, show friendly redirect
  if (isStudent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">অ্যাডমিন অ্যাক্সেস সংরক্ষিত</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          এই কন্ট্রোল প্যানেলটি শুধুমাত্র অ্যাডমিনিস্ট্রেটর এবং কন্টেন্ট ম্যানেজারদের ব্যবহারের জন্য। আপনার পরীক্ষার ফলাফল, স্কোর ট্র্যাকিং ও অ্যাক্টিভিটি দেখতে নিচের বোতামে ক্লিক করুন।
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <span>আমার শিক্ষার্থী ড্যাশবোর্ডে যান</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Role-Specific Notice Banner */}
      {isContentManager ? (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-xs">
          <span className="p-1 rounded-md bg-sky-100 text-sky-800 font-bold shrink-0">✍️</span>
          <div className="space-y-0.5">
            <h4 className="font-bold text-sky-950">
              কন্টেন্ট ম্যানেজার রোল (Content Manager Access Enabled)
            </h4>
            <p className="text-sky-800 leading-relaxed text-[11.5px]">
              আপনার অ্যাকাউন্টে প্রশ্নপত্র তৈরি, এমসিকিউ সম্পাদনা, বাল্ক ইম্পোর্ট এবং অনলাইন পরীক্ষা ব্যবস্থাপনার পূর্ণ ওয়ার্কস্পেস সক্রিয় রয়েছে।
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-700 shrink-0" />
            <span className="font-bold text-indigo-950">
              👑 ফুল সিস্টেম অ্যাডমিনিস্ট্রেটর (Administrator Access)
            </span>
            <span className="text-slate-500 hidden sm:inline">
              — সকল কনটেন্ট, আর্থিক লেনদেন, ইউজার রোল ও সিস্টেম সেটিংস নিয়ন্ত্রণ
            </span>
          </div>
          <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-2 py-0.5 rounded">
            All Permissions Active
          </span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
            {isContentManager ? 'Content Management Workspace' : 'Master Admin Workspace'}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {isContentManager ? 'কনটেন্ট ও প্রশ্নপত্র নিয়ন্ত্রণ কেন্দ্র' : 'ওয়েবসাইট ম্যানেজমেন্ট ও কন্ট্রোল প্যানেল'}
          </h1>
          <p className="text-xs text-slate-500">
            অ্যাক্টিভ প্রোফাইল: <strong className="text-slate-800">{user?.name}</strong> ({user?.role?.replace('_', ' ')})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewPaperModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> নতুন প্রশ্নপত্র
          </button>
          <button
            onClick={() => setNewExamModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> নতুন পরীক্ষা
          </button>
        </div>
      </div>

      {/* Admin Tabs - Admin only tabs are completely hidden from non-admins */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          ওভারভিউ ড্যাশবোর্ড
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'questions' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          প্রশ্নপত্র ব্যবস্থাপনা ({questionsList.length})
        </button>
        <button
          onClick={() => setActiveTab('bulk_mcq')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'bulk_mcq' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          বাল্ক MCQ ইম্পোর্টার
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'exams' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          অনলাইন পরীক্ষা ({examsList.length})
        </button>
        
        {/* Admin-only Tabs: completely hidden for content managers */}
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'payments' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>পেমেন্ট অনুমোদন</span>
              {paymentsList.filter(p => p.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono-numbers">
                  {paymentsList.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'users' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>ব্যবহারকারী ও রোল ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'ads' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>বিজ্ঞাপন ও স্পন্সর</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>অডিট লগ</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">নিবন্ধিত শিক্ষার্থী</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono-numbers mt-1">
                {dashboardData?.metrics?.total_users || 0}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                পেইড মেম্বার: {dashboardData?.metrics?.paid_users || 0}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">মোট প্রশ্নপত্র</span>
              <p className="text-2xl font-extrabold text-indigo-600 font-mono-numbers mt-1">
                {dashboardData?.metrics?.total_papers || 0}
              </p>
              <span className="text-[11px] text-slate-500">
                মোট এমসিকিউ: {dashboardData?.metrics?.total_questions || 0}
              </span>
            </div>

            {isAdmin ? (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">মোট রাজস্ব আয়</span>
                  <p className="text-2xl font-extrabold text-emerald-600 font-mono-numbers mt-1">
                    ৳{dashboardData?.metrics?.total_revenue_bdt || 0}
                  </p>
                  <span className="text-[11px] text-slate-500">অনুমোদিত লেনদেন হতে</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">অপেক্ষমাণ পেমেন্ট</span>
                  <p className="text-2xl font-extrabold text-amber-600 font-mono-numbers mt-1">
                    {dashboardData?.metrics?.pending_payments_count || 0} টি
                  </p>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-[11px] text-indigo-600 font-semibold underline mt-0.5 block"
                  >
                    এখনই ভেরিফাই করুন →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">অনলাইন পরীক্ষা</span>
                  <p className="text-2xl font-extrabold text-emerald-600 font-mono-numbers mt-1">
                    {examsList.length} টি
                  </p>
                  <span className="text-[11px] text-slate-500">লাইভ ও শিডিউলড এক্সাম</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">মোট এমসিকিউ প্রশ্ন</span>
                  <p className="text-2xl font-extrabold text-indigo-600 font-mono-numbers mt-1">
                    {dashboardData?.metrics?.total_questions || 0} টি
                  </p>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className="text-[11px] text-indigo-600 font-semibold underline mt-0.5 block"
                  >
                    প্রশ্ন তালিকা দেখুন →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Recent Orders & Recent Attempts Grid: Recent Orders (Payments) only shown to Master Admin */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : ''} gap-6`}>
            {isAdmin && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক সাবস্ক্রিপশন অর্ডার</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {dashboardData?.recent_orders?.map((ord: any) => (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{ord.user_name}</p>
                        <p className="text-slate-400 font-mono-numbers">{ord.package_name} · ৳{ord.amount_bdt}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক পরীক্ষার অংশগ্রহণ</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {dashboardData?.recent_attempts?.map((att: any) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{att.user_name}</p>
                      <p className="text-slate-400 font-mono-numbers">স্কোর: {att.score.toFixed(2)} / {att.total_marks}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      att.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {att.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS CRUD */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">সকল সংরক্ষিত প্রশ্নপত্র</h3>
            <button
              onClick={() => setNewPaperModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
            >
              + নতুন প্রশ্নপত্র যুক্ত করুন
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">শিরোনাম</th>
                  <th className="py-2.5 px-3">সাল</th>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3">প্রশ্ন সংখ্যা</th>
                  <th className="py-2.5 px-3">অ্যাক্সেস</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questionsList.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{p.title_bn || p.title}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.slug}</p>
                    </td>
                    <td className="py-3 px-3 font-mono-numbers">{p.exam_year}</td>
                    <td className="py-3 px-3 text-indigo-700 font-medium">{p.category?.name_bn || 'BCS'}</td>
                    <td className="py-3 px-3 font-mono-numbers">{p.question_count || 5} টি প্রশ্ন</td>
                    <td className="py-3 px-3">
                      {p.is_paid ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Premium (৳{p.price_bdt || 120})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPaperId(p.id);
                          setAddQModal(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                      >
                        + প্রশ্ন যোগ
                      </button>
                      <a
                        href={`/questions/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-semibold text-[11px]"
                      >
                        প্রিভিউ
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BULK MCQ IMPORTER */}
      {activeTab === 'bulk_mcq' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">বাল্ক MCQ ইম্পোর্টার (JSON / Excel)</h3>
            <p className="text-xs text-slate-500">
              একসাথে ২০ থেকে ২০০টি এমসিকিউ প্রশ্ন অপশন ও ব্যাখ্যা সহ সরাসরি প্রশ্নপত্রে ইম্পোর্ট করুন।
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">লক্ষ্য প্রশ্নপত্র নির্বাচন করুন *</label>
            <select
              value={bulkPaperId}
              onChange={(e) => setBulkPaperId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="">প্রশ্নপত্র বাছাই করুন...</option>
              {questionsList.map(p => (
                <option key={p.id} value={p.id}>{p.title_bn || p.title} ({p.exam_year})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">JSON পে-লোড পেস্ট করুন *</label>
              <button
                type="button"
                onClick={() => {
                  setBulkJsonPayload(JSON.stringify([
                    {
                      question_text: "চর্যাপদের আদি কবি কে?",
                      question_text_bn: "চর্যাপদের আদি কবি কে?",
                      options: [
                        { id: "opt_1", text: "কাহ্নপা" },
                        { id: "opt_2", text: "লুইপা" },
                        { id: "opt_3", text: "ভুসুকুপা" },
                        { id: "opt_4", text: "শবরপা" }
                      ],
                      correct_option_ids: ["opt_2"],
                      explanation: "চর্যাপদের প্রথম পদটি লুইপার রচিত। তিনি আদি কবি হিসেবে গণ্য।",
                      marks: 1,
                      negative_marks: 0.25
                    }
                  ], null, 2));
                }}
                className="text-[11px] font-semibold text-indigo-600 underline"
              >
                নমুনা টেমপ্লেট লোড করুন
              </button>
            </div>
            <textarea
              rows={8}
              value={bulkJsonPayload}
              onChange={(e) => setBulkJsonPayload(e.target.value)}
              placeholder="[{ question_text: '...', options: [...], correct_option_ids: ['opt_1'], explanation: '...' }]"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {bulkStatus && (
              <span className="text-xs font-medium text-indigo-600">{bulkStatus}</span>
            )}
            <button
              onClick={handleBulkImport}
              className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              ইম্পোর্ট সম্পন্ন করুন
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: EXAMS MANAGEMENT */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">অনলাইন মডেল টেস্ট শিডিউলার</h3>
            <button
              onClick={() => setNewExamModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
            >
              + নতুন মডেল টেস্ট তৈরি করুন
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">পরীক্ষার নাম</th>
                  <th className="py-2.5 px-3">সময়সীমা</th>
                  <th className="py-2.5 px-3">পূর্ণমান</th>
                  <th className="py-2.5 px-3">নেগেটিভ মার্ক</th>
                  <th className="py-2.5 px-3">অংশগ্রহণ সংখ্যা</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examsList.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{e.title_bn || e.title}</p>
                      <p className="text-[11px] text-slate-400">{e.slug}</p>
                    </td>
                    <td className="py-3 px-3 font-mono-numbers">{e.duration_minutes} মিনিট</td>
                    <td className="py-3 px-3 font-mono-numbers">{e.total_marks} নম্বর</td>
                    <td className="py-3 px-3 font-mono-numbers text-rose-600">-{e.negative_mark_per_question}</td>
                    <td className="py-3 px-3 font-mono-numbers">{e.attempts_count || 1} জন</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS APPROVAL (Admin Only) */}
      {activeTab === 'payments' && isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">পেমেন্ট রিকোয়েস্ট ভেরিফিকেশন ও অনুমোদন</h3>
            <p className="text-xs text-slate-500">
              বিকাশ/নগদ স্টেটমেন্ট মিলিয়ে অনুমোদন দিন। অনুমোদন দেওয়ার সাথে সাথেই ইউজারের প্রিমিয়াম এক্সেস স্বয়ংক্রিয়ভাবে সক্রিয় হবে।
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">অর্ডার নং</th>
                  <th className="py-2.5 px-3">শিক্ষার্থীর নাম ও ইমেইল</th>
                  <th className="py-2.5 px-3">প্যাকেজ</th>
                  <th className="py-2.5 px-3">মাধ্যম</th>
                  <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                  <th className="py-2.5 px-3">টাকা</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsList.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono-numbers font-medium">{ord.order_number}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{ord.user_name}</p>
                      <p className="text-slate-400 text-[11px]">{ord.user_email}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-indigo-700">{ord.package_name}</td>
                    <td className="py-3 px-3 uppercase text-slate-600">{ord.payment_method}</td>
                    <td className="py-3 px-3 font-mono-numbers font-bold text-slate-900">
                      {ord.transaction_id}
                      <span className="block text-[10px] text-slate-400 font-normal">Sender: {ord.sender_number}</span>
                    </td>
                    <td className="py-3 px-3 font-mono-numbers font-bold">৳{ord.amount_bdt}</td>
                    <td className="py-3 px-3">
                      {ord.status === 'approved' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Approved
                        </span>
                      ) : ord.status === 'rejected' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {ord.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprovePayment(ord.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px]"
                          >
                            অনুমোদন দিন
                          </button>
                          <button
                            onClick={() => handleRejectPayment(ord.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold text-[11px]"
                          >
                            বাতিল
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">নিস্পন্ন</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: USERS & ROLES (Admin Only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">ব্যবহারকারী ও অনুমতি নির্ধারণ</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">নাম</th>
                  <th className="py-2.5 px-3">ইমেইল</th>
                  <th className="py-2.5 px-3">বর্তমান রোল</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 text-right">রোল পরিবর্তন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 text-slate-500">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await ApiClient.updateAdminUser(u.id, { role: e.target.value });
                          showToast('রোল আপডেট করা হয়েছে');
                          loadData();
                        }}
                        className="text-[11px] py-1 px-2 border border-slate-200 rounded bg-slate-50 font-medium"
                      >
                        <option value="user">Free User</option>
                        <option value="paid_user">Paid Pro User</option>
                        <option value="content_manager">Content Manager</option>
                        <option value="exam_manager">Exam Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: ADVERTISEMENTS & SPONSORS (Admin Only) */}
      {activeTab === 'ads' && isAdmin && (
        <div className="space-y-6">
          {/* Google AdSense Full Control Center */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                  adSenseEnabled ? 'bg-emerald-600' : 'bg-slate-400'
                }`}>
                  G
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Google AdSense ইন্টিগ্রেশন ও অ্যাড আইডি কন্ট্রোল</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      adSenseEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {adSenseEnabled ? '● অ্যাডসেন্স সক্রিয় (ON)' : '○ অ্যাডসেন্স নিষ্ক্রিয় (OFF)'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    বিজ্ঞাপনের ক্লায়েন্ট আইডি, প্রতিটি স্লট আইডি এবং পৃথক অন/অফ সুইচ নির্ধারণ করুন
                  </p>
                </div>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">গুগল অ্যাডসেন্স মাস্টার সুইচ:</span>
                <button
                  type="button"
                  onClick={() => setAdSenseEnabled(!adSenseEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    adSenseEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAdSettings} className="space-y-6 text-xs">
              {/* Publisher ID & Global Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div className="md:col-span-1">
                  <label className="block font-bold text-slate-800 mb-1">
                    Google AdSense Publisher ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={adSensePubId}
                    onChange={(e) => setAdSensePubId(e.target.value)}
                    placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono-numbers text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    গুগল অ্যাডসেন্স অ্যাকাউন্ট পাবলিশার আইডি (যেমন: ca-pub-9847291847192841)
                  </p>
                </div>

                <div className="flex flex-col justify-center space-y-2 p-2 bg-white rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdsEnabled}
                      onChange={(e) => setAutoAdsEnabled(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800">গুগল অটো অ্যাডস (Auto-Ads) চালু রাখুন</span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6">
                    গুগলের এআই স্বয়ংক্রিয়ভাবে সর্বোত্তম জায়গায় উপযুক্ত সাইজের বিজ্ঞাপন বসাবে
                  </p>
                </div>

                <div className="flex flex-col justify-center space-y-2 p-2 bg-white rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testModeEnabled}
                      onChange={(e) => setTestModeEnabled(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800">টেস্ট প্রিভিউ মোড (Test Mode)</span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6">
                    লাইভ গুগল স্ক্রিপ্টের পরিবর্তে সুরক্ষিত টেস্ট প্রিভিউ ইউনিট প্রদর্শন করবে
                  </p>
                </div>
              </div>

              {/* Individual Slot Toggles & Slot IDs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    নির্দিষ্ট প্লেসমেন্ট ও স্লট আইডি কনফিগারেশন (Slot ID Settings)
                  </h4>
                  <span className="text-[11px] text-slate-500">প্রতিটি স্লট আলাদাভাবে অন অথবা অফ করা যায়</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Slot 1: Header */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    headerAdEnabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/60 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        <span className="font-bold text-slate-900">১. হেডার ব্যানার স্লট (Header 728x90)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          headerAdEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {headerAdEnabled ? 'অন (ON)' : 'অফ (OFF)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={headerAdEnabled}
                          onChange={(e) => setHeaderAdEnabled(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      Header Ad Slot ID:
                    </label>
                    <input
                      type="text"
                      value={headerSlotId}
                      onChange={(e) => setHeaderSlotId(e.target.value)}
                      placeholder="e.g. 1234567890"
                      disabled={!headerAdEnabled}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono-numbers text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">হোমপেজ ও প্রশ্নপত্রের উপরে প্রদর্শিত হয়</p>
                  </div>

                  {/* Slot 2: Sidebar */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    sidebarAdEnabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/60 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                        <span className="font-bold text-slate-900">২. সাইডবার ব্যানার স্লট (Sidebar 300x250)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sidebarAdEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {sidebarAdEnabled ? 'অন (ON)' : 'অফ (OFF)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={sidebarAdEnabled}
                          onChange={(e) => setSidebarAdEnabled(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      Sidebar Ad Slot ID:
                    </label>
                    <input
                      type="text"
                      value={sidebarSlotId}
                      onChange={(e) => setSidebarSlotId(e.target.value)}
                      placeholder="e.g. 2345678901"
                      disabled={!sidebarAdEnabled}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono-numbers text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">প্রশ্নপত্র তালিকা ও প্র্যাকটিস পেজের ডানপাশে প্রদর্শিত হয়</p>
                  </div>

                  {/* Slot 3: In-Content */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    contentAdEnabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/60 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <span className="font-bold text-slate-900">৩. ইন-কন্টেন্ট / প্রশ্নপত্রের মাঝে (Fluid)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          contentAdEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {contentAdEnabled ? 'অন (ON)' : 'অফ (OFF)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={contentAdEnabled}
                          onChange={(e) => setContentAdEnabled(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      In-Article Slot ID:
                    </label>
                    <input
                      type="text"
                      value={contentSlotId}
                      onChange={(e) => setContentSlotId(e.target.value)}
                      placeholder="e.g. 3456789012"
                      disabled={!contentAdEnabled}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono-numbers text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">প্রশ্নের বিশদ সমাধান ও প্রতিটি সেকশনের মাঝে প্রদর্শিত হয়</p>
                  </div>

                  {/* Slot 4: Footer */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    footerAdEnabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/60 opacity-70'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span className="font-bold text-slate-900">৪. ফুটার ব্যানার স্লট (Footer Leaderboard)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          footerAdEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {footerAdEnabled ? 'অন (ON)' : 'অফ (OFF)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={footerAdEnabled}
                          onChange={(e) => setFooterAdEnabled(e.target.checked)}
                          className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      Footer Ad Slot ID:
                    </label>
                    <input
                      type="text"
                      value={footerSlotId}
                      onChange={(e) => setFooterSlotId(e.target.value)}
                      placeholder="e.g. 4567890123"
                      disabled={!footerAdEnabled}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono-numbers text-xs disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">ওয়েবসাইটের নিচের অংশে লিডারবোর্ড ব্যানার হিসেবে প্রদর্শিত হয়</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  সংরক্ষণ করার সাথে সাথে সমগ্র ওয়েবসাইটে তাৎক্ষণিকভাবে কার্যকর হবে
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Google AdSense সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Direct Sponsor Campaigns */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">সরাসরি স্পন্সর বিজ্ঞাপন ক্যাম্পেইন</h3>
              <button
                onClick={() => setNewSponsorModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
              >
                + নতুন স্পন্সর যুক্ত করুন
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ক্যাম্পেইন শিরোনাম</th>
                    <th className="py-2.5 px-3">ক্লায়েন্ট / স্পন্সর</th>
                    <th className="py-2.5 px-3">প্লেসমেন্ট</th>
                    <th className="py-2.5 px-3">ইমপ্রেশন</th>
                    <th className="py-2.5 px-3">ক্লিক সংখ্যা</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adsData?.sponsors?.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-800">{s.title}</td>
                      <td className="py-3 px-3 text-slate-600">{s.client_name}</td>
                      <td className="py-3 px-3 font-semibold text-indigo-700 uppercase">{s.placement}</td>
                      <td className="py-3 px-3 font-mono-numbers">{s.impressions || 0}</td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-emerald-600">{s.clicks || 0}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Running
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS (Admin Only) */}
      {activeTab === 'audit' && isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">সিস্টেম সিকিউরিটি ও অডিট লগ</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 uppercase">{log.action}</span>
                  <span className="text-slate-400 font-mono-numbers">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-800">{log.details}</p>
                <p className="text-[11px] text-slate-400">কর্তৃক: {log.admin_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Question Paper Modal */}
      {newPaperModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900">নতুন প্রশ্নপত্র যোগ করুন</h3>
            <form onSubmit={handleCreatePaper} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">ইংরেজি শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newPaperTitle}
                  onChange={(e) => setNewPaperTitle(e.target.value)}
                  placeholder="e.g. 47th BCS Preliminary Question & Solution"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">বাংলা শিরোনাম</label>
                <input
                  type="text"
                  value={newPaperTitleBn}
                  onChange={(e) => setNewPaperTitleBn(e.target.value)}
                  placeholder="যেমন: ৪৭তম বিসিএস প্রিলিমিনারি প্রশ্ন সমাধান"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={newPaperCategory}
                    onChange={(e) => setNewPaperCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="cat_bcs">BCS Examination</option>
                    <option value="cat_bank">Banking Jobs</option>
                    <option value="cat_primary">Primary Teacher</option>
                    <option value="cat_ntrca">NTRCA Recruitment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">সাল</label>
                  <input
                    type="number"
                    value={newPaperYear}
                    onChange={(e) => setNewPaperYear(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">পূর্ণমান</label>
                  <input
                    type="number"
                    value={newPaperTotalMarks}
                    onChange={(e) => setNewPaperTotalMarks(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">সময়কাল (মিনিট)</label>
                  <input
                    type="number"
                    value={newPaperDuration}
                    onChange={(e) => setNewPaperDuration(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="paidPaperCheck"
                  checked={newPaperIsPaid}
                  onChange={(e) => setNewPaperIsPaid(e.target.checked)}
                />
                <label htmlFor="paidPaperCheck" className="font-semibold text-slate-800">
                  এটি একটি প্রিমিয়াম প্রশ্নপত্র (পেইড এক্সেস প্রযোজ্য)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setNewPaperModal(false)}
                  className="px-4 py-2 border rounded text-slate-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add MCQ to Paper Modal */}
      {addQModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900">প্রশ্নপত্রে এমসিকিউ প্রশ্ন যুক্ত করুন</h3>
            <form onSubmit={handleAddQuestionItem} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">প্রশ্নের বিবরণ (Question Text) *</label>
                <textarea
                  required
                  rows={2}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="যেমন: চর্যাপদ কত সালে আবিষ্কৃত হয়?"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">অপশন ১ *</label>
                  <input
                    type="text"
                    required
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">অপশন ২ *</label>
                  <input
                    type="text"
                    required
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">অপশন ৩ *</label>
                  <input
                    type="text"
                    required
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">অপশন ৪ *</label>
                  <input
                    type="text"
                    required
                    value={opt4}
                    onChange={(e) => setOpt4(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">সঠিক উত্তর নির্বাচন করুন *</label>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="opt_1">অপশন ১</option>
                  <option value="opt_2">অপশন ২</option>
                  <option value="opt_3">অপশন ৩</option>
                  <option value="opt_4">অপশন ৪</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিশদ ব্যাখ্যা ও রেফারেন্স</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="সঠিক উত্তরের প্রেক্ষাপট ও তথ্য..."
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddQModal(false)}
                  className="px-4 py-2 border rounded text-slate-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded font-bold"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Exam Modal */}
      {newExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900">অনলাইন মডেল টেস্ট শিডিউল করুন</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">পরীক্ষার নাম (English) *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. 47th BCS Grand Model Test 02"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">পরীক্ষার নাম (বাংলা)</label>
                <input
                  type="text"
                  value={examTitleBn}
                  onChange={(e) => setExamTitleBn(e.target.value)}
                  placeholder="যেমন: ৪৭তম বিসিএস বিশেষ মডেল টেস্ট - ০২"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="cat_bcs">BCS Examination</option>
                    <option value="cat_bank">Banking Jobs</option>
                    <option value="cat_primary">Primary Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">সময়সীমা (মিনিট)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">পূর্ণমান</label>
                  <input
                    type="number"
                    value={examTotalMarks}
                    onChange={(e) => setExamTotalMarks(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">পাস নম্বর</label>
                  <input
                    type="number"
                    value={examPassMarks}
                    onChange={(e) => setExamPassMarks(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">নেগেটিভ মার্ক</label>
                  <input
                    type="text"
                    value={examNegative}
                    onChange={(e) => setExamNegative(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setNewExamModal(false)}
                  className="px-4 py-2 border rounded text-slate-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded font-bold"
                >
                  পরীক্ষা তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Sponsor Modal */}
      {newSponsorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900">নতুন স্পন্সর ক্যাম্পেইন যুক্ত করুন</h3>
            <form onSubmit={handleCreateSponsor} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">বিজ্ঞাপনের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={spnTitle}
                  onChange={(e) => setSpnTitle(e.target.value)}
                  placeholder="যেমন: বিসিএস কেয়ার বিশেষ ভর্তি অফার ২০২৬"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">ক্লায়েন্ট / প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  value={spnClient}
                  onChange={(e) => setSpnClient(e.target.value)}
                  placeholder="যেমন: BCS Care Academy"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">টার্গেট লিংক (URL) *</label>
                <input
                  type="url"
                  required
                  value={spnUrl}
                  onChange={(e) => setSpnUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">বিজ্ঞাপন প্লেসমেন্ট অবস্থান</label>
                <select
                  value={spnPlacement}
                  onChange={(e: any) => setSpnPlacement(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="header">শীর্ষ হেডার (Header Banner)</option>
                  <option value="sidebar">সাইডবার (Sidebar Banner)</option>
                  <option value="question_bottom">প্রশ্নের নিচে (Question Bottom)</option>
                  <option value="footer">ফুটার (Footer Banner)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setNewSponsorModal(false)}
                  className="px-4 py-2 border rounded text-slate-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded font-bold"
                >
                  চালু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
