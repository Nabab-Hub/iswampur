'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { Trophy, Award, Medal, Crown, Sparkles, Calendar, Filter } from 'lucide-react';
import { firePartyPopper } from '@/lib/confetti';
import { TournamentBracketData, TournamentStandings } from '@/types';

interface HistoricalWinnerRecord {
  year: number;
  month: string;
  tournamentName: { bn: string; en: string };
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

const HISTORICAL_ARCHIVE: HistoricalWinnerRecord[] = [
  {
    year: 2025,
    month: '12',
    tournamentName: {
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৫ (নবম বর্ষ)',
      en: 'Iswampur Premier League 2025 (9th Edition)',
    },
    champion: 'ঈশ্বমপুর রয়্যালস (Iswampur Royals)',
    runnerUp: 'মিলন সংঘ একাদশ (Milan Sangha XI)',
    thirdPlace: 'নবোদয় ক্রিকেট ক্লাব (Nabodoy CC)',
  },
  {
    year: 2024,
    month: '12',
    tournamentName: {
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৪ (অষ্টম বর্ষ)',
      en: 'Iswampur Premier League 2024 (8th Edition)',
    },
    champion: 'তরুণ সংঘ ক্রিকেট ক্লাব (Tarun Sangha CC)',
    runnerUp: 'ঈশ্বমপুর ওয়ারিয়র্স (Iswampur Warriors)',
    thirdPlace: 'সূর্যতোরণ স্পোর্টিং (Suryatoran Sporting)',
  },
  {
    year: 2023,
    month: '12',
    tournamentName: {
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৩ (সপ্তম বর্ষ)',
      en: 'Iswampur Premier League 2023 (7th Edition)',
    },
    champion: 'ঈশ্বমপুর ফাইটার্স (Iswampur Fighters)',
    runnerUp: 'ব্ল্যাক প্যান্থার্স (Black Panthers)',
    thirdPlace: 'গ্রামীন বিকাশ একাদশ (Gramin Bikash XI)',
  },
];

const MONTHS = [
  { val: 'all', bn: 'সব মাস (All)', en: 'All Months' },
  { val: '12', bn: 'ডিসেম্বর', en: 'December' },
  { val: '10', bn: 'অক্টোবর', en: 'October' },
  { val: '08', bn: 'আগস্ট', en: 'August' },
  { val: '04', bn: 'এপ্রিল', en: 'April' },
  { val: '01', bn: 'জানুয়ারি', en: 'January' },
];

const YEARS = [2026, 2025, 2024, 2023];

interface Props {
  eventId?: string;
  initialBracket?: TournamentBracketData | null;
}

export default function TournamentPodium({ eventId = 'event-ipl-2026', initialBracket = null }: Props) {
  const { lang } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [bracket, setBracket] = useState<TournamentBracketData | null>(initialBracket);

  useEffect(() => {
    async function fetchActiveBracket() {
      try {
        const res = await fetch(`/api/tournaments/${eventId}/bracket`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBracket(data.bracket || null);
        }
      } catch (err) {
        console.error('Failed to load bracket in podium:', err);
      }
    }
    fetchActiveBracket();
  }, [eventId]);

  // Determine current active podium data or historical archive
  let title = {
    bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ (১০ম বর্ষ)',
    en: 'Iswampur Premier League 2026 (10th Edition)',
  };
  let firstTeam = '';
  let secondTeam = '';
  let thirdTeam = '';
  let isUnderway = false;

  if (selectedYear === 2026) {
    if (bracket?.standings?.champion) {
      firstTeam = bracket.standings.champion.name;
      secondTeam = bracket.standings.runnerUp?.name || (lang === 'bn' ? 'রানার্স-আপ নির্ধারিত হচ্ছে' : 'Runner-up TBD');
      thirdTeam = bracket.standings.thirdPlace?.name || (lang === 'bn' ? 'তৃতীয় স্থান নির্ধারিত হচ্ছে' : '3rd Place TBD');
    } else {
      isUnderway = true;
      firstTeam = lang === 'bn' ? 'শীর্ষস্থান নির্ধারণী ম্যাচ চলমান' : 'Finalists in Action';
      secondTeam = lang === 'bn' ? 'সেমিফাইনালিস্ট দল' : 'Contending Squad';
      thirdTeam = lang === 'bn' ? 'সেমিফাইনালিস্ট দল' : 'Contending Squad';
    }
  } else {
    // Historical
    const record = HISTORICAL_ARCHIVE.find(
      (h) => h.year === selectedYear && (selectedMonth === 'all' || h.month === selectedMonth)
    ) || HISTORICAL_ARCHIVE.find((h) => h.year === selectedYear) || HISTORICAL_ARCHIVE[0];

    title = record.tournamentName;
    firstTeam = record.champion;
    secondTeam = record.runnerUp;
    thirdTeam = record.thirdPlace;
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-[#071333] border-2 border-[#cbd9ec] dark:border-[#1d3575] p-6 sm:p-10 shadow-xl space-y-8 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F9A01B]/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#00A3E0]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top Header with Year & Month Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#cbd9ec] dark:border-[#1d3575] pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F26522]/15 text-[#F26522] text-xs font-black uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-[#F9A01B]" />
            <span>{lang === 'bn' ? 'অফিসিয়াল পোডিয়াম ও চ্যাম্পিয়নস তালিকা' : 'OFFICIAL VICTORY PODIUM & HONOR ROLL'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white mt-1.5">
            {lang === 'bn' ? '১ম, ২য় ও ৩য় স্থান বিজয়ী মঞ্চ' : '1st, 2nd & 3rd Place Championship Podium'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {title[lang] || title.bn}
          </p>
        </div>

        {/* Year and Month Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Year Filter */}
          <div className="flex items-center gap-1 bg-[#f0f4fa] dark:bg-[#0c1a40] p-1 rounded-2xl border border-[#cbd9ec] dark:border-[#1d3575]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {YEARS.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-[#050D24] shadow-md shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] text-xs font-bold text-[#08143A] dark:text-white focus:outline-hidden cursor-pointer shadow-xs"
          >
            {MONTHS.map((m) => (
              <option key={m.val} value={m.val} className="dark:bg-[#08143A]">
                {m[lang] || m.bn}
              </option>
            ))}
          </select>

          {/* Party Popper Celebration Button */}
          <button
            onClick={() => firePartyPopper()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title={lang === 'bn' ? 'উৎসব উদযাপন করুন (Party Popper)' : 'Celebrate with Confetti!'}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        THE 3-TIER OLYMPIC PODIUM MATCHING USER'S ASCII ART
                   |'''''|
                   |     ''''''|
         ____|''''           |_____
         (Left: 2nd, Center: 1st [Tallest], Right: 3rd [Lowest])
        ========================================================================
      */}
      <div className="relative z-10 pt-4 pb-2">
        <div className="max-w-3xl mx-auto flex items-end justify-center gap-2 sm:gap-4 md:gap-6">
          {/* ================================================================
              2ND PLACE (LEFT - MID HEIGHT)
              ================================================================ */}
          <div className="flex-1 max-w-[200px] flex flex-col items-center text-center">
            {/* Team Info Above Podium */}
            <div className="space-y-1 mb-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-500 border border-slate-300 dark:border-slate-400 flex items-center justify-center mx-auto shadow-md text-slate-800 dark:text-slate-100">
                <Medal className="w-6 h-6 text-slate-400 dark:text-slate-200" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block">
                🥈 {lang === 'bn' ? '২য় স্থান (রানার্স-আপ)' : '2nd Place (Runner-up)'}
              </span>
              <h4 className="font-black text-xs sm:text-sm text-[#08143A] dark:text-white line-clamp-2 px-1">
                {secondTeam}
              </h4>
            </div>

            {/* Podium Pillar Step (Mid Height: h-36 sm:h-44) */}
            <div className="w-full h-32 sm:h-44 rounded-t-2xl bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border-t-4 border-x border-slate-200 dark:border-slate-500 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
              <span className="text-4xl sm:text-6xl font-black text-white/90 drop-shadow-md">
                2
              </span>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mt-1">
                RUNNER-UP
              </span>
            </div>
          </div>

          {/* ================================================================
              1ST PLACE (CENTER - TALLEST & GLOWING CHAMPION)
              ================================================================ */}
          <div className="flex-1 max-w-[240px] flex flex-col items-center text-center z-10">
            {/* Team Info Above Podium */}
            <div className="space-y-1.5 mb-3 animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#F26522] via-[#F9A01B] to-[#FFD700] p-1 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 text-white animate-pulse">
                  <Trophy className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md" />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Crown className="w-6 h-6 text-[#FFD700] fill-[#FFD700] filter drop-shadow-lg" />
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-[#050D24] shadow-md inline-block">
                🏆 {lang === 'bn' ? '১ম স্থান (চ্যাম্পিয়ন)' : '1st Place (Champion)'}
              </span>
              <h3 className="font-black text-sm sm:text-base text-[#08143A] dark:text-white line-clamp-2 px-1">
                {firstTeam}
              </h3>
            </div>

            {/* Podium Pillar Step (Tallest Height: h-48 sm:h-60) */}
            <div className="w-full h-44 sm:h-60 rounded-t-3xl bg-gradient-to-b from-[#F9A01B] via-[#E57E00] to-[#B35900] dark:from-[#F9A01B] dark:via-[#C96B00] dark:to-[#783700] border-t-4 border-x border-[#FFD700] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
              <span className="text-6xl sm:text-8xl font-black text-white drop-shadow-lg">
                1
              </span>
              <span className="text-[11px] sm:text-xs font-black text-amber-950 dark:text-amber-100 uppercase tracking-widest mt-1 bg-white/20 px-3 py-0.5 rounded-full">
                CHAMPION
              </span>
            </div>
          </div>

          {/* ================================================================
              3RD PLACE (RIGHT - LOWEST HEIGHT)
              ================================================================ */}
          <div className="flex-1 max-w-[200px] flex flex-col items-center text-center">
            {/* Team Info Above Podium */}
            <div className="space-y-1 mb-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 dark:from-amber-950 dark:to-amber-800 border border-amber-600 dark:border-amber-700 flex items-center justify-center mx-auto shadow-md text-amber-200">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 inline-block">
                🥉 {lang === 'bn' ? '৩য় স্থান (সেকেন্ড রানার্স-আপ)' : '3rd Place (2nd Runner-up)'}
              </span>
              <h4 className="font-black text-xs sm:text-sm text-[#08143A] dark:text-white line-clamp-2 px-1">
                {thirdTeam}
              </h4>
            </div>

            {/* Podium Pillar Step (Lowest Height: h-24 sm:h-32) */}
            <div className="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 dark:from-amber-800 dark:via-amber-900 dark:to-stone-950 border-t-4 border-x border-amber-500 shadow-md flex flex-col items-center justify-center relative overflow-hidden group">
              <span className="text-4xl sm:text-5xl font-black text-amber-100/90 drop-shadow-md">
                3
              </span>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest mt-0.5">
                3RD PLACE
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal Ground Base Foundation: ____|''''           |_____ */}
        <div className="max-w-3xl mx-auto h-4 rounded-b-2xl bg-gradient-to-r from-slate-400 via-amber-500 to-slate-400 dark:from-slate-700 dark:via-amber-600 dark:to-slate-700 shadow-md border-t border-white/20" />
      </div>

      {isUnderway && selectedYear === 2026 && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center text-xs text-amber-800 dark:text-amber-200 font-bold relative z-10">
          🏏 {lang === 'bn' ? 'চলমান টুর্নামেন্টের ফাইনাল ও সেমিফাইনাল ম্যাচ সম্পন্ন হলে অফিসিয়াল ৩টি বিজয়ী দল স্বয়ংক্রিয়ভাবে পোডিয়ামে স্থান পাবে।' : 'Official top 3 squads will automatically occupy the podium once final rounds conclude.'}
        </div>
      )}
    </div>
  );
}
