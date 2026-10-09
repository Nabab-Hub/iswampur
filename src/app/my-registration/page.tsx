'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import { TeamRegistration } from '@/types';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  User,
  ArrowRight,
} from 'lucide-react';

function MyRegistrationContent() {
  const searchParams = useSearchParams();
  const initialRegId = searchParams.get('id');

  const { lang, t } = useLanguage();
  const { user, signInWithGoogle } = useAuth();

  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<TeamRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyRegistrations() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/registrations?ownerEmail=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const list: TeamRegistration[] = await res.json();
          setRegistrations(list);
          if (initialRegId) {
            const found = list.find((r) => r.id === initialRegId);
            if (found) setSelectedReg(found);
            else if (list.length > 0) setSelectedReg(list[0]);
          } else if (list.length > 0) {
            setSelectedReg(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load my registrations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyRegistrations();
  }, [user, initialRegId]);

  if (!user) {
    return (
      <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#19398A]/10 dark:bg-[#0c1a40] text-[#19398A] dark:text-[#00A3E0] flex items-center justify-center mx-auto border border-[#cbd9ec] dark:border-[#1d3575]">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'দল ও পাস ট্র্যাকিং' : 'Team & Pass Tracking'}
          </h1>
          <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
            {lang === 'bn'
              ? 'আপনার নিবন্ধিত দল ও অফিসিয়াল টিম পাস দেখতে Google দিয়ে লগইন করুন।'
              : 'Sign in with Google to view your registered squad and download matchday passes.'}
          </p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-md inline-flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span>{lang === 'bn' ? 'Google দিয়ে প্রবেশ করুন' : 'Sign in with Google'}</span>
        </button>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white flex items-center gap-1.5 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বাতিল (Rejected)' : 'Rejected'}</span>
          </span>
        );
      case 'CORRECTION_REQUIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#F26522] text-white flex items-center gap-1.5 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সংশোধন প্রয়োজন' : 'Correction Needed'}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#19398A] text-white flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'পর্যালোচনাধীন (Pending)' : 'Under Review'}</span>
          </span>
        );
    }
  };

  return (
    <main className="flex-1 py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'আমার দল ও টুর্নামেন্ট পাস' : 'My Registered Team & Match Pass'}
          </h1>
          <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
            {lang === 'bn' ? 'সংযুক্ত অ্যাকাউন্ট:' : 'Signed in as:'}{' '}
            <span className="font-mono font-black text-[#19398A] dark:text-[#00A3E0]">{user.email}</span>
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#273656] dark:text-[#CBD5E1] font-bold">
            {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
            <Trophy className="w-12 h-12 text-[#64748B] dark:text-[#94A3B8] mx-auto" />
            <h3 className="text-lg font-black text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'কোনো সক্রিয় নিবন্ধন পাওয়া যায়নি।' : 'No team registrations found.'}
            </h3>
            <p className="text-sm text-[#273656] dark:text-[#CBD5E1] max-w-md mx-auto font-medium">
              {lang === 'bn'
                ? 'আপনি এখনও কোনো দল নিবন্ধন করেননি। আইপিএল বা আসন্ন টুর্নামেন্টে দল নিবন্ধন করতে নিচের বোতামে ক্লিক করুন।'
                : 'You have not submitted a squad registration yet. Register your team now to participate!'}
            </p>
            <div className="pt-2">
              <a
                href="/register/iswampur-premier-league-2026"
                className="px-6 py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-md inline-flex items-center gap-2 uppercase tracking-wider text-sm"
              >
                <span>{lang === 'bn' ? 'এখনই দল নিবন্ধন করুন' : 'Register Squad Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Registrations List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'bn' ? `মোট নিবন্ধন (${registrations.length})` : `My Submissions (${registrations.length})`}
              </h3>
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedReg(reg)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedReg?.id === reg.id
                      ? 'bg-white dark:bg-[#0c1a40] border-2 border-[#19398A] dark:border-[#F26522] shadow-lg'
                      : 'bg-white/80 dark:bg-[#0c1a40]/80 border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#F26522] dark:text-[#F9A01B]">
                      {reg.humanPassCode || reg.id.substring(0, 10)}
                    </span>
                    {getStatusBadge(reg.status)}
                  </div>
                  <h4 className="font-black text-base text-[#08143A] dark:text-white mt-2">
                    {reg.team.name}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 font-semibold">
                    {lang === 'bn' ? 'অধিনায়ক:' : 'Captain:'} {reg.team.representativeName}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Column: Selected Registration Details & Pass */}
            {selectedReg && (
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
                    <div>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">
                        {lang === 'bn' ? 'রেজিস্ট্রেশন আইডি:' : 'Registration ID:'}
                      </span>
                      <p className="font-mono font-black text-sm text-[#08143A] dark:text-white">
                        {selectedReg.id}
                      </p>
                    </div>
                    <div>{getStatusBadge(selectedReg.status)}</div>
                  </div>

                  {/* Pass Download Card if Approved */}
                  {selectedReg.status === 'APPROVED' && selectedReg.passId && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#050D24] text-white border-2 border-[#1E3B8A] space-y-5 shadow-2xl relative overflow-hidden">
                      {/* Top Accent Strip */}
                      <div className="h-1 w-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0] absolute top-0 left-0" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-2xl bg-[#08143A] p-1.5 flex items-center justify-center border border-[#F9A01B]/40 shrink-0 shadow-md">
                            <Image
                              src="/logo-square-web.png"
                              alt="IPL Logo"
                              width={56}
                              height={56}
                              className="w-full h-full object-contain filter drop-shadow"
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-[#F9A01B]">
                              {lang === 'bn' ? 'অফিসিয়াল টিম পাস প্রস্তুত!' : 'OFFICIAL TEAM PASS READY!'}
                            </p>
                            <h4 className="font-black text-xl text-white">
                              {selectedReg.team.name}
                            </h4>
                          </div>
                        </div>

                        {/* High-visibility Pass Code badge */}
                        <div className="p-3 px-4 rounded-xl bg-gradient-to-r from-[#F9A01B] to-[#F26522] text-[#050D24] shadow-md border border-white/40 text-center sm:text-right shrink-0">
                          <span className="text-[10px] font-black uppercase tracking-widest block opacity-90">
                            {lang === 'bn' ? 'পাস কোড (PASS CODE)' : 'PASS CODE / ID'}
                          </span>
                          <span className="font-mono text-lg sm:text-xl font-black block tracking-wider select-all">
                            {selectedReg.humanPassCode || selectedReg.passId}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <a
                          href={`/api/passes/${selectedReg.passId}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3 rounded-xl font-black bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] text-white flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'অফিসিয়াল PDF পাস ডাউনলোড' : 'Download PDF Pass'}</span>
                        </a>

                        <a
                          href={`/verify/${selectedReg.passId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-3 rounded-xl font-bold bg-[#08143A] hover:bg-[#112766] border border-[#1D3D8F] text-white flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#00A3E0]" />
                          <span>{lang === 'bn' ? 'কিউআর যাচাই পৃষ্ঠা' : 'Verify Online'}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Team & Members */}
                  <div className="space-y-4">
                    <h4 className="font-black text-base text-[#08143A] dark:text-white border-b pb-2 border-[#cbd9ec] dark:border-[#1d3575]">
                      {lang === 'bn' ? 'দলের পূর্ণাঙ্গ তথ্য' : 'Squad Details'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                          {lang === 'bn' ? 'দলের নাম:' : 'Team Name:'}
                        </span>
                        <p className="font-black text-sm text-[#08143A] dark:text-white">{selectedReg.team.name}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                          {lang === 'bn' ? 'ঠিকানা:' : 'Address:'}
                        </span>
                        <p className="font-bold text-[#08143A] dark:text-white">{selectedReg.team.address || 'Iswampur'}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                          {lang === 'bn' ? 'দল প্রতিনিধি:' : 'Representative:'}
                        </span>
                        <p className="font-bold text-[#08143A] dark:text-white">{selectedReg.team.representativeName}</p>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                          {lang === 'bn' ? 'মোবাইল:' : 'Phone:'}
                        </span>
                        <p className="font-bold text-[#08143A] dark:text-white">{selectedReg.team.phone}</p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8] block mb-2">
                        {lang === 'bn'
                          ? `নিবন্ধিত খেলোয়াড় তালিকা (${selectedReg.team.members.length} জন):`
                          : `Roster Players (${selectedReg.team.members.length}):`}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedReg.team.members.map((player, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] flex items-center justify-between"
                          >
                            <span className="font-bold text-[#08143A] dark:text-white">
                              {idx + 1}. {player.name}
                            </span>
                            {player.role && player.role !== 'player' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#19398A] text-white">
                                {player.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function MyRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12">Loading...</div>}>
        <MyRegistrationContent />
      </Suspense>
      <Footer />
    </div>
  );
}
