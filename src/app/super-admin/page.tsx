'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import {
  AdminUser,
  PermissionKey,
  SiteSettings,
  AuditLogEntry,
  AppDirectoryUser,
  TeamContactInfo,
} from '@/types';
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
  Copy,
  Download,
  Search,
  ShieldCheck,
  UserCheck,
  Flame,
  ExternalLink,
  Clock,
  Sparkles,
  Phone,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'teams' | 'users' | 'admins' | 'audit'>('teams');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<AppDirectoryUser[]>([]);
  const [teamContacts, setTeamContacts] = useState<TeamContactInfo[]>([]);
  const [uniqueTeamEmails, setUniqueTeamEmails] = useState<string[]>([]);
  const [directoryStats, setDirectoryStats] = useState<{
    totalUsers: number;
    totalTeams: number;
    totalUniqueTeamEmails: number;
    totalApprovedTeams: number;
    totalAdmins: number;
    activeAdmins: number;
  } | null>(null);

  const [userSearch, setUserSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New admin input
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState<PermissionKey[]>([
    'events.manage',
    'registrations.view',
    'registrations.review',
  ]);

  const [statusMsg, setStatusMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    if (!user || user.role !== 'super_admin') return;
    try {
      const [admRes, setRes, logRes, dirRes] = await Promise.all([
        fetch(`/api/admin/users?actorEmail=${encodeURIComponent(user.email)}`, {
          headers: { 'x-user-email': user.email },
        }),
        fetch('/api/admin/settings', {
          headers: { 'x-user-email': user.email },
        }),
        fetch(`/api/admin/audit-logs?actorEmail=${encodeURIComponent(user.email)}`, {
          headers: { 'x-user-email': user.email },
        }),
        fetch(`/api/admin/directory?actorEmail=${encodeURIComponent(user.email)}`, {
          headers: { 'x-user-email': user.email },
        }),
      ]);
      if (admRes.ok) setAdmins(await admRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
      if (dirRes.ok) {
        const d = await dirRes.json();
        setDirectoryUsers(d.users || []);
        setTeamContacts(d.teamContacts || []);
        setUniqueTeamEmails(d.uniqueTeamEmails || []);
        setDirectoryStats(d.stats || null);
      }
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

  const handleCopyAllTeamEmails = () => {
    if (uniqueTeamEmails.length === 0) {
      toast.error(lang === 'bn' ? 'কোনো টিম ইমেইল পাওয়া যায়নি' : 'No team emails found');
      return;
    }
    const emailString = uniqueTeamEmails.join(', ');
    navigator.clipboard.writeText(emailString);
    toast.success(
      lang === 'bn'
        ? `✓ ${uniqueTeamEmails.length} টি টিমের সকল ইমেইল ক্লিপবোর্ডে কপি করা হয়েছে!`
        : `✓ All ${uniqueTeamEmails.length} team emails copied to clipboard!`
    );
  };

  const handleCopySingle = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      lang === 'bn' ? `✓ ${label} কপি করা হয়েছে!` : `✓ ${label} copied to clipboard!`
    );
  };

  const handleExportTeamEmailsCSV = () => {
    if (teamContacts.length === 0) {
      toast.error(lang === 'bn' ? 'কোনো টিম ডেটা পাওয়া যায়নি' : 'No team data found');
      return;
    }
    const headers = ['Team Name', 'Representative', 'Email', 'Phone', 'Event ID', 'Status', 'Member Count', 'Submitted At'];
    const rows = teamContacts.map((t) => [
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${t.representativeName.replace(/"/g, '""')}"`,
      `"${t.email}"`,
      `"${t.phone}"`,
      `"${t.eventId}"`,
      `"${t.status}"`,
      t.memberCount,
      `"${new Date(t.submittedAt).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iswampur_team_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(lang === 'bn' ? '✓ টিম কন্টাক্ট CSV ফাইল ডাউনলোড হয়েছে!' : '✓ Team contacts CSV downloaded!');
  };

  const handleTogglePermission = async (admin: AdminUser, perm: PermissionKey) => {
    if (!user) return;
    const exists = admin.permissions.includes(perm);
    const updatedPermissions = exists
      ? admin.permissions.filter((p) => p !== perm)
      : [...admin.permissions, perm];

    setActionLoading(`perm_${admin.id}_${perm}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          email: admin.email,
          permissions: updatedPermissions,
          actorEmail: user.email,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success(lang === 'bn' ? 'অনুমতি সফলভাবে আপডেট করা হয়েছে' : 'Permission updated successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'bn' ? 'অনুমতি আপডেটে সমস্যা হয়েছে' : 'Failed to update permission'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    if (!user) return;
    setActionLoading(`active_${admin.id}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          email: admin.email,
          active: !admin.active,
          actorEmail: user.email,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success(lang === 'bn' ? 'অ্যাডমিন স্ট্যাটাস আপডেট হয়েছে' : 'Admin status updated');
      loadData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'bn' ? 'স্ট্যাটাস আপডেটে সমস্যা হয়েছে' : 'Failed to update status'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    if (!user) {
      toast.error(lang === 'bn' ? 'লগইন সেশন পাওয়া যায়নি' : 'Login session required');
      return;
    }

    setActionLoading('add_admin');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          permissions: newPermissions,
          actorEmail: user.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success(
        lang === 'bn'
          ? `✓ অ্যাডমিন (${newEmail}) সফলভাবে তৈরি হয়েছে!`
          : `✓ Admin (${newEmail}) added successfully!`
      );
      setStatusMsg(
        lang === 'bn'
          ? `✓ অ্যাডমিন (${newEmail}) সফলভাবে তৈরি হয়েছে!`
          : `✓ Admin (${newEmail}) added successfully!`
      );
      setNewEmail('');
      setNewName('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'bn' ? 'অ্যাডমিন তৈরিতে ত্রুটি হয়েছে' : 'Error creating admin'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/users?email=${encodeURIComponent(deleteTarget)}&actorEmail=${encodeURIComponent(user.email)}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-email': user.email,
          },
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success(
        lang === 'bn'
          ? `${deleteTarget} কে অ্যাডমিন থেকে অপসারণ করা হয়েছে`
          : `Removed ${deleteTarget} from administrators`
      );
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'bn' ? 'অ্যাডমিন অপসারণে ত্রুটি হয়েছে' : 'Error removing admin'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleReviewer = async (email: string) => {
    if (!settings || !user) return;
    const exists = settings.reviewerAdmins.includes(email);
    const updated = exists
      ? settings.reviewerAdmins.filter((e) => e !== email)
      : [...settings.reviewerAdmins, email];

    setActionLoading(`reviewer_${email}`);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          reviewerAdmins: updated,
          actorEmail: user.email,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success(lang === 'bn' ? 'রিভিউয়ার তালিকা আপডেট হয়েছে' : 'Reviewer list updated');
      loadData();
    } catch (err: any) {
      toast.error(err.message || (lang === 'bn' ? 'রিভিউয়ার আপডেটে ত্রুটি' : 'Error updating reviewers'));
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered lists
  const filteredTeamContacts = teamContacts.filter((t) => {
    const q = teamSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.representativeName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q)
    );
  });

  const filteredDirectoryUsers = directoryUsers.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // 1. Loading authentication (Guaranteed same on SSR and initial client hydration pass)
  if (!mounted || authLoading || (loading && user?.role === 'super_admin')) {
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
    <div className="min-h-screen bg-[#050D24] text-slate-100 p-4 sm:p-8 lg:p-10 space-y-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1d3575] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#F26522] font-black text-xs uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            <span>ROOT SYSTEM AUTHORITY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {lang === 'bn' ? 'সুপার অ্যাডমিন কনসোল ও ডিরেক্টরি' : 'Super Admin Console & Directory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'নিবন্ধিত দলের সকল ইমেইল, সকল লগইনকারী ইউজার ট্র্যাক ও অ্যাডমিন RBAC পারমিশন ব্যবস্থাপনা।'
              : 'Team emails directory, all logged-in community user tracking, and Admin RBAC matrix.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-xl text-xs font-black bg-[#0C1A40] border border-[#1d3575] hover:border-[#F26522] text-white flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#F26522]" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
          <Link
            href="/admin"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0C1A40] border border-[#1d3575] hover:bg-[#112766] text-slate-200 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সাধারণ অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white shadow-md shadow-[#F26522]/20"
          >
            {lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'Visit Site'}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 1. Global Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total Registered Users */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08143A] border border-[#1d3575] relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                {lang === 'bn' ? 'মোট লগইনকারী ইউজার' : 'Total Registered Users'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {directoryStats?.totalUsers ?? directoryUsers.length}
              </span>
              <span className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'জন সক্রিয়' : 'users active'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {lang === 'bn' ? 'Google/সেশন মারফত ট্র্যাকিং' : 'Tracked via authentication'}
            </p>
          </div>

          {/* Total Teams */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08143A] border border-[#1d3575] relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                {lang === 'bn' ? 'নিবন্ধিত টুর্নামেন্ট দল' : 'Registered Teams'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F26522]/15 border border-[#F26522]/30 flex items-center justify-center text-[#F26522]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {directoryStats?.totalTeams ?? teamContacts.length}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {directoryStats?.totalApprovedTeams ?? 0} {lang === 'bn' ? 'অনুমোদিত' : 'approved'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {lang === 'bn' ? 'ঈশ্বমপুর প্রিমিয়ার লীগ (IPL)' : 'Iswampur Premier League'}
            </p>
          </div>

          {/* Unique Team Emails */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08143A] border border-[#1d3575] relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                {lang === 'bn' ? 'ইউনিক টিম ইমেইল' : 'Unique Team Emails'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {uniqueTeamEmails.length}
                </span>
                <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'টি ঠিকানা' : 'addresses'}</span>
              </div>
              <button
                onClick={handleCopyAllTeamEmails}
                className="p-1.5 rounded-lg bg-[#0C1A40] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title={lang === 'bn' ? 'সকল ইমেইল কপি করুন' : 'Copy all emails'}
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'কপি' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {lang === 'bn' ? 'যোগাযোগ ও ব্রডকাস্টের জন্য' : 'Direct mailing contacts'}
            </p>
          </div>

          {/* System Admins */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#08143A] border border-[#1d3575] relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                {lang === 'bn' ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর' : 'Active Admins'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#00A3E0]/15 border border-[#00A3E0]/30 flex items-center justify-center text-[#00A3E0]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {directoryStats?.activeAdmins ?? admins.filter((a) => a.active).length}
              </span>
              <span className="text-[10px] text-slate-400">
                / {admins.length} {lang === 'bn' ? 'নিযুক্ত' : 'total'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              {lang === 'bn' ? 'RBAC পারমিশন প্রাপ্ত' : 'Granular access control'}
            </p>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex border-b border-[#1d3575] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-md'
                : 'bg-[#08143A] text-slate-400 hover:text-white border border-[#1d3575]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টিমের সকল ইমেইল ও যোগাযোগ' : 'Team Emails & Directory'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
              {teamContacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-md'
                : 'bg-[#08143A] text-slate-400 hover:text-white border border-[#1d3575]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{lang === 'bn' ? 'লগইনকারী সকল ইউজার ডিরেক্টরি' : 'All Logged-in Users'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
              {directoryUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-md'
                : 'bg-[#08143A] text-slate-400 hover:text-white border border-[#1d3575]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অ্যাডমিন পারমিশন ও এক্সেস' : 'Admin RBAC Matrix'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
              {admins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-md'
                : 'bg-[#08143A] text-slate-400 hover:text-white border border-[#1d3575]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সিকিউরিটি অডিট ট্রেইল' : 'Audit Logs'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white font-mono">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* 3. Tab Content */}

        {/* TAB 1: TEAM EMAILS & DIRECTORY */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="p-6 rounded-3xl bg-[#08143A] border border-[#1d3575] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#F9A01B]" />
                  <span>{lang === 'bn' ? 'নিবন্ধিত দলের সকল ইমেইল তালিকা' : 'Registered Team Emails Directory'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? `মোট ${teamContacts.length} টি নিবন্ধিত দল এবং ${uniqueTeamEmails.length} টি অনন্য ইমেইল ঠিকানা পাওয়া গেছে।`
                    : `Total ${teamContacts.length} teams registered with ${uniqueTeamEmails.length} unique email addresses.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder={lang === 'bn' ? 'টিমের নাম, ক্যাপ্টেন বা ইমেইল খুঁজুন...' : 'Search team, rep, email...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0C1A40] border border-[#1d3575] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <button
                  onClick={handleCopyAllTeamEmails}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সব টিম ইমেইল কপি করুন' : 'Copy All Team Emails'}</span>
                </button>

                <button
                  onClick={handleExportTeamEmailsCSV}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-[#0C1A40] border border-[#1d3575] hover:border-slate-500 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Quick Email Chips Box */}
            {uniqueTeamEmails.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#071333] border border-[#1d3575]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F9A01B]" />
                    <span>{lang === 'bn' ? 'কপিযোগ্য ইউনিক ইমেইল তালিকা:' : 'Quick Copy Email List:'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {uniqueTeamEmails.length} {lang === 'bn' ? 'টি অনন্য ইমেইল' : 'unique emails'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {uniqueTeamEmails.map((email) => (
                    <button
                      key={email}
                      onClick={() => handleCopySingle(email, email)}
                      className="px-2.5 py-1 rounded-lg bg-[#0C1A40] hover:bg-[#152a60] border border-[#1d3575] text-[11px] text-slate-300 font-mono flex items-center gap-1.5 transition-colors"
                      title={lang === 'bn' ? 'ইমেইল কপি করতে ক্লিক করুন' : 'Click to copy email'}
                    >
                      <span>{email}</span>
                      <Copy className="w-3 h-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Contacts Table */}
            <div className="rounded-3xl bg-[#08143A] border border-[#1d3575] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0C1A40] text-slate-400 uppercase font-bold border-b border-[#1d3575]">
                    <tr>
                      <th className="p-3.5">{lang === 'bn' ? 'দলের নাম' : 'Team Name'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'প্রতিনিধি / ক্যাপ্টেন' : 'Representative'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}</th>
                      <th className="p-3.5 text-center">{lang === 'bn' ? 'প্লেয়ার' : 'Players'}</th>
                      <th className="p-3.5 text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="p-3.5 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d3575]/50">
                    {filteredTeamContacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          {lang === 'bn' ? 'কোনো টিম পাওয়া যায়নি।' : 'No team contacts found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTeamContacts.map((t, idx) => (
                        <tr key={t.registrationId || idx} className="hover:bg-[#0C1A40]/40 transition-colors">
                          <td className="p-3.5">
                            <p className="font-black text-white">{t.teamName}</p>
                            <p className="text-[10px] font-mono text-slate-500">{t.registrationId}</p>
                          </td>
                          <td className="p-3.5 text-slate-300 font-semibold">{t.representativeName}</td>
                          <td className="p-3.5 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`mailto:${t.email}`}
                                className="text-cyan-400 hover:underline"
                                title="Send mail"
                              >
                                {t.email}
                              </a>
                              <button
                                onClick={() => handleCopySingle(t.email, t.teamName + ' ইমেইল')}
                                className="p-1 hover:text-white text-slate-500"
                                title="Copy email"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{t.phone}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-300">{t.memberCount}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                t.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : t.status === 'REJECTED'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <a
                              href={`mailto:${t.email}?subject=Iswampur%20IPL%20Team%20Update`}
                              className="px-2.5 py-1 rounded-lg bg-[#0C1A40] hover:bg-[#152a60] border border-[#1d3575] text-slate-300 text-[11px] font-semibold inline-flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3 text-[#F26522]" />
                              <span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span>
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGGED-IN USERS TRACKING DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#08143A] border border-[#1d3575] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'লগইনকারী সকল ব্যবহারকারী ডিরেক্টরি' : 'All Logged-in Users Directory'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'ওয়েবসাইটে Google অথেনটিকেশন বা সেশনের মাধ্যমে প্রবেশকারী সকল ইউজার ও তাদের লগইন সংখ্যা।'
                    : 'Real-time directory of every user who has signed in, with timestamps and login counts.'}
                </p>
              </div>

              <div className="relative min-w-[220px] sm:min-w-[280px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'নাম, ইমেইল বা রোল খুঁজুন...' : 'Search user, email or role...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0C1A40] border border-[#1d3575] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="rounded-3xl bg-[#08143A] border border-[#1d3575] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0C1A40] text-slate-400 uppercase font-bold border-b border-[#1d3575]">
                    <tr>
                      <th className="p-3.5">{lang === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email'}</th>
                      <th className="p-3.5 text-center">{lang === 'bn' ? 'ভূমিকা (Role)' : 'Role'}</th>
                      <th className="p-3.5 text-center">{lang === 'bn' ? 'লগইন সংখ্যা' : 'Logins'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'প্রথম প্রবেশ' : 'First Login'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'সর্বশেষ প্রবেশ' : 'Last Login'}</th>
                      <th className="p-3.5 text-right">{lang === 'bn' ? 'কপি' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d3575]/50">
                    {filteredDirectoryUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          {lang === 'bn' ? 'কোনো ব্যবহারকারী পাওয়া যায়নি।' : 'No users found in directory.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDirectoryUsers.map((u) => (
                        <tr key={u.email} className="hover:bg-[#0C1A40]/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img
                                  src={u.photoURL}
                                  alt={u.displayName}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#19398A] to-[#F26522] flex items-center justify-center text-white font-black text-xs">
                                  {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-white">{u.displayName}</p>
                                <p className="text-[10px] font-mono text-slate-500">{u.uid}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">{u.email}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                u.role === 'super_admin'
                                  ? 'bg-[#F26522] text-white'
                                  : u.role === 'admin'
                                  ? 'bg-[#19398A] text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                            {u.loginCount || 1} {lang === 'bn' ? 'বার' : 'times'}
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                            {u.firstLoginAt ? new Date(u.firstLoginAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleCopySingle(u.email, u.displayName + ' ইমেইল')}
                              className="p-1.5 rounded-lg bg-[#0C1A40] hover:bg-[#152a60] text-slate-400 hover:text-white border border-[#1d3575] transition-colors"
                              title="Copy email"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN PERMISSIONS & ACCESS */}
        {activeTab === 'admins' && (
          <div className="space-y-8">
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
                      {actionLoading === `reviewer_${admin.email}` ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#F9A01B]" />
                      ) : isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#F9A01B]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
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
                                  disabled={isRoot || actionLoading === `perm_${adm.id}_${perm.key}`}
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
                                  {actionLoading === `perm_${adm.id}_${perm.key}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-[#F9A01B] mx-auto" />
                                  ) : hasPerm ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            );
                          })}

                          <td className="p-3 text-center">
                            <button
                              disabled={isRoot || actionLoading === `active_${adm.id}`}
                              onClick={() => handleToggleActive(adm)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                adm.active
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-rose-950 text-rose-400'
                              }`}
                            >
                              {actionLoading === `active_${adm.id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                              ) : adm.active ? (
                                lang === 'bn' ? 'সক্রিয়' : 'Active'
                              ) : (
                                lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'
                              )}
                            </button>
                          </td>

                          <td className="p-3 text-right">
                            {!isRoot && (
                              <button
                                onClick={() => setDeleteTarget(adm.email)}
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
                  disabled={actionLoading === 'add_admin'}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 text-white shadow-md flex items-center gap-1.5"
                >
                  {actionLoading === 'add_admin' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'যুক্ত হচ্ছে...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'অ্যাডমিন হিসেবে যুক্ত করুন' : 'Add as Administrator'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#08143A] border border-[#1d3575] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#00A3E0] font-bold text-sm">
              <History className="w-5 h-5" />
              <span>{lang === 'bn' ? 'সিকিউরিটি অডিট ট্রেইল (Audit Logs)' : 'Security Audit Trail'}</span>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-xl border border-[#1d3575]">
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
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        {lang === 'bn' ? 'কোনো অডিট লগ রেকর্ড নেই।' : 'No audit logs recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Admin Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title={lang === 'bn' ? 'অ্যাডমিন অপসারণ নিশ্চিতকরণ' : 'Confirm Admin Removal'}
          message={
            lang === 'bn'
              ? `আপনি কি নিশ্চিত যে '${deleteTarget}' কে অ্যাডমিন প্যানেল থেকে অপসারণ করতে চান? তার সকল অ্যাডমিন অনুমতি বাতিল হয়ে যাবে।`
              : `Are you sure you want to remove '${deleteTarget}' from administrators? All their admin privileges will be revoked.`
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, অপসারণ করুন' : 'Yes, Remove Admin'}
          cancelText={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
