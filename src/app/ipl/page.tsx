'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { IPLSeason, TeamRegistration } from '@/types';
import { Trophy, FileText, Users, ArrowRight, Calendar, MapPin, CheckCircle2, Flame, ShieldCheck, Sparkles } from 'lucide-react';

export default function IPLHomePage() {
  const { lang, t, resolveBilingual } = useLanguage();
  const [season, setSeason] = useState<IPLSeason | null>(null);
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/registrations?status=APPROVED');
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
        }
      } catch (err) {
        console.error('Failed to load approved teams', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Official IPL Broadcast Header */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#06122C] via-[#0A1B44] to-[#102A6B] text-white p-8 sm:p-12 lg:p-16 border-2 border-[#1E3B8A] shadow-2xl">
            {/* Floodlight Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F26522]/25 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00A3E0]/20 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F26522] text-white text-xs font-black uppercase tracking-widest shadow-md">
                  <Flame className="w-4 h-4 text-white" />
                  <span>{lang === 'bn' ? 'অফিসিয়াল আইপিএল হাব ২০২৬' : 'OFFICIAL IPL HUB 2026'}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  {lang === 'bn' ? (
                    <>
                      ইস্বামপুর <span className="ipl-gradient-text-gold">প্রিমিয়ার লীগ ২০২৬</span>
                    </>
                  ) : (
                    <>
                      Iswampur <span className="ipl-gradient-text-gold">Premier League 2026</span>
                    </>
                  )}
                </h1>

                <p className="text-[#CBD5E1] text-base sm:text-lg leading-relaxed font-normal">
                  {lang === 'bn'
                    ? 'ঐতিহ্যবাহী ইস্বামপুর গ্রামের বার্ষিক টেনিস বল ক্রিকেট মহাযজ্ঞ। ১৬টি সেরা দলের তীব্র প্রতিদ্বন্দ্বিতা, অনলাইন দল নিবন্ধন ও ডিজিটাল ভেরিফাইড কিউআর পাস।'
                    : 'The historic annual tennis ball cricket extravaganza of Iswampur village. 16 champion squads, online team registration, and digitally verified QR passes.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/register/iswampur-premier-league-2026"
                    className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-lg shadow-[#F26522]/30 transition-all flex items-center gap-2 uppercase tracking-wider text-sm sm:text-base"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'দল নিবন্ধন করুন' : 'Register Team Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/ipl/rules"
                    className="px-5 py-3.5 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-sm sm:text-base"
                  >
                    <FileText className="w-4 h-4 text-[#F9A01B]" />
                    <span>{t.ipl.rulesTab}</span>
                  </Link>

                  <Link
                    href="/ipl/teams"
                    className="px-5 py-3.5 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Users className="w-4 h-4 text-[#00A3E0]" />
                    <span>
                      {lang === 'bn' ? `অনুমোদিত দলসমূহ (${registrations.length})` : `Approved Squads (${registrations.length})`}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Tournament Logo Display Column */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-3xl bg-[#08143A]/80 border-2 border-[#1E3B8A] p-6 shadow-2xl flex items-center justify-center backdrop-blur-sm">
                  <Image
                    src="/logo-square-web.png"
                    alt="Iswampur Premier League Official Emblem"
                    width={280}
                    height={280}
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Venue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-2 shadow-sm">
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-wider">
                {lang === 'bn' ? 'অনুমোদিত দল' : 'APPROVED TEAMS'}
              </p>
              <p className="text-3xl font-black text-[#F26522] dark:text-[#F9A01B]">
                {registrations.length} / 16
              </p>
              <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-semibold">
                {lang === 'bn' ? 'অনলাইন যাচাই সম্পন্ন' : 'Online Verified'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-2 shadow-sm">
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-wider">
                {lang === 'bn' ? 'খেলার ফরম্যাট' : 'MATCH FORMAT'}
              </p>
              <p className="text-2xl font-black text-[#08143A] dark:text-white">
                {lang === 'bn' ? '১০ ওভার নকআউট' : '10 Overs Knockout'}
              </p>
              <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-semibold">
                {lang === 'bn' ? 'ফাইনাল ম্যাচ ১২ ওভার' : 'Final Match 12 Overs'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-2 shadow-sm">
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-wider">
                {lang === 'bn' ? 'খেলার তারিখ' : 'TOURNAMENT DATES'}
              </p>
              <p className="text-xl font-black text-[#08143A] dark:text-white">
                {lang === 'bn' ? '২০-২৫ ডিসেম্বর, ২০২৬' : '20-25 Dec, 2026'}
              </p>
              <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-semibold">
                {lang === 'bn' ? 'শনিবার থেকে বৃহস্পতিবার' : 'Saturday to Thursday'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-2 shadow-sm">
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-wider">
                {lang === 'bn' ? 'খেলার মাঠ' : 'GROUND VENUE'}
              </p>
              <p className="text-lg font-black text-[#19398A] dark:text-[#00A3E0] truncate">
                {lang === 'bn' ? 'হাইস্কুল কেন্দ্রীয় মাঠ' : 'High School Ground'}
              </p>
              <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-semibold">
                {lang === 'bn' ? 'ইস্বামপুর পঞ্চায়েত এলাকা' : 'Iswampur Area'}
              </p>
            </div>
          </div>

          {/* Rules Preview Box */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
              <div className="flex items-center gap-2 text-[#08143A] dark:text-white font-black text-xl">
                <FileText className="w-5 h-5 text-[#F26522]" />
                <span>{lang === 'bn' ? 'মৌলিক টুর্নামেন্ট নিয়মাবলী সংক্ষেপ' : 'Key Tournament Rules Summary'}</span>
              </div>
              <Link
                href="/ipl/rules"
                className="text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] hover:underline"
              >
                {lang === 'bn' ? 'সম্পূর্ণ নিয়মাবলী দেখুন →' : 'View Full Rules →'}
              </Link>
            </div>

            <div className="whitespace-pre-line text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] leading-relaxed font-medium">
              {lang === 'bn'
                ? `১. প্রতিটি দলে নূন্যতম ১১ জন এবং অনধিক ১৫ জন খেলোয়াড় থাকতে হবে।
২. ম্যাচটি টেনিস বল নকআউট ফরম্যাটে অনুষ্ঠিত হবে (সাধারণ ম্যাচ ১০ ওভার, ফাইনাল ১২ ওভার)।
৩. নিবন্ধিত খেলোয়াড় ব্যতীত বাইরের কোনো খেলোয়াড় মাঠে নামানো যাবে না।
৪. আম্পায়ারের সিদ্ধান্ত চূড়ান্ত বলে গণ্য হবে।
৫. মাঠে প্রবেশের সময় অফিসিয়াল ডিজিটাল কিউআর টিম পাস প্রদর্শন বাধ্যতামূলক।`
                : `1. Each squad must have a minimum of 11 and a maximum of 15 registered players.
2. The tournament follows a Tennis Ball Knockout format (10 overs regular, 12 overs final).
3. Only registered players are eligible to play on match day.
4. The on-field umpire's decision is final and binding.
5. Presenting the official digital QR team pass at the ground entrance is mandatory.`}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
