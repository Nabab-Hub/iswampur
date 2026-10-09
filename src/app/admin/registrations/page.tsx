'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import { TeamRegistration } from '@/types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function RegistrationsReviewContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const { lang, t } = useLanguage();
  const toast = useToast();
  const { user, hasPermission } = useAuth();
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedReg, setSelectedReg] = useState<TeamRegistration | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'CORRECTION_REQUIRED' | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadRegistrations = async () => {
    try {
      const res = await fetch('/api/registrations');
      if (res.ok) {
        const data: TeamRegistration[] = await res.json();
        setRegistrations(data);
        if (highlightId) {
          const found = data.find((r) => r.id === highlightId);
          if (found) setSelectedReg(found);
        }
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [highlightId]);

  const handleReviewSubmit = async () => {
    if (!selectedReg || !reviewAction) return;

    if ((reviewAction === 'REJECT' || reviewAction === 'CORRECTION_REQUIRED') && !reviewReason.trim()) {
      toast.warning(
        lang === 'bn'
          ? 'প্রত্যাখ্যান বা সংশোধনের জন্য কারণ উল্লেখ করা বাধ্যতামূলক।'
          : 'Please provide a reason for rejection or correction.'
      );
      return;
    }

    setProcessing(true);
    setActionSuccessMsg('');

    try {
      const res = await fetch(`/api/registrations/${selectedReg.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          reason: reviewReason.trim(),
          actorEmail: user?.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || (lang === 'bn' ? 'পর্যালোচনা ব্যর্থ হয়েছে' : 'Review action failed'));

      const successMsg =
        reviewAction === 'APPROVE'
          ? (lang === 'bn'
            ? `✓ দলটি অনুমোদিত হয়েছে এবং ডিজিটাল টিম পাস (${resData.humanPassCode}) ইমেইলে প্রেরিত হয়েছে!`
            : `✓ Squad approved! Digital Team Pass (${resData.humanPassCode}) issued and emailed.`)
          : (lang === 'bn'
            ? `✓ দলের অবস্থা পরিবর্তন করা হয়েছে (${resData.status}) এবং ইমেইল নোটিফিকেশন পাঠানো হয়েছে।`
            : `✓ Registration status updated (${resData.status}) and email notification dispatched.`);

      setActionSuccessMsg(successMsg);
      toast.success(successMsg);

      // Refresh list
      await loadRegistrations();
      setSelectedReg(null);
      setReviewAction(null);
      setReviewReason('');
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    const headers = ['Registration ID', 'Team Name', 'Representative', 'Email', 'Phone', 'Members Count', 'UTR', 'Status', 'Pass Code'];
    const rows = registrations.map((r) => [
      r.id,
      `"${r.team.name.replace(/"/g, '""')}"`,
      `"${r.team.representativeName.replace(/"/g, '""')}"`,
      r.team.email,
      r.team.phone,
      r.team.members.length,
      r.payment.utr || '',
      r.status,
      r.humanPassCode || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Iswampur_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = registrations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.team.name.toLowerCase().includes(q) ||
      r.team.representativeName.toLowerCase().includes(q) ||
      r.team.phone.includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.payment.utr && r.payment.utr.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'ALL':
        return lang === 'bn' ? 'সকল' : 'All';
      case 'PENDING_REVIEW':
        return lang === 'bn' ? 'যাচাইনাধীন' : 'Pending';
      case 'APPROVED':
        return lang === 'bn' ? 'অনুমোদিত' : 'Approved';
      case 'CORRECTION_REQUIRED':
        return lang === 'bn' ? 'সংশোধন প্রয়োজন' : 'Correction Needed';
      case 'REJECTED':
        return lang === 'bn' ? 'বাতিল' : 'Rejected';
      default:
        return st;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'দল নিবন্ধন ও পেমেন্ট পর্যালোচনা' : 'Team Registrations & Payment Review'}
          </h1>
          <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] mt-1 font-semibold">
            {lang === 'bn'
              ? 'আবেদনসমূহের পেমেন্ট স্ক্রিনশট, খেলোয়াড় তালিকা যাচাই এবং অনুমোদন / বাতিলকরণ।'
              : 'Review submitted payment screenshots, squad rosters, and approve or reject submissions.'}
          </p>
        </div>

        {hasPermission('registrations.export') && (
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-white hover:border-[#F26522] flex items-center gap-2 shadow-xs shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'bn' ? 'CSV এক্সপোর্ট করুন' : 'Export CSV'}</span>
          </button>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'দলের নাম, মোবাইল বা UTR...' : 'Search squad, phone or UTR...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-xs focus:border-[#F26522]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'CORRECTION_REQUIRED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-[#19398A] text-white shadow-xs'
                  : 'bg-[#e6eef8] dark:bg-[#112766] text-[#273656] dark:text-[#CBD5E1] hover:text-[#08143A] dark:hover:text-white'
              }`}
            >
              {getStatusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4fa] dark:bg-[#071333] text-[#64748B] dark:text-[#94A3B8] font-black uppercase">
              <tr>
                <th className="p-3.5">{lang === 'bn' ? 'দলের নাম' : 'Team Name'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'দল প্রতিনিধি' : 'Representative'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'সদস্য' : 'Players'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'UTR / ফি' : 'UTR / Fee'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'বর্তমান অবস্থা' : 'Status'}</th>
                <th className="p-3.5 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd9ec] dark:divide-[#1d3575]">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#f0f4fa] dark:hover:bg-[#0a1945]">
                  <td className="p-3.5">
                    <p className="font-black text-[#08143A] dark:text-white">{reg.team.name}</p>
                    <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">{reg.id}</p>
                  </td>
                  <td className="p-3.5 text-[#273656] dark:text-[#CBD5E1] font-semibold">
                    {reg.team.representativeName}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#08143A] dark:text-white">{reg.team.phone}</td>
                  <td className="p-3.5 font-bold text-[#19398A] dark:text-[#00A3E0]">
                    {reg.team.members.length} {lang === 'bn' ? 'জন' : 'Players'}
                  </td>
                  <td className="p-3.5">
                    <p className="font-black text-[#08143A] dark:text-white">₹{reg.payment.amount}</p>
                    <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px]">
                      {reg.payment.utr || 'N/A'}
                    </p>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        reg.status === 'APPROVED'
                          ? 'bg-emerald-500 text-white'
                          : reg.status === 'REJECTED'
                          ? 'bg-rose-600 text-white'
                          : reg.status === 'CORRECTION_REQUIRED'
                          ? 'bg-[#F26522] text-white'
                          : 'bg-[#19398A] text-white'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedReg(reg)}
                      className="px-3 py-1.5 rounded-lg font-black text-xs bg-[#e6eef8] dark:bg-[#112766] text-[#08143A] dark:text-white hover:bg-[#F26522] hover:text-white transition-colors"
                    >
                      {lang === 'bn' ? 'পর্যালোচনা' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Review Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1a40] rounded-3xl border border-[#cbd9ec] dark:border-[#1d3575] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#e6eef8] dark:bg-[#112766] text-[#19398A] dark:text-[#00A3E0]">
                  {selectedReg.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#08143A] dark:text-white mt-1">
                  {selectedReg.team.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-2 text-[#64748B] hover:text-[#08143A] dark:hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Info & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1.5">
                <p className="text-[#F26522] uppercase font-black">
                  {lang === 'bn' ? 'দল ও প্রতিনিধি তথ্য' : 'SQUAD & CONTACT INFO'}
                </p>
                <p><strong>{lang === 'bn' ? 'প্রতিনিধি:' : 'Representative:'}</strong> {selectedReg.team.representativeName}</p>
                <p><strong>{lang === 'bn' ? 'ঠিকানা:' : 'Address:'}</strong> {selectedReg.team.address}</p>
                <p><strong>{lang === 'bn' ? 'মোবাইল:' : 'Phone:'}</strong> {selectedReg.team.phone}</p>
                <p><strong>{lang === 'bn' ? 'জরুরি নম্বর:' : 'Emergency:'}</strong> {selectedReg.team.emergencyPhone || 'N/A'}</p>
                <p><strong>{lang === 'bn' ? 'ইমেইল:' : 'Email:'}</strong> {selectedReg.team.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1.5">
                <p className="text-[#19398A] dark:text-[#00A3E0] uppercase font-black">
                  {lang === 'bn' ? 'পেমেন্ট বিবরণ' : 'PAYMENT DETAILS'}
                </p>
                <p><strong>{lang === 'bn' ? 'ফি:' : 'Fee:'}</strong> ₹{selectedReg.payment.amount}</p>
                <p><strong>{lang === 'bn' ? 'UTR:' : 'UTR / Txn ID:'}</strong> {selectedReg.payment.utr || 'N/A'}</p>
                <p><strong>{lang === 'bn' ? 'জমার সময়:' : 'Submitted:'}</strong> {new Date(selectedReg.createdAt).toLocaleString()}</p>
                {selectedReg.humanPassCode && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#F9A01B] to-[#F26522] text-[#050D24] flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
                        {lang === 'bn' ? 'অফিসিয়াল পাস কোড (PASS CODE)' : 'OFFICIAL PASS CODE / ID'}
                      </span>
                      <span className="font-mono text-base font-black tracking-wider block select-all">
                        {selectedReg.humanPassCode}
                      </span>
                    </div>
                    {selectedReg.passId && (
                      <a
                        href={`/verify/${selectedReg.passId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#050D24] text-white text-xs font-bold hover:bg-[#112766] transition-colors"
                      >
                        {lang === 'bn' ? 'পাস দেখুন →' : 'View Pass →'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Screenshot */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট:' : 'Payment Screenshot:'}
              </p>
              <div className="rounded-2xl overflow-hidden border border-[#cbd9ec] dark:border-[#1d3575] bg-[#050d24] p-2 text-center">
                <img
                  src={selectedReg.payment.screenshotUrl}
                  alt="Payment Screenshot"
                  className="max-h-72 object-contain mx-auto rounded-xl"
                />
                <a
                  href={selectedReg.payment.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F9A01B] hover:underline mt-2"
                >
                  <span>{lang === 'bn' ? 'নতুন ট্যাবে বড় করে দেখুন' : 'View Full Image'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Squad Players */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'bn' ? `খেলোয়াড় তালিকা (${selectedReg.team.members.length} জন):` : `Squad Roster (${selectedReg.team.members.length}):`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedReg.team.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-xs flex justify-between items-center"
                  >
                    <span className="font-semibold">{idx + 1}. {m.name}</span>
                    {m.role && <span className="text-[10px] text-[#F26522] uppercase font-bold">{m.role}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Actions */}
            {hasPermission('registrations.review') && (
              <div className="pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
                <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                  {lang === 'bn' ? 'পর্যালোচনা সিদ্ধান্ত গ্রহণ করুন:' : 'Take Review Decision:'}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setReviewAction('APPROVE')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'অনুমোদন করুন (Approve & Pass)' : 'Approve & Issue Pass'}</span>
                  </button>

                  <button
                    onClick={() => setReviewAction('CORRECTION_REQUIRED')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      reviewAction === 'CORRECTION_REQUIRED'
                        ? 'bg-[#F26522] text-white shadow-md'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সংশোধন চান (Request Correction)' : 'Request Correction'}</span>
                  </button>

                  <button
                    onClick={() => setReviewAction('REJECT')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      reviewAction === 'REJECT'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বাতিল করুন (Reject)' : 'Reject Squad'}</span>
                  </button>
                </div>

                {reviewAction && (
                  <div className="p-4 rounded-2xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-3 animate-in fade-in">
                    <label className="block text-xs font-black text-[#08143A] dark:text-white">
                      {reviewAction === 'APPROVE'
                        ? (lang === 'bn' ? 'অভিনন্দন বার্তা / নোট (ঐচ্ছিক):' : 'Approval Note (Optional):')
                        : (lang === 'bn' ? 'কারণ বা নোট (ইমেইলে পাঠানো হবে) *:' : 'Reason / Note (Emailed to Team) *:')}
                    </label>
                    <textarea
                      rows={2}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder={
                        reviewAction === 'APPROVE'
                          ? (lang === 'bn' ? 'পেমেন্ট ও দল সঠিক রয়েছে।' : 'Payment verified and squad accepted.')
                          : (lang === 'bn' ? 'উদাঃ প্রেরিত স্ক্রিনশটে ট্রানজ্যাকশন আইডি অস্পষ্ট। পুনরায় আপলোড করুন।' : 'e.g. Screenshot UTR is unreadable. Please re-upload.')
                      }
                      className="w-full p-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] text-[#08143A] dark:text-white font-semibold text-xs focus:border-[#F26522]"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setReviewAction(null);
                          setReviewReason('');
                        }}
                        className="px-3 py-1.5 text-xs text-[#64748B] font-bold"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        disabled={processing}
                        onClick={handleReviewSubmit}
                        className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-60 text-white shadow-md uppercase tracking-wider flex items-center gap-1.5"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                          </>
                        ) : (
                          <span>{lang === 'bn' ? 'সিদ্ধান্ত চূড়ান্ত করুন' : 'Confirm Decision'}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationsReviewPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-center text-[#64748B]">Loading...</div>}>
        <RegistrationsReviewContent />
      </Suspense>
    </AdminLayout>
  );
}
