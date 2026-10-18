import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ApiClient } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const PremiumPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedPkgId = searchParams.get('pkg');
  const { user, activeEntitlement, refreshUser } = useAuth();

  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const paymentNumbers = {
    bkash: '01711-000111 (Merchant / Send Money)',
    nagad: '01811-222333 (Merchant / Send Money)',
    rocket: '01911-444555-8 (Personal)',
    bank: 'Islami Bank Bangladesh Ltd, A/C: 205012345678, Branch: Panthapath',
  };

  useEffect(() => {
    ApiClient.getPackages()
      .then(res => {
        setPackages(res.data);
        if (preselectedPkgId) {
          const match = res.data.find((p: any) => p.id === preselectedPkgId);
          if (match) {
            setSelectedPkg(match);
            setModalOpen(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (user) {
      ApiClient.getUserOrders()
        .then(res => setOrders(res.data))
        .catch(() => {});
    }
  }, [preselectedPkgId, user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleOpenPurchase = (pkg: any) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('প্যাকেজ ক্রয় করতে প্রথমে লগইন করুন।');
      return;
    }
    if (!transactionId.trim() || !senderNumber.trim()) {
      alert('অনুগ্রহ করে ট্রানজেকশন আইডি এবং প্রেরক নম্বর লিখুন।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ApiClient.createOrder({
        package_id: selectedPkg.id,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim(),
        sender_number: senderNumber.trim(),
      });

      setOrderSuccessMsg(res.message);
      setModalOpen(false);
      setTransactionId('');
      setSenderNumber('');

      // Refresh orders
      const updatedOrders = await ApiClient.getUserOrders();
      setOrders(updatedOrders.data);
    } catch (e: any) {
      alert(e.message || 'রিকুয়েস্ট সাবমিট ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>প্রিমিয়াম প্রিপারেশন মেম্বারশিপ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          সরকারি চাকরি ও বিসিএস পরীক্ষার সেরা প্রস্তুতি নিন
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          সকল প্রিমিয়াম প্রশ্নের সমাধান, গণিতের শর্টকাট অ্যানালাইসিস এবং লাইভ মডেল টেস্টের অল-এক্সেস পাস সংগ্রহ করুন।
        </p>

        {/* Active Entitlement Notice if already subscribed */}
        {activeEntitlement && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>
                আপনার <strong>প্রিমিয়াম পাস সক্রিয় আছে</strong>। মেয়াদ উত্তীর্ণ হবে: {new Date(activeEntitlement.expires_at).toLocaleDateString()}
              </span>
            </div>
            <Link to="/questions" className="font-bold underline text-emerald-800">
              প্রশ্নপত্র অনুশীলন করুন →
            </Link>
          </div>
        )}
      </div>

      {/* Success Banner */}
      {orderSuccessMsg && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!</p>
            <p className="mt-0.5">{orderSuccessMsg}</p>
            <p className="mt-1 text-slate-600">
              অ্যাডমিন ভেরিফিকেশন সম্পন্ন হলে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে প্রিমিয়াম অ্যাক্সেস চালু হয়ে যাবে। (নিচের তালিকা থেকে স্ট্যাটাস দেখতে পারেন)
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={`rounded-2xl p-6 bg-white border flex flex-col justify-between transition-all ${
              pkg.badge ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-xl' : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 font-mono-numbers">
                  {pkg.duration_days} দিনের মেয়াদ
                </span>
                {pkg.badge && (
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900">{pkg.name_bn || pkg.name}</h3>

              <div className="flex items-baseline gap-1 font-mono-numbers pt-2">
                <span className="text-3xl font-extrabold text-slate-900">৳{pkg.discount_price_bdt || pkg.price_bdt}</span>
                {pkg.discount_price_bdt && (
                  <span className="text-sm text-slate-400 line-through">৳{pkg.price_bdt}</span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                {pkg.features?.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenPurchase(pkg)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                প্যাকেজটি সাবস্ক্রাইব করুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Verification & Payment Flow Instructions */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <span>পেমেন্ট ও ভেরিফিকেশন প্রক্রিয়া (Payment Instructions)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono-numbers">১</span>
            <h4 className="font-bold text-slate-800 text-sm">টাকা পাঠান (Send Money)</h4>
            <p>আপনার বিকাশ, নগদ বা রকেট অ্যাকাউন্ট থেকে নির্ধারিত ফি উপরের অফিসিয়াল নাম্বারে সেন্ড মানি করুন।</p>
          </div>
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono-numbers">২</span>
            <h4 className="font-bold text-slate-800 text-sm">তথ্য জমা দিন (Submit Details)</h4>
            <p>প্যাকেজ নির্বাচন করে পেমেন্ট করার পর প্রাপ্ত ট্রানজেকশন আইডি (Txn ID) ও আপনার মোবাইল নম্বর ফর্মটিতে দিন।</p>
          </div>
          <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center font-mono-numbers">৩</span>
            <h4 className="font-bold text-slate-800 text-sm">তাৎক্ষণিক অনুমোদন (Approval)</h4>
            <p>অ্যাডমিন পেমেন্ট স্টেটমেন্ট যাচাই করে অনুমোদন দেওয়ার সাথে সাথেই আপনার প্রিমিয়াম এক্সেস চালু হবে।</p>
          </div>
        </div>
      </div>

      {/* User's Order History Table */}
      {user && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">আপনার ক্রয়কৃত প্যাকেজ ও পেমেন্ট হিস্ট্রি</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">অর্ডার আইডি</th>
                  <th className="py-2.5 px-3">প্যাকেজের নাম</th>
                  <th className="py-2.5 px-3">পেমেন্ট মাধ্যম</th>
                  <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                  <th className="py-2.5 px-3">টাকার পরিমাণ</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono-numbers font-medium text-slate-900">{order.order_number}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{order.package_name}</td>
                    <td className="py-3 px-3 uppercase text-slate-600">{order.payment_method}</td>
                    <td className="py-3 px-3 font-mono-numbers text-slate-700">{order.transaction_id}</td>
                    <td className="py-3 px-3 font-mono-numbers font-bold text-slate-900">৳{order.amount_bdt}</td>
                    <td className="py-3 px-3">
                      {order.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : order.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono-numbers">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Submission Modal */}
      {modalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">পেমেন্ট ভেরিফিকেশন ও অর্ডার নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">{selectedPkg.name_bn || selectedPkg.name} ({selectedPkg.duration_days} দিন)</p>
              </div>
              <span className="text-xl font-extrabold text-indigo-600 font-mono-numbers">
                ৳{selectedPkg.discount_price_bdt || selectedPkg.price_bdt}
              </span>
            </div>

            {/* Step 1: Select method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">পেমেন্ট মাধ্যম বেছে নিন</label>
              <div className="grid grid-cols-4 gap-2">
                {(['bkash', 'nagad', 'rocket', 'bank'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border uppercase transition-colors ${
                      paymentMethod === method
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant info box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <p className="text-slate-500">টাকা পাঠানোর নির্ধারিত অফিসিয়াল একাউন্ট:</p>
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 font-mono-numbers select-all">
                  {paymentNumbers[paymentMethod]}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentNumbers[paymentMethod])}
                  className="text-indigo-600 hover:text-indigo-800 p-1"
                  title="Copy number"
                >
                  {copiedNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                * নির্ধারিত ফি পাঠিয়ে নিচের ফর্মে ট্রানজেকশন আইডি (Txn ID) লিখুন।
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  আপনার প্রেরক মোবাইল নম্বর (Sender Number) *
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="যেমন: 017xxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ট্রানজেকশন আইডি (Transaction ID / TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: BKS9A77X092 বা NGD8291..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono-numbers"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  {submitting ? 'যাচাই করা হচ্ছে...' : 'পেমেন্ট রিকোয়েস্ট সাবমিট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
