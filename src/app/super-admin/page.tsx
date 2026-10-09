'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import { AdminUser, PermissionKey, SiteSettings, AuditLogEntry } from '@/types';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Mail,
  History,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Globe,
  LogOut,
} from 'lucide-react';

const ALL_PERMISSIONS: { key: PermissionKey; labelBn: string; labelEn: string }[] = [
  { key: 'events.manage', labelBn: 'অনুষ্ঠান তৈরি ও সম্পাদনা (Events)', labelEn: 'Events Management' },
  { key: 'gallery.manage', labelBn: 'গ্যালারি ছবি ও ক্যাপশন (Gallery)', labelEn: 'Gallery Management' },
  { key: 'notices.manage', labelBn: 'বিজ্ঞপ্তি ও ঘোষণা (Announcements)', labelEn: 'Notices & Announcements' },
  { key: 'content.manage', labelBn: 'সাইট কন্টেন্ট ও হোমপেজ (Content)', labelEn: 'Site Content & Home' },
  { key: 'registrations.view', labelBn: 'দল নিবন্ধন দেখা (View Reg)', labelEn: 'View Registrations' },
  { key: 'registrations.review', labelBn: 'অনুমোদন ও পাস ইস্যু (Review/Approve)', labelEn: 'Review & Issue Passes' },
  { key: 'registrations.export', labelBn: 'CSV এক্সপোর্ট (Export)', labelEn: 'Export Registrations (CSV)' },
  { key: 'payments.verify', labelBn: 'পেমেন্ট স্ক্রিনশট যাচাই (Payment)', labelEn: 'Verify Payment Screenshots' },
  { key: 'passes.manage', labelBn: 'টিম পাস ব্যবস্থাপনা (Passes)', labelEn: 'Team Passes Management' },
  { key: 'matchday.checkin', labelBn: 'মাঠের কিউআর চেক-ইন (Matchday Checkin)', labelEn: 'Matchday QR Check-in' },
  { key: 'ipl.manage', labelBn: 'আইপিএল রুলস ও টুর্নামেন্ট (IPL)', labelEn: 'IPL Rules & Tournament' },
  { key: 'settings.manage', labelBn: 'সিস্টেম সেটিংস (Settings)', labelEn: 'System Settings' },
];

export default function SuperAdminPage() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New admin input
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState<PermissionKey[]>([
    'events.manage',
    'registrations.view',
    'registrations.review',
  ]);

  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    if (!user || user.role !== 'super_admin') return;
    try {
      const [admRes, setRes, logRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'x-user-email': user.email } }),
        fetch('/api/admin/settings', { headers: { 'x-user-email': user.email } }),
        fetch('/api/admin/audit-logs', { headers: { 'x-user-email': user.email } }),
      ]);
      if (admRes.ok) setAdmins(await admRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === 'super_admin') {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleTogglePermission = async (admin: AdminUser, perm: PermissionKey) => {
    const exists = admin.permissions.includes(perm);
    const updatedPermissions = exists
      ? admin.permissions.filter((p) => p !== perm)
      : [...admin.permissions, perm];

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: admin.email,
          permissions: updatedPermissions,
        }),
      });
      loadData();
    } catch {
      alert(lang === 'bn' ? 'অনুমতি আপডেটে সমস্যা হয়েছে' : 'Failed to update permission');
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: admin.email,
          active: !admin.active,
        }),
      });
      loadData();
    } catch {
      alert(lang === 'bn' ? 'স্ট্যাটাস আপডেটে সমস্যা হয়েছে' : 'Failed to update status');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          permissions: newPermissions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setStatusMsg(
        lang === 'bn'
          ? `✓ অ্যাডমিন (${newEmail}) সফলভাবে তৈরি হয়েছে!`
          : `✓ Admin (${newEmail}) added successfully!`
      );
      setNewEmail('');
      setNewName('');
      loadData();
    } catch (err: any) {
      alert(err.message || (lang === 'bn' ? 'অ্যাডমিন তৈরিতে ত্রুটি হয়েছে' : 'Error creating admin'));
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    const confirmMsg =
      lang === 'bn'
        ? `আপনি কি নিশ্চিত যে ${email} কে অ্যাডমিন থেকে অপসারণ করতে চান?`
        : `Are you sure you want to remove ${email} from admins?`;
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || (lang === 'bn' ? 'অ্যাডমিন অপসারণে ত্রুটি হয়েছে' : 'Error removing admin'));
    }
  };

  const handleToggleReviewer = async (email: string) => {
    if (!settings) return;
    const exists = settings.reviewerAdmins.includes(email);
    const updated = exists
      ? settings.reviewerAdmins.filter((e) => e !== email)
      : [...settings.reviewerAdmins, email];

    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerAdmins: updated }),
    });
    loadData();
  };

  // 1. Loading authentication
  if (authLoading || (loading && user?.role === 'super_admin')) {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#F26522] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">
          {lang === 'bn' ? 'সুপার অ্যাডমিন অনুমতি যাচাই করা হচ্ছে...' : 'Verifying Root System Authority...'}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state (Prompt Sign in)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#071333] border border-rose-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {lang === 'bn' ? 'সুপার অ্যাডমিন লগইন আবশ্যক' : 'Super Admin Login Required'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'সুপার অ্যাডমিন কনসোলে প্রবেশের জন্য অনুমোদিত সুপার অ্যাডমিন অ্যাকাউন্টে সাইন-ইন করুন।'
                : 'Access to the Super Admin Console is strictly restricted. Please sign in with primary root credentials.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F26522]/30"
            >
              <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
            </button>

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized state (Logged in, but not super_admin)
  if (user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#071333] border border-rose-500/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-black uppercase tracking-wider">
              403 FORBIDDEN - ROOT ONLY
            </div>
            <h2 className="text-2xl font-black text-white">
              {lang === 'bn' ? 'অননুমোদিত সুপার অ্যাডমিন কনসোল' : 'Super Admin Access Restricted'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? `আপনার অ্যাকাউন্ট (${user.email}) এর সুপার অ্যাডমিন অনুমতি নেই। এই কনসোলটি শুধুমাত্র চিফ সিস্টেম অ্যাডমিনিস্ট্রেটরের জন্য সংরক্ষিত।`
                : `Your account (${user.email}) does not have Super Admin authority. This console is restricted exclusively to primary root administrators.`}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#19398A] to-[#1e4bb8] text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#19398A]/30 border border-[#F9A01B]/30"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সাধারণ অ্যাডমিন প্যানেলে যান' : 'Go to Admin Panel'}</span>
              </Link>
            )}

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Home'}</span>
            </Link>

            <button
              onClick={signOut}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগআউট / অন্য অ্যাকাউন্ট' : 'Sign Out / Switch Account'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050D24] text-slate-100 p-6 sm:p-10 space-y-10">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1d3575] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#F26522] font-black text-xs uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>ROOT SYSTEM AUTHORITY</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            {lang === 'bn' ? 'সুপার অ্যাডমিন কনসোল' : 'Super Admin Console'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'অ্যাডমিন অনুমতি ম্যাট্রিক্স, রিভিউয়ার রাউটিং এবং সিকিউরিটি অডিট লগ।'
              : 'Admin RBAC permission matrix, reviewer routing, and security audit logs.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl text-xs font-black bg-[#0C1A40] border border-[#1d3575] hover:border-[#F26522] text-white flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#F26522]" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0C1A40] border border-[#1d3575] hover:bg-[#112766] text-slate-200 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সাধারণ অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white"
          >
            {lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'Visit Site'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 1. Reviewer Admin Routing Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08143A] border border-[#1d3575] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#F9A01B] font-bold text-sm">
            <Mail className="w-5 h-5" />
            <span>
              {lang === 'bn'
                ? 'আইপিএল নিবন্ধন রিভিউয়ার রাউটিং (Registration Reviewer Routing)'
                : 'Registration Reviewer Routing'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'নতুন দল নিবন্ধন ও পেমেন্ট স্ক্রিনশট জমা পড়লে স্বয়ংক্রিয়ভাবে নোটিফিকেশন ইমেইল পৌঁছানোর জন্য রিভিউয়ার অ্যাডমিন নির্বাচন করুন:'
              : 'Select which admins receive instant notification emails when teams register or submit payment screenshots:'}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {admins.map((admin) => {
              const isSelected = settings?.reviewerAdmins.includes(admin.email);
              return (
                <button
                  key={admin.id}
                  onClick={() => handleToggleReviewer(admin.email)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#F9A01B]/20 border-[#F9A01B] text-[#F9A01B] shadow-sm'
                      : 'bg-[#0C1A40] border-[#1d3575] text-slate-400 hover:text-white'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-[#F9A01B]" /> : <Square className="w-4 h-4" />}
                  <span>{admin.email}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Admin Permission Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08143A] border border-[#1d3575] space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1d3575] pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {lang === 'bn' ? 'অ্যাডমিন পারমিশন ম্যাট্রিক্স (RBAC Matrix)' : 'Admin RBAC Permissions Matrix'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'প্রতিটি অ্যাডমিনের জন্য সুনির্দিষ্ট দায়িত্ব ও অনুমতি নির্ধারণ করুন। পরিবর্তন রিয়েল-টাইমে কার্যকর হবে।'
                  : 'Assign granular permissions to admins. Changes take effect in real time.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C1A40] text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3">{lang === 'bn' ? 'অ্যাডমিন / ভূমিকা' : 'Admin / Role'}</th>
                  {ALL_PERMISSIONS.map((perm) => (
                    <th key={perm.key} className="p-2 text-center whitespace-nowrap">
                      {perm.key.split('.')[0]}
                    </th>
                  ))}
                  <th className="p-3 text-center">{lang === 'bn' ? 'সক্রিয়' : 'Active'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d3575]/50">
                {admins.map((adm) => {
                  const isRoot = adm.role === 'super_admin';
                  return (
                    <tr key={adm.id} className="hover:bg-[#0C1A40]/40">
                      <td className="p-3">
                        <p className="font-bold text-white">{adm.name || adm.email}</p>
                        <p className="font-mono text-[10px] text-slate-400">{adm.email}</p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                            isRoot ? 'bg-[#F26522] text-white' : 'bg-[#19398A] text-white'
                          }`}
                        >
                          {adm.role}
                        </span>
                      </td>

                      {ALL_PERMISSIONS.map((perm) => {
                        const hasPerm = isRoot || adm.permissions.includes(perm.key);
                        return (
                          <td key={perm.key} className="p-2 text-center">
                            <button
                              disabled={isRoot}
                              onClick={() => handleTogglePermission(adm, perm.key)}
                              className={`p-1 rounded transition-colors ${
                                isRoot
                                  ? 'text-[#F9A01B] opacity-60 cursor-not-allowed'
                                  : hasPerm
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={lang === 'bn' ? perm.labelBn : perm.labelEn}
                            >
                              {hasPerm ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center">
                        <button
                          disabled={isRoot}
                          onClick={() => handleToggleActive(adm)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            adm.active
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {adm.active ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        {!isRoot && (
                          <button
                            onClick={() => handleDeleteAdmin(adm.email)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded"
                            title={lang === 'bn' ? 'মুছুন' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Add New Admin Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08143A] border border-[#1d3575] space-y-4 max-w-2xl shadow-sm">
          <h3 className="font-bold text-base text-white">
            {lang === 'bn' ? 'নতুন অ্যাডমিন নিয়োগ করুন' : 'Add New Administrator'}
          </h3>
          <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Google Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#1d3575] bg-[#0C1A40] text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">
                  {lang === 'bn' ? 'অ্যাডমিনের নাম' : 'Admin Full Name'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'উদাঃ রফিক শেখ' : 'e.g. Rafiq Sheikh'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#1d3575] bg-[#0C1A40] text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অ্যাডমিন হিসেবে যুক্ত করুন' : 'Add as Administrator'}</span>
            </button>
          </form>
        </div>

        {/* 4. Security Audit Logs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#08143A] border border-[#1d3575] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#00A3E0] font-bold text-sm">
            <History className="w-5 h-5" />
            <span>{lang === 'bn' ? 'সিকিউরিটি অডিট ট্রেইল (Audit Logs)' : 'Security Audit Trail'}</span>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-xl border border-[#1d3575]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C1A40] text-slate-400 sticky top-0 uppercase font-bold">
                <tr>
                  <th className="p-3">{lang === 'bn' ? 'সময়' : 'Timestamp'}</th>
                  <th className="p-3">{lang === 'bn' ? 'অ্যাক্টর' : 'Actor'}</th>
                  <th className="p-3">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                  <th className="p-3">{lang === 'bn' ? 'টার্গেট' : 'Target'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d3575]/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0C1A40]/40">
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-white">{log.actorEmail}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#0C1A40] text-emerald-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{log.targetId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
