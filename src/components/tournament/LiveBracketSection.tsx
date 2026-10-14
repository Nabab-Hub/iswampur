'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { TournamentBracketData, TournamentRound, TournamentMatch } from '@/types';
import {
  Trophy,
  Swords,
  Crown,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface Props {
  eventId?: string;
  defaultExpanded?: boolean;
  initialBracket?: TournamentBracketData | null;
}

export default function LiveBracketSection({
  eventId = 'event-ipl-2026',
  defaultExpanded = true,
  initialBracket = null,
}: Props) {
  const { lang } = useLanguage();
  const [bracket, setBracket] = useState<TournamentBracketData | null>(initialBracket);
  const [loading, setLoading] = useState(!initialBracket);
  const [activeRoundTab, setActiveRoundTab] = useState<number>(initialBracket?.activeRoundNumber || 1);

  useEffect(() => {
    async function loadBracket() {
      try {
        const res = await fetch(`/api/tournaments/${eventId}/bracket`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBracket(data.bracket || null);
          if (data.bracket?.activeRoundNumber) {
            setActiveRoundTab(data.bracket.activeRoundNumber);
          }
        } else {
          setBracket(null);
        }
      } catch (err) {
        console.error('Failed to load public bracket:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBracket();
  }, [eventId]);

  // If admin toggled off public visibility, hide this section
  if (bracket && bracket.showOnPublicPages === false) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-center">
        <div className="w-8 h-8 border-3 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-400">
          {lang === 'bn' ? 'লাইভ ফিক্সচার ও ড্র লোড হচ্ছে...' : 'Loading Live Fixtures & Bracket...'}
        </p>
      </div>
    );
  }

  if (!bracket || bracket.rounds.length === 0) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#08143A] to-[#102766] border border-[#F9A01B]/40 text-white shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <Swords className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black">
            {lang === 'bn' ? 'ম্যাচডে লটারি ড্র শীঘ্রই শুরু হবে' : 'Matchday Lottery Draw Commencing Soon'}
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {lang === 'bn'
              ? 'মাঠে দলসমূহের আগমন ও কিউআর পাস ভেরিফিকেশন প্রক্রিয়া চলছে। ভেরিফিকেশন সম্পন্ন হলে স্বয়ংক্রিয় লটারি ড্র-এর মাধ্যমে লাইভ ফিক্সচার প্রকাশিত হবে।'
              : 'Squad check-in and digital QR verification are underway at the central grounds. Live fixtures will be drawn right here.'}
          </p>
        </div>
      </div>
    );
  }

  const selectedRound = bracket.rounds.find((r) => r.roundNumber === activeRoundTab) || bracket.rounds[0];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
      {/* Broadcast Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd9ec] dark:border-[#1d3575] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F26522]/15 text-[#F26522] text-[10px] font-black uppercase tracking-widest">
            <Flame className="w-3.5 h-3.5" />
            <span>LIVE TOURNAMENT BRACKET & DRAWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white mt-1">
            {lang === 'bn' ? 'লাইভ ম্যাচ ফিক্সচার ও নকআউট ব্র্যাকেট' : 'Live Match Fixtures & Knockout Bracket'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {bracket.eventTitle[lang] || bracket.eventTitle.bn} • {bracket.totalTeams} {lang === 'bn' ? 'টি দল' : 'Teams'}
          </p>
        </div>

        {/* Champion Callout if Finished */}
        {bracket.isComplete && bracket.standings?.champion && (
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#F9A01B] shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-amber-500 block uppercase tracking-wider">
                CHAMPIONS 2026
              </span>
              <span className="font-black text-sm text-[#08143A] dark:text-white">
                {bracket.standings.champion.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Round Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {bracket.rounds.map((round) => {
          const isActive = activeRoundTab === round.roundNumber;
          return (
            <button
              key={round.roundNumber}
              onClick={() => setActiveRoundTab(round.roundNumber)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#19398A] to-[#1e4bb8] text-white shadow-md'
                  : 'bg-[#f0f4fa] dark:bg-[#08143A] text-slate-600 dark:text-slate-300 hover:text-[#08143A] dark:hover:text-white border border-[#cbd9ec] dark:border-[#1d3575]'
              }`}
            >
              {round.roundName[lang] || round.roundName.bn}
            </button>
          );
        })}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedRound.matches.map((match) => {
          const isCompleted = match.status === 'COMPLETED';
          const isBye = match.status === 'BYE_ADVANCED';

          return (
            <div
              key={match.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-[#f8fafc] dark:bg-[#071333] border-emerald-500/30 shadow-xs'
                  : isBye
                  ? 'bg-[#f0f4fa] dark:bg-[#071333] border-blue-500/30'
                  : 'bg-white dark:bg-[#08143A] border-[#cbd9ec] dark:border-[#1d3575] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-mono font-black text-[10px] text-[#19398A] dark:text-[#00A3E0] bg-[#e6eef8] dark:bg-[#112766] px-2.5 py-0.5 rounded-full">
                  MATCH #{match.matchNumber}
                </span>

                {isBye ? (
                  <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {lang === 'bn' ? 'সরাসরি উত্তীর্ণ (BYE)' : 'BYE ADVANCED'}
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'bn' ? 'খেলা সমাপ্ত' : 'Final Result'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <Clock className="w-3 h-3" />
                    {lang === 'bn' ? 'ম্যাচ নির্ধারিত' : 'Scheduled'}
                  </span>
                )}
              </div>

              {/* Team A */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  match.winnerId === match.teamA.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : match.winnerId && match.winnerId !== match.teamA.id
                    ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-transparent'
                    : 'bg-[#f0f4fa] dark:bg-[#0c1a40] border-[#cbd9ec] dark:border-[#1d3575]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {match.winnerId === match.teamA.id && <Crown className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <h4 className="font-black text-sm text-[#08143A] dark:text-white leading-tight">
                      {match.teamA.name}
                    </h4>
                  </div>
                  {match.winnerId === match.teamA.id && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">WINNER</span>
                  )}
                </div>
                {match.teamA.score && (
                  <p className="font-mono text-xs font-black text-[#19398A] dark:text-cyan-300 mt-1">
                    🏏 {match.teamA.score}
                  </p>
                )}
              </div>

              {/* VS Divider */}
              <div className="py-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-[#071333] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                  {isBye ? 'BYE (NO OPPONENT)' : 'VS'}
                </span>
              </div>

              {/* Team B */}
              {match.teamB ? (
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    match.winnerId === match.teamB.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                      : match.winnerId && match.winnerId !== match.teamB.id
                      ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-transparent'
                      : 'bg-[#f0f4fa] dark:bg-[#0c1a40] border-[#cbd9ec] dark:border-[#1d3575]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {match.winnerId === match.teamB.id && <Crown className="w-4 h-4 text-emerald-600 shrink-0" />}
                      <h4 className="font-black text-sm text-[#08143A] dark:text-white leading-tight">
                        {match.teamB.name}
                      </h4>
                    </div>
                    {match.winnerId === match.teamB.id && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">WINNER</span>
                    )}
                  </div>
                  {match.teamB.score && (
                    <p className="font-mono text-xs font-black text-[#19398A] dark:text-cyan-300 mt-1">
                      🏏 {match.teamB.score}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071333] border border-dashed border-slate-300 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 italic">
                    {lang === 'bn' ? 'লটারিতে সরাসরি জয়ী' : 'Direct Bye into next round'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
