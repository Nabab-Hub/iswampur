'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { FileText, ArrowLeft, ShieldCheck, Trophy } from 'lucide-react';

export default function IPLRulesPage() {
  const { lang, t } = useLanguage();

  const rulesBn = `১. প্রতিটি দল নূন্যতম ১১ জন এবং অনধিক ১৫ জন খেলোয়াড় নিবন্ধন করতে পারবে।
২. ম্যাচটি টেনিস বল নকআউট ফরম্যাটে অনুষ্ঠিত হবে (সাধারণ ম্যাচ ১০ ওভার, সেমিফাইনাল ও ফাইনাল ১২ ওভার)।
৩. নিবন্ধিত খেলোয়াড় ব্যতীত বাইরের কোনো খেলোয়াড় ম্যাচ খেলতে পারবে না।
৪. আম্পায়ারের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে; কোনো ধরনের অসদাচরণ বা রেফারির সাথে তর্ক বরদাস্ত করা হবে না।
৫. মাঠে প্রবেশের সময় প্রতিটি দলের অফিসিয়াল ডিজিটাল কিউআর টিম পাস প্রদর্শন বাধ্যতামূলক।
৬. টুর্নামেন্ট ফি ₹১,৫০০ টাকা অনলাইনেই প্রদান করতে হবে এবং কোনো অবস্থাতেই তা অফেরতযোগ্য।
৭. নির্ধারিত সময়ের ১৫ মিনিট পূর্বে দলকে মাঠে উপস্থিত হতে হবে, অন্যথায় ওয়াক-ওভার প্রদান করা হবে।`;

  const rulesEn = `1. Each squad can register a minimum of 11 and a maximum of 15 players.
2. The tournament follows a Tennis Ball Knockout format (10 overs regular matches, 12 overs semi-final & final).
3. Only officially registered and approved players are permitted to play on matchday.
4. The on-field umpire's decision is final and binding; misbehavior or arguing will lead to immediate disqualification.
5. Presenting the official digital QR team pass at the ground entrance is mandatory.
6. The registration entry fee of ₹1,500 must be paid online and is strictly non-refundable.
7. Teams must report to the ground at least 15 minutes prior to the scheduled match time; failure to do so will result in a walk-over.`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/ipl"
            className="inline-flex items-center gap-2 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আইপিএল হাবে ফিরে যান' : 'Back to IPL Hub'}</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F26522] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>OFFICIAL TOURNAMENT RULES &amp; REGULATIONS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#08143A] dark:text-white">
              {lang === 'bn'
                ? 'ইস্বামপুর প্রিমিয়ার লীগ ২০২৬ - টুর্নামেন্ট নিয়মাবলী'
                : 'Iswampur Premier League 2026 - Official Rules'}
            </h1>
            <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn' ? 'নিয়মাবলী সংস্করণ: ২০২৬-১ | পরিচালনা কমিটি' : 'Rules Version: 2026-v1 | IPL Organizing Committee'}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#F26522] dark:text-[#F9A01B] font-black border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575] text-lg">
              <ShieldCheck className="w-5 h-5" />
              <span>{lang === 'bn' ? 'অফিসিয়াল টুর্নামেন্ট গাইডলাইন' : 'Official Tournament Guidelines'}</span>
            </div>

            <div className="whitespace-pre-line text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] leading-relaxed font-medium">
              {lang === 'bn' ? rulesBn : rulesEn}
            </div>

            <div className="pt-6 border-t border-[#cbd9ec] dark:border-[#1d3575] flex justify-end">
              <Link
                href="/register/iswampur-premier-league-2026"
                className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-md transition-all text-sm uppercase tracking-wider"
              >
                {lang === 'bn' ? 'শর্ত মেনে দল নিবন্ধন করুন →' : 'Accept & Register Team →'}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
