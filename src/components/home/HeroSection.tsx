'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import Countdown from '@/components/layout/Countdown';
import { Trophy, Calendar, MapPin, ArrowRight, Sparkles, CheckCircle2, Flame, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  featuredEvent?: VillageEvent | null;
}

export default function HeroSection({ featuredEvent }: HeroSectionProps) {
  const { lang, t, resolveBilingual } = useLanguage();

  const isRegistrationOpen =
    featuredEvent?.registrationEnabled &&
    (!featuredEvent.registrationDeadline ||
      new Date(featuredEvent.registrationDeadline) > new Date());

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Stadium Floodlight Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F26522]/15 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-10 right-1/4 w-[30rem] h-[30rem] bg-[#19398A]/20 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Village & IPL Headline */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Ribbon Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#cbd9ec] dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] text-[#08143A] dark:text-white text-xs sm:text-sm font-black shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#F26522] animate-ping" />
              <Flame className="w-4 h-4 text-[#F26522]" />
              <span className="uppercase tracking-wider">
                {lang === 'bn' ? 'অফিসিয়াল স্পোর্টস ও ডিজিটাল প্ল্যাটফর্ম' : 'Official Village & Sports Platform'}
              </span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#08143A] dark:text-white leading-[1.15]">
              {lang === 'bn' ? (
                <>
                  স্বাগতম <span className="ipl-gradient-text-gold">ঈশ্বমপুর গ্রাম</span> ও প্রিমিয়ার লীগে
                </>
              ) : (
                <>
                  Welcome to <span className="ipl-gradient-text-gold">Iswampur</span> & Premier League
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-[#273656] dark:text-[#CBD5E1] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              {lang === 'bn'
                ? 'ঈশ্বমপুর গ্রামের ঐতিহ্যবাহী সংস্কৃতি, বার্ষিক অনুষ্ঠান এবং ঈশ্বমপুর প্রিমিয়ার লীগ (IPL) এর পূর্ণাঙ্গ অনলাইন নিবন্ধন ও সরাসরি ফলাফল পোর্টাল।'
                : 'The official digital home for Iswampur village events, rich cultural heritage, and the annual Iswampur Premier League (IPL) cricket tournament with online registration & digital team passes.'}
            </p>

            {/* Bullet Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-xs sm:text-sm font-bold text-[#08143A] dark:text-[#CBD5E1]">
              <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#0c1a40]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'ডিজিটাল কিউআর পাস' : 'Digital QR Team Pass'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#0c1a40]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs">
                <Trophy className="w-4 h-4 text-[#F9A01B]" />
                <span>{lang === 'bn' ? 'অনলাইন দল নিবন্ধন' : 'Online Team Registration'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#0c1a40]/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#00A3E0]" />
                <span>{lang === 'bn' ? 'স্বচ্ছ অ্যাডমিন যাচাই' : 'Verified Review Desk'}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-3 w-full">
              {isRegistrationOpen && (
                <Link
                  href={featuredEvent ? `/register/${featuredEvent.slug}` : '/register/iswampur-premier-league-2026'}
                  className="w-full sm:w-auto shrink-0 px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 shadow-lg shadow-[#F26522]/30 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base whitespace-nowrap active:scale-[0.98]"
                >
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{t.hero.registerBtn}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <Link
                  href="/ipl"
                  className="flex-1 sm:flex-initial shrink-0 px-4 sm:px-5 py-3.5 rounded-xl font-extrabold text-white bg-[#19398A] hover:bg-[#122b6a] transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base border border-[#F9A01B]/40 shadow-sm whitespace-nowrap active:scale-[0.98]"
                >
                  <Flame className="w-4 h-4 text-[#F9A01B] shrink-0" />
                  <span className="whitespace-nowrap">{lang === 'bn' ? 'আইপিএল হাব ও নিয়ম' : 'IPL Hub & Rules'}</span>
                </Link>

                <Link
                  href="/events"
                  className="flex-1 sm:flex-initial shrink-0 px-4 sm:px-5 py-3.5 rounded-xl font-bold text-[#08143A] dark:text-white bg-white dark:bg-[#0c1a40] hover:bg-[#e6eef8] dark:hover:bg-[#102766] border border-[#cbd9ec] dark:border-[#1d3575] transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base whitespace-nowrap active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4 text-[#19398A] dark:text-[#00A3E0] shrink-0" />
                  <span className="whitespace-nowrap">{t.hero.exploreEvents}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Broadcast Scoreboard Style Featured Card */}
          <div className="lg:col-span-5 flex justify-center">
            {featuredEvent ? (
              <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-[#0c1a40] border-2 border-[#19398A] dark:border-[#1d3575] shadow-2xl transition-all">
                {/* Image Banner with Badges */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#08143A]">
                  <img
                    src={featuredEvent.coverImage}
                    alt={resolveBilingual(featuredEvent.title)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08143A] via-[#08143A]/40 to-transparent" />

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#19398A] text-white shadow-md border border-[#F9A01B]/40 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[#F9A01B]" />
                      <span>{t.hero.featuredTag}</span>
                    </span>

                    {isRegistrationOpen ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#F26522] text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>{lang === 'bn' ? 'নিবন্ধন চলছে' : 'Reg Open'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-700 text-white text-[11px] font-bold">
                        {t.hero.registrationClosed}
                      </span>
                    )}
                  </div>

                  {/* Event Title over cover */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-bold text-[#F9A01B] uppercase tracking-wider">
                      {featuredEvent.category === 'cricket' ? 'IPL TOURNAMENT' : 'VILLAGE EVENT'}
                    </p>
                    <h3 className="font-black text-lg sm:text-xl line-clamp-1 drop-shadow-md">
                      {resolveBilingual(featuredEvent.title)}
                    </h3>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-2 text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#F26522] shrink-0" />
                      <span className="font-bold text-[#08143A] dark:text-white">{featuredEvent.startDate}</span>
                      {featuredEvent.endDate && <span>- {featuredEvent.endDate}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#19398A] dark:text-[#00A3E0] shrink-0" />
                      <span className="truncate">{resolveBilingual(featuredEvent.venue)}</span>
                    </div>
                  </div>

                  {/* Countdown Timer if registration is active */}
                  {isRegistrationOpen && featuredEvent.registrationDeadline && (
                    <div className="pt-2 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                      <Countdown targetDate={featuredEvent.registrationDeadline} />
                    </div>
                  )}

                  {/* Card Bottom CTA */}
                  <div className="pt-2 flex items-center gap-3">
                    {isRegistrationOpen ? (
                      <Link
                        href={`/register/${featuredEvent.slug}`}
                        className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] text-center text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>{t.hero.registerBtn}</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/events/${featuredEvent.slug}`}
                        className="w-full py-3 rounded-xl font-bold text-white bg-[#19398A] hover:bg-[#122b6a] text-center text-xs sm:text-sm"
                      >
                        {t.events.viewDetails}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
