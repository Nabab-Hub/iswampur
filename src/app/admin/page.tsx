'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { TeamRegistration, VillageEvent } from '@/types';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ArrowRight,
  QrCode,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { lang, t, resolveBilingual } = useLanguage();
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [regRes, evRes] = await Promise.all([
          fetch('/api/registrations'),
          fetch('/api/events'),
        ]);
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData);
        }
        if (evRes.ok) {
          const evData = await evRes.json();
          setEvents(evData);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const pendingCount = registrations.filter((r) => r.status === 'PENDING_REVIEW').length;
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = registrations.filter((r) => r.status === 'REJECTED').length;
  const totalRevenue = registrations
    .filter((r) => r.status === 'APPROVED')
    .reduce((acc, curr) => acc + (curr.payment?.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] mt-1 font-semibold">
            {lang === 'bn'
              ? 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম ও আইপিএল ২০২৬ রিয়েল-টাইম তথ্য ও পরিসংখ্যান।'
              : 'Real-time overview, tournament statistics, and registrations for Iswampur.'}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'মোট দল নিবন্ধন' : 'Total Teams'}
              </span>
              <Users className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
            </div>
            <p className="text-3xl font-black text-[#08143A] dark:text-white">
              {registrations.length}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
              {lang === 'bn' ? 'সকল টুর্নামেন্ট ও ইভেন্ট' : 'All Tournaments & Events'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#F26522] dark:text-[#F9A01B]">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'যাচাইনাধীন (Pending)' : 'Pending Review'}
              </span>
              <Clock className="w-5 h-5 text-[#F26522]" />
            </div>
            <p className="text-3xl font-black text-[#F26522] dark:text-[#F9A01B]">{pendingCount}</p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
              {lang === 'bn' ? 'পর্যালোচনার অপেক্ষায় রয়েছে' : 'Awaiting Reviewer Action'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'অনুমোদিত দল' : 'Approved Squads'}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-500">{approvedCount}</p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
              {lang === 'bn' ? 'পাস প্রস্তুত ও প্রেরিত' : 'Passes Issued & Sent'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#19398A] dark:text-[#00A3E0]">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'সংগৃহীত নিবন্ধন ফি' : 'Total Revenue'}
              </span>
              <IndianRupee className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
            </div>
            <p className="text-3xl font-black text-[#19398A] dark:text-[#00A3E0]">₹{totalRevenue}</p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
              {lang === 'bn' ? 'অনুমোদিত পেমেন্ট যাচাই' : 'From Approved Registrations'}
            </p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-4 shadow-sm">
          <h3 className="font-black text-xs sm:text-sm text-[#08143A] dark:text-white uppercase tracking-wider">
            {lang === 'bn' ? 'দ্রুত পদক্ষেপ (Quick Actions)' : 'Quick Actions'}
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/registrations"
              className="px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-2 shadow-md shadow-[#F26522]/20 uppercase tracking-wider transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'bn' ? `নিবন্ধন পর্যালোচনা করুন (${pendingCount})` : `Review Registrations (${pendingCount})`}</span>
            </Link>

            <Link
              href="/admin/events"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#071333] dark:hover:bg-[#0d1f4d] text-slate-800 dark:text-slate-100 flex items-center gap-2 border border-slate-200 dark:border-[#1d3575] dark:hover:border-[#F26522]/60 transition-all hover:scale-[1.02] shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#F26522]" />
              <span>{lang === 'bn' ? 'নতুন অনুষ্ঠান তৈরি করুন' : 'Create New Event'}</span>
            </Link>

            <Link
              href="/admin/checkin"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#071333] dark:hover:bg-[#0d1f4d] text-slate-800 dark:text-slate-100 flex items-center gap-2 border border-slate-200 dark:border-[#1d3575] dark:hover:border-[#00A3E0]/60 transition-all hover:scale-[1.02] shadow-xs"
            >
              <QrCode className="w-4 h-4 text-[#00A3E0]" />
              <span>{lang === 'bn' ? 'মাঠে কিউআর স্ক্যান করুন' : 'Matchday QR Scanner'}</span>
            </Link>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] p-6 space-y-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'সাম্প্রতিক দল নিবন্ধন তালিকা' : 'Recent Team Registrations'}
            </h3>
            <Link
              href="/admin/registrations"
              className="text-xs font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] flex items-center gap-1"
            >
              <span>{lang === 'bn' ? 'সকল দেখুন' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f4fa] dark:bg-[#071333] text-[#64748B] dark:text-[#94A3B8] font-black uppercase">
                <tr>
                  <th className="p-3">{lang === 'bn' ? 'দলের নাম' : 'Team Name'}</th>
                  <th className="p-3">{lang === 'bn' ? 'প্রতিনিধি' : 'Representative'}</th>
                  <th className="p-3">{lang === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                  <th className="p-3">{lang === 'bn' ? 'জমা তারিখ' : 'Submitted At'}</th>
                  <th className="p-3">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-3 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbd9ec] dark:divide-[#1d3575]">
                {registrations.slice(0, 5).map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#f0f4fa] dark:hover:bg-[#0a1945]">
                    <td className="p-3 font-black text-[#08143A] dark:text-white">
                      {reg.team.name}
                    </td>
                    <td className="p-3 text-[#273656] dark:text-[#CBD5E1] font-semibold">
                      {reg.team.representativeName}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#08143A] dark:text-white">{reg.team.phone}</td>
                    <td className="p-3 text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
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
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/registrations?id=${reg.id}`}
                        className="px-2.5 py-1 rounded-lg bg-[#e6eef8] dark:bg-[#112766] text-[#08143A] dark:text-white hover:bg-[#F26522] hover:text-white font-black transition-colors"
                      >
                        {lang === 'bn' ? 'পর্যালোচনা' : 'Review'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
