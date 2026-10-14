'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import {
  VillageEvent,
  TournamentBracketData,
  TournamentRound,
  TournamentMatch,
  TournamentMatchTeam,
} from '@/types';
import {
  Trophy,
  Shuffle,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Flame,
  Swords,
  ShieldCheck,
  Award,
  Crown,
  ChevronRight,
  ExternalLink,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Audio synthesizer for suspense reel tick and victory chime using Web Audio API
function playSoundEffect(type: 'tick' | 'reveal' | 'chime') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    }
  } catch {
    // Audio contexts might be blocked until user gesture, safe to ignore
  }
}

// Helper to get winners of a round to advance to next round
function getRoundAdvancingTeams(round: TournamentRound): TournamentMatchTeam[] {
  const winners: TournamentMatchTeam[] = [];
  round.matches.forEach((m) => {
    if (m.winnerId) {
      if (m.teamA.id === m.winnerId) winners.push(m.teamA);
      else if (m.teamB && m.teamB.id === m.winnerId) winners.push(m.teamB);
    }
  });
  return winners;
}

// Dynamically compute the round's name based on remaining candidates
function getDynamicRoundName(
  candidateCount: number,
  roundNum: number
): { bn: string; en: string } {
  if (candidateCount <= 2) {
    return {
      bn: 'গ্র্যান্ড ফাইনাল (শিরোপা ম্যাচ)',
      en: 'Grand Finale (Championship)',
    };
  }
  if (candidateCount <= 4) {
    return {
      bn: 'সেমিফাইনাল',
      en: 'Semi-Finals',
    };
  }
  if (candidateCount <= 8) {
    return {
      bn: 'কোয়ার্টার ফাইনাল',
      en: 'Quarter-Finals',
    };
  }
  return {
    bn: `রাউন্ড ${roundNum} (নকআউট)`,
    en: `Round ${roundNum} (Knockout)`,
  };
}

// Helper to collect all team IDs ever allocated to any match across the tournament
function getAllAllocatedTeamIds(tBracket: TournamentBracketData | null): Set<string> {
  const ids = new Set<string>();
  if (!tBracket) return ids;
  for (const r of tBracket.rounds) {
    for (const m of r.matches) {
      if (m.teamA?.id) ids.add(m.teamA.id);
      if (m.teamB?.id) ids.add(m.teamB.id);
    }
  }
  return ids;
}

// Helper to check if any match in a round has a declared winner
function hasAnyWinnerDeclared(round?: TournamentRound | null): boolean {
  if (!round) return false;
  return round.matches.some(
    (m) => m.status === 'COMPLETED' || (Boolean(m.winnerId) && m.status !== 'BYE_ADVANCED')
  );
}

interface EligibleTeam {
  id: string;
  name: string;
  representativeName: string;
  phone: string;
  isCheckedIn: boolean;
  passId?: string;
  humanPassCode?: string;
}

export default function AdminFixturesPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [bracket, setBracket] = useState<TournamentBracketData | null>(null);
  const [eligibleTeams, setEligibleTeams] = useState<EligibleTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [useOnlyCheckedIn, setUseOnlyCheckedIn] = useState(true);

  // Draw Animation Modal State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStep, setDrawStep] = useState<'shuffling' | 'revealing' | 'complete'>('shuffling');
  const [currentSlotPair, setCurrentSlotPair] = useState<{ teamA: string; teamB: string }>({
    teamA: '???',
    teamB: '???',
  });
  const [revealedMatches, setRevealedMatches] = useState<Array<{ matchNum: number; teamA: string; teamB: string; isBye?: boolean }>>([]);
  const [drawTargetRound, setDrawTargetRound] = useState<number>(1);
  const [drawTargetRoundName, setDrawTargetRoundName] = useState<string>('');

  // Winner confirmation modal state
  const [confirmWinnerData, setConfirmWinnerData] = useState<{
    match: TournamentMatch;
    winnerTeam: TournamentMatchTeam;
  } | null>(null);
  const [isDeclaringWinner, setIsDeclaringWinner] = useState(false);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Score editor state
  const [editingScoreMatchId, setEditingScoreMatchId] = useState<string | null>(null);
  const [scoreAInput, setScoreAInput] = useState('');
  const [scoreBInput, setScoreBInput] = useState('');

  // 1. Load cricket events (strictly cricket tournaments)
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const allEvents: VillageEvent[] = await res.json();
          // Filter ONLY active/ongoing cricket tournaments
          const cricketEvents = allEvents.filter(
            (e) => e.category === 'cricket' && e.status !== 'archived'
          );
          setEvents(cricketEvents);

          if (cricketEvents.length > 0) {
            // Find active cricket tournament, or first one
            const activeEvent =
              cricketEvents.find((e) => e.registrationEnabled) ||
              cricketEvents.find((e) => e.showInHero) ||
              cricketEvents[0];
            setSelectedEventId(activeEvent.id);
          }
        }
      } catch (err) {
        console.error('Failed to load cricket events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // 2. Load bracket & eligible teams for selected event
  useEffect(() => {
    if (!selectedEventId) return;

    async function loadBracketData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tournaments/${selectedEventId}/bracket`);
        if (res.ok) {
          const data = await res.json();
          setBracket(data.bracket || null);
          setEligibleTeams(data.eligibleTeams || []);
        }
      } catch (err) {
        console.error('Failed to load bracket data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBracketData();
  }, [selectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Teams available for draw (either all approved or only scanned checked-in)
  const drawPoolTeams = useOnlyCheckedIn
    ? eligibleTeams.filter((t) => t.isCheckedIn)
    : eligibleTeams;

  // Active round in bracket
  const activeRound = bracket?.rounds.find((r) => r.roundNumber === bracket.activeRoundNumber) || bracket?.rounds[bracket.rounds.length - 1];
  const isCurrentRoundFinished = activeRound
    ? activeRound.matches.every((m) => m.status === 'COMPLETED' || m.status === 'BYE_ADVANCED')
    : false;

  // Set of all team IDs ever allocated to any match across the tournament
  const allocatedTeamIds = useMemo(() => getAllAllocatedTeamIds(bracket), [bracket]);

  // Newly checked-in teams who arrived after the initial draw and haven't played yet
  const unallocatedTeams: TournamentMatchTeam[] = useMemo(() => {
    if (!bracket || bracket.rounds.length === 0) return [];
    return drawPoolTeams
      .filter((t) => !allocatedTeamIds.has(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        representativeName: t.representativeName,
        phone: t.phone,
      }));
  }, [drawPoolTeams, allocatedTeamIds, bracket]);

  // Advancing winners from current active round
  const currentRoundAdvancing: TournamentMatchTeam[] = useMemo(() => {
    if (!activeRound) return [];
    return getRoundAdvancingTeams(activeRound);
  }, [activeRound]);

  // Combined candidate pool for the next stage = completed round winners + late unallocated arrivals!
  const nextRoundCandidates: TournamentMatchTeam[] = useMemo(() => {
    return [...currentRoundAdvancing, ...unallocatedTeams];
  }, [currentRoundAdvancing, unallocatedTeams]);

  // 3. Initiate Dramatic Random Draw Animation (Jackpot / Slot Machine Style)
  const startTournamentDraw = (roundNum = 1, customCandidates?: TournamentMatchTeam[]) => {
    let candidateTeams: TournamentMatchTeam[] = [];

    if (roundNum === 1) {
      if (drawPoolTeams.length < 2) {
        toast.error(
          lang === 'bn'
            ? 'ফিক্সচার তৈরির জন্য নূন্যতম ২টি দলের উপস্থিতি প্রয়োজন!'
            : 'At least 2 teams required to generate tournament fixtures!'
        );
        return;
      }
      candidateTeams = drawPoolTeams.map((t) => ({
        id: t.id,
        name: t.name,
        representativeName: t.representativeName,
        phone: t.phone,
      }));
    } else {
      // Round 2+: Candidate pool includes previous winners PLUS newly arrived unallocated squads
      if (customCandidates && customCandidates.length > 0) {
        candidateTeams = customCandidates;
      } else {
        const prevRound = bracket?.rounds.find((r) => r.roundNumber === roundNum - 1);
        const prevWinners = prevRound ? getRoundAdvancingTeams(prevRound) : [];
        candidateTeams = [...prevWinners, ...unallocatedTeams];
      }

      if (candidateTeams.length < 2) {
        toast.error(
          lang === 'bn'
            ? 'পরবর্তী রাউন্ডের ড্রয়ের জন্য নূন্যতম ২টি দল প্রয়োজন!'
            : 'At least 2 teams required for next round draw!'
        );
        return;
      }
    }

    const roundNameObj = getDynamicRoundName(candidateTeams.length, roundNum);
    setDrawTargetRound(roundNum);
    setDrawTargetRoundName(roundNameObj[lang] || roundNameObj.en);
    setIsDrawing(true);
    setDrawStep('shuffling');
    setRevealedMatches([]);

    // Shuffle candidate teams randomly using Fisher-Yates
    const shuffled = [...candidateTeams].sort(() => Math.random() - 0.5);

    // Prepare matchups
    const matchPairs: Array<{ teamA: TournamentMatchTeam; teamB: TournamentMatchTeam | null; isBye?: boolean }> = [];
    let i = 0;
    while (i < shuffled.length) {
      if (i + 1 < shuffled.length) {
        matchPairs.push({ teamA: shuffled[i], teamB: shuffled[i + 1], isBye: false });
        i += 2;
      } else {
        // Odd team gets a BYE directly to next round!
        matchPairs.push({ teamA: shuffled[i], teamB: null, isBye: true });
        i += 1;
      }
    }

    // Suspense Slot Machine Reel Animation
    let shuffleTicks = 0;
    const shuffleInterval = setInterval(() => {
      shuffleTicks++;
      const randA = candidateTeams[Math.floor(Math.random() * candidateTeams.length)].name;
      const randB = candidateTeams[Math.floor(Math.random() * candidateTeams.length)].name;
      setCurrentSlotPair({ teamA: randA, teamB: randB });
      playSoundEffect('tick');

      if (shuffleTicks >= 18) {
        clearInterval(shuffleInterval);
        setDrawStep('revealing');

        // Reveal matches one by one with dramatic delay
        let pairIdx = 0;
        const revealInterval = setInterval(() => {
          if (pairIdx < matchPairs.length) {
            const pair = matchPairs[pairIdx];
            playSoundEffect('reveal');
            setRevealedMatches((prev) => [
              ...prev,
              {
                matchNum: prev.length + 1,
                teamA: pair.teamA.name,
                teamB: pair.teamB ? pair.teamB.name : '*** DIRECT BYE ***',
                isBye: pair.isBye,
              },
            ]);
            pairIdx++;
          } else {
            clearInterval(revealInterval);
            setDrawStep('complete');
            playSoundEffect('chime');

            // Save final bracket structure to database with candidate count
            finalizeAndSaveDraw(roundNum, matchPairs, candidateTeams.length);
          }
        }, 800);
      }
    }, 90);
  };

  // 4. Save Finalized Generated Draw to Backend
  const finalizeAndSaveDraw = async (
    roundNum: number,
    matchPairs: Array<{ teamA: TournamentMatchTeam; teamB: TournamentMatchTeam | null; isBye?: boolean }>,
    candidateCount: number
  ) => {
    try {
      const defaultRoundName = getDynamicRoundName(candidateCount, roundNum);

      const newMatches: TournamentMatch[] = matchPairs.map((pair, idx) => {
        const isBye = Boolean(pair.isBye);
        return {
          id: `match_r${roundNum}_${Date.now()}_${idx + 1}`,
          matchNumber: idx + 1,
          roundNumber: roundNum,
          roundName: defaultRoundName,
          teamA: pair.teamA,
          teamB: pair.teamB,
          winnerId: isBye ? pair.teamA.id : undefined,
          winnerName: isBye ? pair.teamA.name : undefined,
          status: isBye ? 'BYE_ADVANCED' : 'SCHEDULED',
          venue: currentEvent?.venue,
          date: currentEvent?.startDate,
        };
      });

      const newRound: TournamentRound = {
        roundNumber: roundNum,
        roundName: defaultRoundName,
        status: newMatches.every((m) => m.status === 'BYE_ADVANCED') ? 'COMPLETED' : 'IN_PROGRESS',
        matches: newMatches,
      };

      const updatedRounds = bracket ? [...bracket.rounds] : [];
      const existingRoundIdx = updatedRounds.findIndex((r) => r.roundNumber === roundNum);
      if (existingRoundIdx >= 0) {
        updatedRounds[existingRoundIdx] = newRound;
      } else {
        updatedRounds.push(newRound);
      }

      const newBracket: TournamentBracketData = {
        eventId: selectedEventId,
        eventTitle: currentEvent?.title || { bn: 'ক্রিকেট টুর্নামেন্ট', en: 'Cricket Tournament' },
        totalTeams: roundNum === 1 ? drawPoolTeams.length : (bracket?.totalTeams || drawPoolTeams.length) + unallocatedTeams.length,
        rounds: updatedRounds,
        activeRoundNumber: roundNum,
        isComplete: false,
        createdAt: bracket?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/tournaments/${selectedEventId}/bracket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBracket),
      });

      if (res.ok) {
        const saved = await res.json();
        setBracket(saved);
        toast.success(
          lang === 'bn'
            ? `${defaultRoundName.bn} ড্র এবং ফিক্সচার সফলভাবে প্রস্তুত হয়েছে!`
            : `${defaultRoundName.en} draw & fixtures successfully generated!`
        );
      }
    } catch (err) {
      console.error('Error saving bracket:', err);
      toast.error('Failed to save tournament bracket');
    }
  };

  // 5. Declare Match Winner
  const handleDeclareWinner = async () => {
    if (!confirmWinnerData) return;
    setIsDeclaringWinner(true);
    const { match, winnerTeam } = confirmWinnerData;

    try {
      const res = await fetch(`/api/tournaments/${selectedEventId}/match`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          winnerId: winnerTeam.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to update winner');
      const updatedBracket = await res.json();
      setBracket(updatedBracket);
      playSoundEffect('chime');
      toast.success(
        lang === 'bn'
          ? `অভিনন্দন! ${winnerTeam.name} ম্যাচ জয়ী হিসেবে চিহ্নিত হয়েছে`
          : `Congratulations! ${winnerTeam.name} marked as match winner`
      );
      setConfirmWinnerData(null);
    } catch (err: any) {
      toast.error(err.message || 'Error updating winner');
    } finally {
      setIsDeclaringWinner(false);
    }
  };

  // 6. Save Scores & Overs
  const handleSaveScore = async (matchId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${selectedEventId}/match`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          scoreA: scoreAInput,
          scoreB: scoreBInput,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBracket(updated);
        setEditingScoreMatchId(null);
        toast.success(lang === 'bn' ? 'স্কোর আপডেট হয়েছে' : 'Score updated');
      }
    } catch (err) {
      toast.error('Error saving score');
    }
  };

  // 7. Reset Bracket
  const handleResetBracket = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`/api/tournaments/${selectedEventId}/bracket`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBracket(null);
        toast.success(lang === 'bn' ? 'টুর্নামেন্ট ড্র রিসেট করা হয়েছে' : 'Tournament bracket reset');
        setIsResetConfirmOpen(false);
      }
    } catch (err) {
      toast.error('Failed to reset tournament bracket');
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd9ec] dark:border-[#1d3575] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#F26522] font-black text-xs uppercase tracking-widest">
              <Swords className="w-4 h-4" />
              <span>TOURNAMENT MATCHMAKER & LOTTERY DRAW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white mt-1">
              {lang === 'bn' ? 'ম্যাচ ফিক্সচার ও লটারি ড্র' : 'Match Fixtures & Live Draw'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'মাঠে উপস্থিত দলগুলোর মধ্যে সম্পূর্ণ স্বয়ংক্রিয় নিরপেক্ষ লটারি ড্র ও বহু-স্তরী নকআউট ফিক্সচার পরিচালনা।'
                : 'Automated randomized lottery draw and multi-stage knockout bracket for checked-in ground squads.'}
            </p>
          </div>

          {/* Select Active Cricket Match Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] px-3.5 py-2 rounded-2xl shadow-xs">
              <Trophy className="w-4 h-4 text-[#F9A01B] shrink-0" />
              <div className="text-left">
                <label className="text-[10px] font-bold text-slate-400 block leading-tight">
                  {lang === 'bn' ? 'সক্রিয় ক্রিকেট ম্যাচ / টুর্নামেন্ট' : 'Active Cricket Tournament'}
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-transparent font-black text-xs sm:text-sm text-[#19398A] dark:text-white focus:outline-hidden cursor-pointer"
                >
                  {events.length === 0 && (
                    <option value="">{lang === 'bn' ? 'কোনো সক্রিয় ক্রিকেট ইভেন্ট নেই' : 'No active cricket events'}</option>
                  )}
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="dark:bg-[#08143A] text-slate-900 dark:text-white">
                      🏏 {typeof ev.title === 'string' ? ev.title : (ev.title[lang] || ev.title.bn || ev.title.en)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {bracket && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                title={lang === 'bn' ? 'সম্পূর্ণ ড্র রিসেট করুন' : 'Reset Tournament Bracket'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Attendance & Ground Teams Pool Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-sm text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'মাঠে উপস্থিত দলসমূহ (চেক-ইন কৃত):' : 'Teams Present at Ground (Checked-in):'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#e6eef8] dark:bg-[#112766] text-[#19398A] dark:text-[#00A3E0]">
                {eligibleTeams.filter((t) => t.isCheckedIn).length} {lang === 'bn' ? 'টি দল হাজির' : 'Checked-in'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#0b1a42] text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'মোট অনুমোদিত:' : 'Total Approved:'} {eligibleTeams.length}
              </span>
            </div>

            {/* Toggle Switch: Use Only Checked-in vs All Approved */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer ml-auto md:ml-4">
              <input
                type="checkbox"
                checked={useOnlyCheckedIn}
                onChange={(e) => setUseOnlyCheckedIn(e.target.checked)}
                className="w-4 h-4 text-[#F26522] rounded cursor-pointer"
              />
              <span>{lang === 'bn' ? 'শুধুমাত্র স্ক্যানকৃত দলের ড্র করুন' : 'Draw from Ground Checked-in Only'}</span>
            </label>
          </div>

          {/* Big Action: Lottery Draw Launch or Re-Draw (strictly before any match winner is declared) */}
          {!bracket ? (
            <button
              onClick={() => startTournamentDraw(1)}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 active:scale-95 text-[#050D24] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#050D24]" />
              <span>{lang === 'bn' ? 'লটারি ড্র ও ফিক্সচার তৈরি করুন' : 'Generate Fixtures (Lottery Draw)'}</span>
            </button>
          ) : activeRound && !hasAnyWinnerDeclared(activeRound) && !bracket.isComplete ? (
            <button
              onClick={() => startTournamentDraw(activeRound.roundNumber)}
              className="py-2.5 px-4 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] text-xs font-bold text-[#19398A] dark:text-cyan-400 hover:bg-[#e6eef8] dark:hover:bg-[#112766] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn'
                  ? `পুনরায় ড্র করুন (রাউন্ড ${activeRound.roundNumber})`
                  : `Re-Draw Round ${activeRound.roundNumber}`}
              </span>
            </button>
          ) : null}
        </div>

        {/* Late Arrived / Newly Checked-in Squads Alert Banner */}
        {bracket && !bracket.isComplete && unallocatedTeams.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 text-[#08143A] dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                    {lang === 'bn' ? 'মাঠে নতুন দলের প্রবেশ' : 'New Teams Checked-in'}
                  </span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {unallocatedTeams.length} {lang === 'bn' ? 'টি নতুন দল মাঠে হাজির হয়েছে' : 'squad(s) arrived at ground'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {lang === 'bn' ? (
                    <>
                      দলসমূহ:{' '}
                      <strong className="text-[#08143A] dark:text-white">
                        {unallocatedTeams.map((t) => t.name).join(', ')}
                      </strong>{' '}
                      — এই দলগুলো এখনও কোনো ম্যাচে বরাদ্দ হয়নি। পরবর্তী রাউন্ডের ড্র-তে এরা রাউন্ড বিজয়ীদের সাথে সরাসরি যুক্ত হবে।
                    </>
                  ) : (
                    <>
                      Squads:{' '}
                      <strong className="text-[#08143A] dark:text-white">
                        {unallocatedTeams.map((t) => t.name).join(', ')}
                      </strong>{' '}
                      — Not yet scheduled in any match. They will automatically be merged into the next lottery draw alongside advancing winners.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Champion Podium Banner (If Completed) */}
        {bracket?.isComplete && bracket.standings?.champion && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#08143A] via-[#102766] to-[#08143A] p-6 sm:p-8 border-2 border-[#F9A01B] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F26522] to-[#F9A01B] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white shrink-0">
                <Trophy className="w-9 h-9" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F9A01B] text-[#050D24] uppercase tracking-wider">
                  🏆 TOURNAMENT CHAMPION 2026
                </span>
                <h2 className="text-2xl sm:text-4xl font-black mt-1">
                  {bracket.standings.champion.name}
                </h2>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  {lang === 'bn' ? 'অভিনন্দন! ঈশ্বমপুর প্রিমিয়ার লীগের নতুন চ্যাম্পিয়ন' : 'Congratulations! Winner of Iswampur Premier League'}
                </p>
              </div>
            </div>

            {bracket.standings.runnerUp && (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">
                  🥈 RUNNER-UP SQUAD
                </span>
                <span className="text-lg font-black text-white block mt-0.5">
                  {bracket.standings.runnerUp.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tournament Bracket Rounds Display */}
        {bracket && bracket.rounds.length > 0 ? (
          <div className="space-y-8">
            {bracket.rounds.map((round) => {
              const isCompleted = round.status === 'COMPLETED';
              return (
                <div key={round.roundNumber} className="space-y-4">
                  {/* Round Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cbd9ec] dark:border-[#1d3575] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#19398A] text-white flex items-center justify-center font-black text-sm shrink-0">
                        R{round.roundNumber}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-[#08143A] dark:text-white">
                          {round.roundName[lang] || round.roundName.bn}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {round.matches.length} {lang === 'bn' ? 'টি ম্যাচ নির্ধারিত' : 'matches scheduled'}
                        </span>
                      </div>
                    </div>

                    {/* Right Action Area: User Boxed Location for Next Draw & Re-Draw */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Re-Draw button if no winner declared yet in this round */}
                      {round.roundNumber === activeRound?.roundNumber && !hasAnyWinnerDeclared(round) && !bracket.isComplete && (
                        <button
                          onClick={() => startTournamentDraw(round.roundNumber)}
                          className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] text-xs font-bold text-[#19398A] dark:text-cyan-400 hover:bg-[#e6eef8] dark:hover:bg-[#112766] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title={lang === 'bn' ? `রাউন্ড ${round.roundNumber} পুনরায় ড্র করুন` : `Re-Draw Round ${round.roundNumber}`}
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'পুনরায় ড্র করুন' : 'Re-Draw Round'}</span>
                        </button>
                      )}

                      {/* Next Round Draw Button - Displays directly in the finished round header */}
                      {round.roundNumber === activeRound?.roundNumber && isCompleted && !bracket.isComplete && (
                        nextRoundCandidates.length === 2 ? (
                          <button
                            onClick={() => startTournamentDraw(round.roundNumber + 1, nextRoundCandidates)}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#F26522] hover:brightness-110 active:scale-95 text-[#050D24] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer animate-pulse"
                          >
                            <Trophy className="w-4 h-4 text-[#050D24]" />
                            <span>
                              {lang === 'bn'
                                ? `🏆 গ্র্যান্ড ফাইনাল ড্র শুরু করুন (২টি দল: শিরোপা ম্যাচ) →`
                                : `🏆 Draw Grand Finale (2 Finalists) →`}
                            </span>
                          </button>
                        ) : nextRoundCandidates.length > 2 ? (
                          <button
                            onClick={() => startTournamentDraw(round.roundNumber + 1, nextRoundCandidates)}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-[#050D24] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer animate-bounce"
                          >
                            <Crown className="w-4 h-4 text-[#050D24]" />
                            <span>
                              {lang === 'bn'
                                ? unallocatedTeams.length > 0
                                  ? `পরবর্তী রাউন্ডের ড্র শুরু করুন (${nextRoundCandidates.length}টি দল: ${currentRoundAdvancing.length} বিজয়ী + ${unallocatedTeams.length} নতুন দল) →`
                                  : `পরবর্তী রাউন্ড ${round.roundNumber + 1} এর লটারি ড্র শুরু করুন (${nextRoundCandidates.length}টি দল) →`
                                : unallocatedTeams.length > 0
                                ? `Draw Next Round (${nextRoundCandidates.length} Teams: ${currentRoundAdvancing.length} Advancing + ${unallocatedTeams.length} Late Arrivals) →`
                                : `Draw Next Round ${round.roundNumber + 1} Fixtures (${nextRoundCandidates.length} Teams) →`}
                            </span>
                          </button>
                        ) : nextRoundCandidates.length === 1 && currentRoundAdvancing.length === 1 && unallocatedTeams.length === 0 ? (
                          <button
                            onClick={async () => {
                              const champ = nextRoundCandidates[0];
                              try {
                                const res = await fetch(`/api/tournaments/${selectedEventId}/bracket`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ...bracket,
                                    isComplete: true,
                                    standings: {
                                      ...bracket.standings,
                                      champion: { id: champ.id, name: champ.name },
                                    },
                                  }),
                                });
                                if (res.ok) {
                                  const saved = await res.json();
                                  setBracket(saved);
                                  toast.success(
                                    lang === 'bn'
                                      ? `অভিনন্দন! ${champ.name} টুর্নামেন্ট চ্যাম্পিয়ন হিসেবে ঘোষিত হয়েছে!`
                                      : `Congratulations! ${champ.name} crowned Champion!`
                                  );
                                }
                              } catch (e) {
                                toast.error('Failed to crown champion');
                              }
                            }}
                            className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-[#050D24] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer animate-pulse"
                          >
                            <Trophy className="w-4 h-4 text-[#050D24]" />
                            <span>
                              {lang === 'bn'
                                ? `🏆 টুর্নামেন্ট সমাপ্ত ও ${nextRoundCandidates[0].name} কে বিজয়ী ঘোষণা করুন`
                                : `🏆 Conclude Tournament & Crown ${nextRoundCandidates[0].name}`}
                            </span>
                          </button>
                        ) : null
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {isCompleted ? (lang === 'bn' ? 'খেলা সমাপ্ত' : 'Completed') : (lang === 'bn' ? 'ম্যাচ চলমান' : 'In Progress')}
                      </span>
                    </div>
                  </div>

                  {/* Matches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {round.matches.map((match) => {
                      const isMatchCompleted = match.status === 'COMPLETED';
                      const isBye = match.status === 'BYE_ADVANCED';
                      const isEditingScore = editingScoreMatchId === match.id;

                      return (
                        <div
                          key={match.id}
                          className={`p-5 rounded-3xl border transition-all ${
                            isMatchCompleted
                              ? 'bg-white dark:bg-[#071333] border-emerald-200 dark:border-emerald-900/50 shadow-xs'
                              : isBye
                              ? 'bg-[#f0f4fa] dark:bg-[#081333] border-blue-200 dark:border-blue-900/40'
                              : 'bg-white dark:bg-[#08143A] border-[#cbd9ec] dark:border-[#1d3575] shadow-md hover:border-[#F26522]'
                          }`}
                        >
                          {/* Match Header Tag */}
                          <div className="flex items-center justify-between text-xs mb-3">
                            <span className="font-mono font-black text-[11px] text-[#19398A] dark:text-[#00A3E0] bg-[#e6eef8] dark:bg-[#112766] px-2.5 py-0.5 rounded-full">
                              MATCH #{match.matchNumber}
                            </span>
                            {isBye ? (
                              <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                {lang === 'bn' ? 'বাই (সরাসরি উত্তীর্ণ)' : 'BYE ADVANCED'}
                              </span>
                            ) : isMatchCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                {lang === 'bn' ? 'ফলাফল ঘোষিত' : 'Decided'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                <Clock className="w-3 h-3" />
                                {lang === 'bn' ? 'অপেক্ষমান' : 'Live / Ready'}
                              </span>
                            )}
                          </div>

                          {/* Team A Card */}
                          <div
                            className={`p-3 rounded-2xl border transition-all ${
                              match.winnerId === match.teamA.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black'
                                : match.winnerId && match.winnerId !== match.teamA.id
                                ? 'bg-slate-50 dark:bg-[#050D24] opacity-50 border-transparent'
                                : 'bg-[#f0f4fa] dark:bg-[#0c1a40] border-[#cbd9ec] dark:border-[#1d3575]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  {match.winnerId === match.teamA.id && <Crown className="w-4 h-4 text-emerald-600 shrink-0" />}
                                  <h4 className="font-black text-sm text-[#08143A] dark:text-white leading-tight">
                                    {match.teamA.name}
                                  </h4>
                                </div>
                                {match.teamA.representativeName && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {match.teamA.representativeName} {match.teamA.phone ? `(${match.teamA.phone})` : ''}
                                  </p>
                                )}
                              </div>

                              {/* Declare Team A Won Button */}
                              {!isMatchCompleted && !isBye && (
                                <button
                                  onClick={() => setConfirmWinnerData({ match, winnerTeam: match.teamA })}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                                >
                                  {lang === 'bn' ? 'জয়ী (Won)' : 'Declare Winner'}
                                </button>
                              )}
                            </div>

                            {/* Score Display */}
                            {match.teamA.score && (
                              <p className="font-mono text-xs font-black text-[#19398A] dark:text-cyan-300 mt-1.5">
                                🏏 {match.teamA.score}
                              </p>
                            )}
                          </div>

                          {/* VS Divider */}
                          <div className="py-2 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-[#071333] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                              {isBye ? 'BYE (NO OPPONENT)' : 'VS'}
                            </span>
                          </div>

                          {/* Team B Card */}
                          {match.teamB ? (
                            <div
                              className={`p-3 rounded-2xl border transition-all ${
                                match.winnerId === match.teamB.id
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black'
                                  : match.winnerId && match.winnerId !== match.teamB.id
                                  ? 'bg-slate-50 dark:bg-[#050D24] opacity-50 border-transparent'
                                  : 'bg-[#f0f4fa] dark:bg-[#0c1a40] border-[#cbd9ec] dark:border-[#1d3575]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {match.winnerId === match.teamB.id && <Crown className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    <h4 className="font-black text-sm text-[#08143A] dark:text-white leading-tight">
                                      {match.teamB.name}
                                    </h4>
                                  </div>
                                  {match.teamB.representativeName && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {match.teamB.representativeName} {match.teamB.phone ? `(${match.teamB.phone})` : ''}
                                    </p>
                                  )}
                                </div>

                                {/* Declare Team B Won Button */}
                                {!isMatchCompleted && !isBye && (
                                  <button
                                    onClick={() => setConfirmWinnerData({ match, winnerTeam: match.teamB! })}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                                  >
                                    {lang === 'bn' ? 'জয়ী (Won)' : 'Declare Winner'}
                                  </button>
                                )}
                              </div>

                              {/* Score Display */}
                              {match.teamB.score && (
                                <p className="font-mono text-xs font-black text-[#19398A] dark:text-cyan-300 mt-1.5">
                                  🏏 {match.teamB.score}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#071333] border border-dashed border-slate-300 dark:border-slate-800 text-center">
                              <span className="text-xs text-slate-400 italic">
                                {lang === 'bn' ? 'লটারিতে সরাসরি উত্তীর্ণ' : 'Lucky Bye directly to next round'}
                              </span>
                            </div>
                          )}

                          {/* Match Footer & Score Edit Toggle */}
                          {!isBye && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1d3575] flex items-center justify-between text-xs">
                              {isEditingScore ? (
                                <div className="w-full space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Team A Score e.g. 142/6"
                                      value={scoreAInput}
                                      onChange={(e) => setScoreAInput(e.target.value)}
                                      className="px-2.5 py-1 text-xs rounded-lg border bg-white dark:bg-[#071333] border-slate-300 dark:border-slate-700"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Team B Score e.g. 138/9"
                                      value={scoreBInput}
                                      onChange={(e) => setScoreBInput(e.target.value)}
                                      className="px-2.5 py-1 text-xs rounded-lg border bg-white dark:bg-[#071333] border-slate-300 dark:border-slate-700"
                                    />
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingScoreMatchId(null)}
                                      className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700"
                                    >
                                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                                    </button>
                                    <button
                                      onClick={() => handleSaveScore(match.id)}
                                      className="px-3 py-1 text-[11px] font-black bg-[#19398A] text-white rounded-lg"
                                    >
                                      {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="text-[11px] text-slate-400">
                                    {match.winnerName ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                        🏆 {lang === 'bn' ? 'বিজয়ী:' : 'Winner:'} {match.winnerName}
                                      </span>
                                    ) : (
                                      lang === 'bn' ? 'ম্যাচ চলমান' : 'Match in progress'
                                    )}
                                  </span>

                                  <button
                                    onClick={() => {
                                      setEditingScoreMatchId(match.id);
                                      setScoreAInput(match.teamA.score || '');
                                      setScoreBInput(match.teamB?.score || '');
                                    }}
                                    className="text-[11px] font-bold text-[#F26522] hover:underline cursor-pointer"
                                  >
                                    {lang === 'bn' ? 'স্কোর লিখুন' : 'Edit Score'}
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State: No Draw Done Yet */
          <div className="p-10 sm:p-16 rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-center max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#F26522] to-[#F9A01B] flex items-center justify-center mx-auto text-[#050D24] shadow-lg shadow-orange-500/30">
              <Shuffle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'কোনো ফিক্সচার বা ড্র এখনও প্রস্তুত নয়' : 'No Tournament Bracket Generated Yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'মাঠে প্রবেশকারী দলগুলোর মধ্য থেকে নিরপেক্ষ লটারি অ্যালগরিদম মারফত সরাসরি ফিক্সচার তৈরি করতে নিচের বাটনে চাপুন।'
                  : 'Click below to initiate the exciting casino slot draw and pair up the verified ground squads.'}
              </p>
            </div>

            <button
              onClick={() => startTournamentDraw(1)}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 active:scale-95 text-[#050D24] font-black text-sm inline-flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4 text-[#050D24]" />
              <span>{lang === 'bn' ? 'লটারি ড্র শুরু করুন (Casino Draw)' : 'Start Lottery Draw'}</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            LOTTERY DRAW SUSPENSE MODAL (JACKPOT / CASINO SLOT ANIMATION)
            ========================================================================= */}
        {isDrawing && (
          <div className="fixed inset-0 z-50 bg-[#050D24]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-3xl bg-[#08143A] border-2 border-[#F9A01B] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6 text-center">
              {/* Spotlight Glows */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F26522]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#F26522] text-white uppercase tracking-widest shadow-md">
                  🎲 LOTTERY DRAW • {drawTargetRoundName || `ROUND ${drawTargetRound}`}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {drawStep === 'shuffling'
                    ? (lang === 'bn' ? 'দল নির্বাচন চলমান...' : 'Shuffling Teams in Lottery Bowl...')
                    : drawStep === 'revealing'
                    ? (lang === 'bn' ? 'ম্যাচ নির্ধারিত হচ্ছে!' : 'Match Reveal in Progress!')
                    : (lang === 'bn' ? 'ড্র সফলভাবে সমাপ্ত!' : 'Lottery Draw Complete!')}
                </h3>
              </div>

              {/* Shuffling Slot Machine Reel Display */}
              {drawStep === 'shuffling' && (
                <div className="relative z-10 p-6 rounded-2xl bg-[#050D24] border border-[#1d3575] space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs font-bold text-amber-400 animate-pulse">TEAM 1</span>
                    <Swords className="w-5 h-5 text-[#F26522] animate-spin" />
                    <span className="text-xs font-bold text-cyan-400 animate-pulse">TEAM 2</span>
                  </div>

                  <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/20 to-cyan-500/10 border border-[#F9A01B]/40 font-mono text-lg sm:text-xl font-black text-amber-300 truncate">
                    {currentSlotPair.teamA} <span className="text-[#F26522]">VS</span> {currentSlotPair.teamB}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'নিরপেক্ষ র্যান্ডমাইজেশন অ্যালগরিদম সক্রিয়...' : 'Fair Cryptographic Randomization active...'}
                  </p>
                </div>
              )}

              {/* Revealed Matches List during draw */}
              {(drawStep === 'revealing' || drawStep === 'complete') && (
                <div className="relative z-10 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {revealedMatches.map((m) => (
                    <div
                      key={m.matchNum}
                      className="p-3 rounded-xl bg-[#050D24] border border-[#1d3575] flex items-center justify-between text-xs font-bold animate-fadeIn"
                    >
                      <span className="font-mono text-[#F9A01B] font-black">MATCH #{m.matchNum}</span>
                      <span className="text-white truncate max-w-[240px]">
                        {m.teamA} <span className="text-[#F26522] font-black">VS</span> {m.teamB}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Complete Action Button */}
              {drawStep === 'complete' && (
                <div className="relative z-10 pt-2">
                  <button
                    onClick={() => setIsDrawing(false)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-[#050D24] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{lang === 'bn' ? 'ফিক্সচার দেখুন ও খেলা শুরু করুন' : 'View Fixtures & Start Tournament'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            DECLARE WINNER CONFIRMATION MODAL
            ========================================================================= */}
        <ConfirmModal
          isOpen={Boolean(confirmWinnerData)}
          title={lang === 'bn' ? 'ম্যাচ বিজয়ী দল নিশ্চিতকরণ' : 'Confirm Match Winner'}
          message={
            confirmWinnerData
              ? lang === 'bn'
                ? `আপনি কি নিশ্চিত যে "${confirmWinnerData.winnerTeam.name}" দলটিকে ম্যাচ #${confirmWinnerData.match.matchNumber} এর চূড়ান্ত বিজয়ী হিসেবে ঘোষণা করতে চান? বিজয়ী দলটি পরবর্তী রাউন্ডে উন্নীত হবে।`
                : `Are you sure you want to declare "${confirmWinnerData.winnerTeam.name}" as the winner of Match #${confirmWinnerData.match.matchNumber}? This team will advance to the next tournament stage.`
              : ''
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, বিজয়ী ঘোষণা করুন' : 'Confirm Winner'}
          cancelText={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          isDestructive={false}
          isLoading={isDeclaringWinner}
          onConfirm={handleDeclareWinner}
          onCancel={() => !isDeclaringWinner && setConfirmWinnerData(null)}
        />

        {/* =========================================================================
            RESET BRACKET CONFIRMATION MODAL
            ========================================================================= */}
        <ConfirmModal
          isOpen={isResetConfirmOpen}
          title={lang === 'bn' ? 'টুর্নামেন্ট ড্র ও ফিক্সচার রিসেট' : 'Reset Tournament Bracket'}
          message={
            lang === 'bn'
              ? 'সতর্কতা: বর্তমান টুর্নামেন্টের সমস্ত ফিক্সচার, ম্যাচের ফলাফল এবং রাউন্ড মুছে যাবে। আপনি কি নতুন করে ড্র করতে চান?'
              : 'CRITICAL WARNING: This will erase all scheduled matches, completed match results, and round brackets for this tournament. Are you sure?'
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset Bracket'}
          cancelText={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          isDestructive={true}
          isLoading={isResetting}
          onConfirm={handleResetBracket}
          onCancel={() => !isResetting && setIsResetConfirmOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
