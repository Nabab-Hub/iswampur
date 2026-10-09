'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';
import { Trophy, ShieldCheck, Flame, ArrowRight, FileText, CheckCircle, Users } from 'lucide-react';

export default function IPLPromoBanner() {
  const { lang, t } = useLanguage();

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#06122C] via-[#0A1B44] to-[#102A6B] text-white p-8 sm:p-12 lg:p-14 border-2 border-[#1E3B8A] shadow-2xl">
          {/* Decorative Stadium Floodlight Effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F26522]/20 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00A3E0]/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F26522]/20 border border-[#F26522]/40 text-[#F9A01B] text-xs font-black uppercase tracking-widest">
                <Flame className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'বার্ষিক ক্রিকেট মহাযজ্ঞ' : 'OFFICIAL IPL TOURNAMENT'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span className="text-white">ISWAMPUR</span> <br className="hidden sm:inline" />
                <span className="ipl-gradient-text-gold">PREMIER LEAGUE 2026</span>
              </h2>

              <p className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                {lang === 'bn'
                  ? '১৬টি সেরা গ্রাম্য ক্রিকেট দল, আকর্ষণীয় নগদ অর্থ ও রাজকীয় ট্রফি! অনলাইন দল নিবন্ধন, যাচাইকৃত ডিজিটাল কিউআর পাস এবং অফিশিয়াল ম্যাচের সূচি নিয়ে প্রস্তুত থাকুন।'
                  : '16 champion village squads, high-voltage clashes, grand trophies! Complete with dynamic online registration, digital QR matchday passes, and real-time schedules.'}
              </p>

              {/* Tournament highlights badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-white">
                <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F9A01B] shrink-0" />
                  <span>{lang === 'bn' ? '১৬টি দল সীমা' : '16 Squads Cap'}</span>
                </div>
                <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0" />
                  <span>{lang === 'bn' ? 'ডিজিটাল কিউআর পাস' : 'QR Team Passes'}</span>
                </div>
                <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
                  <CheckCircle className="w-4 h-4 text-[#F26522] shrink-0" />
                  <span>{lang === 'bn' ? 'অনলাইন ভেরিফিকেশন' : 'Verified Review'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register/iswampur-premier-league-2026"
                  className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-lg shadow-[#F26522]/30 transition-all flex items-center gap-2 group text-sm sm:text-base uppercase tracking-wider"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{t.nav.registerNow}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                  <span>{t.ipl.teamsTab}</span>
                </Link>
              </div>
            </div>

            {/* Right Scoreboard / Visual Display */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-[#08143A]/90 border-2 border-[#1E3B8A] p-6 backdrop-blur-md space-y-4 shadow-2xl text-center">
                <div className="flex justify-center pb-2 border-b border-[#1E3B8A]">
                  <Image
                    src="/logo-horizontal-web.png"
                    alt="IPL Logo"
                    width={220}
                    height={146}
                    className="h-16 w-auto object-contain filter drop-shadow"
                  />
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#1E3B8A]/60">
                  <span className="text-xs font-black uppercase tracking-wider text-[#F9A01B] flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#F26522]" />
                    TOURNAMENT SPECS
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#19398A] text-white">
                    DEC 2026
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#94A3B8]">Format:</span>
                    <span className="font-bold text-white">Tennis Ball Knockout</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#94A3B8]">Match Overs:</span>
                    <span className="font-bold text-white">10 Overs (Final 12)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#94A3B8]">Registration Fee:</span>
                    <span className="font-extrabold text-[#F9A01B]">₹1,500 / Team</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#94A3B8]">Squad Size:</span>
                    <span className="font-bold text-white">11 - 15 Players</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#94A3B8]">Ground Venue:</span>
                    <span className="font-bold text-[#00A3E0] truncate max-w-[160px]">
                      {lang === 'bn' ? 'হাইস্কুল খেলার মাঠ' : 'High School Ground'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1E3B8A]">
                  <Link
                    href="/ipl/teams"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#19398A] to-[#102766] hover:from-[#1e4bb8] hover:to-[#19398A] text-white font-extrabold text-xs uppercase tracking-wider text-center block transition-colors border border-[#1D3D8F]"
                  >
                    {t.ipl.teamsTab} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
