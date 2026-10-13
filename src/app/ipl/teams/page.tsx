'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { TeamRegistration } from '@/types';
import { Users, ArrowLeft, ShieldCheck, Trophy, CheckCircle2 } from 'lucide-react';

export default function ApprovedTeamsPage() {
  const { lang, t } = useLanguage();
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch('/api/registrations?status=APPROVED&public=true');
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
        }
      } catch (err) {
        console.error('Failed to fetch teams', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/ipl"
            className="inline-flex items-center gap-2 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আইপিএল হাবে ফিরে যান' : 'Back to IPL Hub'}</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#19398A] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>OFFICIALLY VERIFIED SQUADS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'অনুমোদিত দলসমূহ (Approved Teams)' : 'Approved Tournament Squads'}
            </h1>
            <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn'
                ? `টুর্নামেন্টে অংশগ্রহণের জন্য চূড়ান্ত অনুমোদিত মোট দল: ${registrations.length} টি`
                : `Total officially approved tournament squads: ${registrations.length}`}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#273656] dark:text-[#CBD5E1] font-bold">
              {lang === 'bn' ? 'দল তালিকা লোড হচ্ছে...' : 'Loading squads...'}
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
              <Users className="w-12 h-12 text-[#64748B] dark:text-[#94A3B8] mx-auto" />
              <p className="text-base text-[#273656] dark:text-[#CBD5E1] font-bold">
                {lang === 'bn'
                  ? 'এখনো কোনো দলের অনুমোদন প্রক্রিয়া সম্পন্ন হয়নি।'
                  : 'No squads have been approved yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522] p-6 space-y-5 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      <span>{lang === 'bn' ? 'অনুমোদিত দল' : 'VERIFIED SQUAD'}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-[#F9A01B]" />
                      <span>{lang === 'bn' ? 'অফিসিয়াল দল' : 'Official Squad'}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#08143A] dark:text-white line-clamp-1">
                      {reg.team.name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 font-semibold">
                      {lang === 'bn' ? 'ঠিকানা:' : 'Address:'} {reg.team.address || 'Iswampur'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-xs space-y-1">
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      {lang === 'bn' ? 'দল প্রতিনিধি / অধিনায়ক:' : 'Representative / Captain:'}
                    </p>
                    <p className="font-black text-[#08143A] dark:text-white">
                      {reg.team.representativeName}
                    </p>
                    <p className="text-[#64748B] dark:text-[#94A3B8] pt-1 font-semibold">
                      {lang === 'bn' ? 'নিবন্ধিত খেলোয়াড় সংখ্যা:' : 'Squad Size:'}
                    </p>
                    <p className="font-black text-[#19398A] dark:text-[#00A3E0]">
                      {reg.team.members.length} {lang === 'bn' ? 'জন খেলোয়াড়' : 'Players'}
                    </p>
                  </div>

                  {/* Player names preview list */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                      {lang === 'bn' ? 'খেলোয়াড় তালিকা:' : 'SQUAD ROSTER:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {reg.team.members.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#e6eef8] dark:bg-[#112766] text-[11px] font-bold text-[#08143A] dark:text-white"
                        >
                          {m.name}
                          {m.role === 'captain' ? (
                            <span className="ml-1 text-[9px] text-[#F26522] font-black">(C)</span>
                          ) : m.role === 'vice_captain' ? (
                            <span className="ml-1 text-[9px] text-[#00A3E0] font-black">(VC)</span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#cbd9ec] dark:border-[#1d3575] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'কমিটি দ্বারা যাচাইকৃত' : 'Committee Verified'}</span>
                    </span>
                    <span>{lang === 'bn' ? 'আইপিএল ২০২৬' : 'IPL 2026'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
