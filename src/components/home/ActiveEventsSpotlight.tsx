'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import {
  Trophy,
  ShieldCheck,
  Flame,
  ArrowRight,
  FileText,
  CheckCircle,
  Users,
  Swords,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface ActiveEventsSpotlightProps {
  events: VillageEvent[];
}

export default function ActiveEventsSpotlight({ events = [] }: ActiveEventsSpotlightProps) {
  const { lang, t, resolveBilingual } = useLanguage();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter ONLY genuinely active events (published, not past, and actively accepting registrations or showInHero)
  const displayEvents = events.filter((e) => {
    if (e.published === false || e.status === 'archived' || e.status === 'draft' || e.status === 'completed') {
      return false;
    }

    const eventEndDate = e.endDate || e.startDate;
    if (eventEndDate && eventEndDate < todayStr) {
      return false;
    }

    // Must be actively accepting registrations OR explicitly marked showInHero
    const isRegistrationActive = Boolean(
      e.registrationEnabled &&
        (!e.registrationStartDate || e.registrationStartDate.slice(0, 10) <= todayStr) &&
        (!e.registrationDeadline || new Date(e.registrationDeadline) > new Date())
    );

    return isRegistrationActive || Boolean(e.showInHero);
  });

  // Active selected event state
  const [selectedId, setSelectedId] = useState<string>(
    displayEvents.find((e) => e.showInHero)?.id ||
      displayEvents.find((e) => e.category === 'cricket')?.id ||
      displayEvents[0]?.id ||
      ''
  );

  if (displayEvents.length === 0) {
    return null;
  }

  const selectedEvent = displayEvents.find((e) => e.id === selectedId) || displayEvents[0];
  const isCricket = selectedEvent.category === 'cricket';
  const isSports = selectedEvent.category === 'sports' || isCricket;
  const isCultural = selectedEvent.category === 'cultural';
  const isNational = selectedEvent.category === 'national_day';

  const isRegistrationOpen = Boolean(
    selectedEvent.registrationEnabled &&
      (!selectedEvent.registrationStartDate || new Date(selectedEvent.registrationStartDate) <= new Date()) &&
      (!selectedEvent.registrationDeadline || new Date(selectedEvent.registrationDeadline) > new Date())
  );

  // Dynamic category pill label
  const getCategoryLabel = (event: VillageEvent) => {
    switch (event.category) {
      case 'cricket':
        return lang === 'bn' ? 'বার্ষিক ক্রিকেট মহাযজ্ঞ' : 'OFFICIAL IPL TOURNAMENT';
      case 'sports':
        return lang === 'bn' ? 'গ্রাম্য ক্রীড়া প্রতিযোগিতা' : 'COMMUNITY SPORTS CUP';
      case 'cultural':
        return lang === 'bn' ? 'গ্রামীণ সাংস্কৃতিক ও নাট্যোৎসব' : 'CULTURAL DRAMA & ARTS';
      case 'national_day':
        return lang === 'bn' ? 'জাতীয় দিবস ও অনুষ্ঠান' : 'NATIONAL COMMEMORATION';
      case 'festival':
        return lang === 'bn' ? 'ঐতিহ্যবাহী গ্রামীণ উৎসব' : 'HERITAGE VILLAGE FESTIVAL';
      default:
        return lang === 'bn' ? 'সক্রিয় গ্রামীণ আয়োজন' : 'ACTIVE VILLAGE EVENT';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'cricket':
        return '🏏';
      case 'sports':
        return '⚽';
      case 'cultural':
        return '🎭';
      case 'national_day':
        return '🇮🇳';
      case 'festival':
        return '🪔';
      default:
        return '✨';
    }
  };

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* If multiple active events exist, show a sleek pill switcher */}
        {displayEvents.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26522] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F26522]"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'বর্তমানে সক্রিয় সকল আয়োজন:' : 'Currently Active Village Events:'}
              </span>
            </div>

            {/* Event Tabs Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {displayEvents.map((ev) => {
                const isCurrent = ev.id === selectedEvent.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedId(ev.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-md shadow-[#F26522]/20 scale-105'
                        : 'bg-white dark:bg-[#0c1a40] text-[#273656] dark:text-[#CBD5E1] border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522]'
                    }`}
                  >
                    <span>{getCategoryEmoji(ev.category)}</span>
                    <span className="max-w-[160px] truncate">{resolveBilingual(ev.title)}</span>
                    {ev.registrationEnabled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Featured Showcase Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#06122C] via-[#0A1B44] to-[#102A6B] text-white p-6 sm:p-10 lg:p-12 border-2 border-[#1E3B8A] shadow-2xl transition-all">
          {/* Decorative Stadium / Event Stage Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F26522]/20 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00A3E0]/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Ribbon */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F26522]/20 border border-[#F26522]/40 text-[#F9A01B] text-xs font-black uppercase tracking-widest">
                <Flame className="w-4 h-4 text-[#F26522]" />
                <span>{getCategoryLabel(selectedEvent)}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span className="ipl-gradient-text-gold">{resolveBilingual(selectedEvent.title)}</span>
              </h2>

              {/* Description */}
              <p className="text-[#CBD5E1] text-xs sm:text-base leading-relaxed max-w-xl font-normal">
                {resolveBilingual(selectedEvent.shortDescription || selectedEvent.fullDescription)}
              </p>

              {/* Event Highlights Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-white">
                {selectedEvent.registrationEnabled ? (
                  <>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#F9A01B] shrink-0" />
                      <span className="truncate">
                        {selectedEvent.maxTeams
                          ? `${selectedEvent.maxTeams} ${lang === 'bn' ? 'টি দল সীমা' : 'Squads Cap'}`
                          : lang === 'bn'
                          ? 'অনলাইন দল নিবন্ধন'
                          : 'Online Registration'}
                      </span>
                    </div>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0" />
                      <span className="truncate">{lang === 'bn' ? 'ডিজিটাল কিউআর পাস' : 'QR Match Passes'}</span>
                    </div>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
                      <CheckCircle className="w-4 h-4 text-[#F26522] shrink-0" />
                      <span className="truncate">{lang === 'bn' ? 'যাচাইকৃত অ্যাডমিন ডেস্ক' : 'Verified Review'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#F9A01B] shrink-0" />
                      <span className="truncate">{selectedEvent.startDate}</span>
                    </div>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#00A3E0] shrink-0" />
                      <span className="truncate">{resolveBilingual(selectedEvent.venue)}</span>
                    </div>
                    <div className="bg-[#08143A]/80 border border-[#1D3D8F] rounded-xl p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
                      <Users className="w-4 h-4 text-[#F26522] shrink-0" />
                      <span className="truncate">{lang === 'bn' ? 'সকলের জন্য উন্মুক্ত' : 'Open for All'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {isRegistrationOpen && (
                  <Link
                    href={`/register/${selectedEvent.slug}`}
                    className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-lg shadow-[#F26522]/30 transition-all flex items-center gap-2 group text-xs sm:text-base uppercase tracking-wider"
                  >
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span>{t.nav.registerNow}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {/* If cricket, show IPL Hub & Teams buttons */}
                {isCricket ? (
                  <>
                    <Link
                      href="/ipl/rules"
                      className="px-4 sm:px-5 py-3 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <FileText className="w-4 h-4 text-[#F9A01B]" />
                      <span>{t.ipl.rulesTab}</span>
                    </Link>

                    <Link
                      href="/ipl/teams"
                      className="px-4 sm:px-5 py-3 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#00A3E0]" />
                      <span>{t.ipl.teamsTab}</span>
                    </Link>

                    <Link
                      href="/ipl#fixtures"
                      className="px-4 sm:px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#19398A] to-[#1e4bb8] hover:brightness-110 border border-[#F9A01B]/40 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-md"
                    >
                      <Swords className="w-4 h-4 text-[#F9A01B]" />
                      <span>{lang === 'bn' ? 'লাইভ ফিক্সচার ও ড্র' : 'Live Fixtures & Draw'}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/events/${selectedEvent.slug}`}
                      className="px-5 py-3 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <FileText className="w-4 h-4 text-[#F9A01B]" />
                      <span>{lang === 'bn' ? 'সম্পূর্ণ বিবরণী ও সময়সূচি' : 'Full Details & Schedule'}</span>
                    </Link>
                    <Link
                      href="/events"
                      className="px-4 sm:px-5 py-3 rounded-xl font-bold text-white bg-[#0B1A42] hover:bg-[#112766] border border-[#1D3D8F] transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Calendar className="w-4 h-4 text-[#00A3E0]" />
                      <span>{lang === 'bn' ? 'সকল আয়োজন' : 'All Events'}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Scoreboard / Specs Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-[#08143A]/90 border-2 border-[#1E3B8A] p-5 sm:p-6 backdrop-blur-md space-y-4 shadow-2xl text-center">
                {/* Event Visual / Logo */}
                <div className="flex justify-center pb-2 border-b border-[#1E3B8A]">
                  {isCricket ? (
                    <Image
                      src="/logo-horizontal-web.png"
                      alt="IPL Logo"
                      width={220}
                      height={146}
                      className="h-14 sm:h-16 w-auto object-contain filter drop-shadow"
                    />
                  ) : selectedEvent.coverImage ? (
                    <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden relative">
                      <img
                        src={selectedEvent.coverImage}
                        alt={resolveBilingual(selectedEvent.title)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08143A] to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#19398A] text-white">
                        {resolveBilingual(selectedEvent.title)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 text-2xl">
                      {getCategoryEmoji(selectedEvent.category)}
                    </div>
                  )}
                </div>

                {/* Specs Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1E3B8A]/60">
                  <span className="text-xs font-black uppercase tracking-wider text-[#F9A01B] flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#F26522]" />
                    <span>{lang === 'bn' ? 'ইভেন্ট স্পেসিফিকেশন' : 'EVENT SPECS'}</span>
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#19398A] text-white">
                    {selectedEvent.startDate ? selectedEvent.startDate.slice(0, 7) : '2026'}
                  </span>
                </div>

                {/* Specs List */}
                <div className="space-y-2.5 text-xs sm:text-sm text-left">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#94A3B8]">{lang === 'bn' ? 'স্থান / ভেন্যু:' : 'Venue:'}</span>
                    <span className="font-bold text-white truncate max-w-[170px] text-right">
                      {resolveBilingual(selectedEvent.venue)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#94A3B8]">{lang === 'bn' ? 'তারিখ:' : 'Dates:'}</span>
                    <span className="font-bold text-white">
                      {selectedEvent.startDate}
                      {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate
                        ? ` - ${selectedEvent.endDate}`
                        : ''}
                    </span>
                  </div>

                  {selectedEvent.registrationFee !== undefined && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#94A3B8]">{lang === 'bn' ? 'নিবন্ধন ফি:' : 'Entry Fee:'}</span>
                      <span className="font-extrabold text-[#F9A01B]">
                        {selectedEvent.registrationFee > 0
                          ? `₹${selectedEvent.registrationFee.toLocaleString('en-IN')}${isCricket ? ' / Team' : ''}`
                          : lang === 'bn'
                          ? 'বিনামূল্যে (Free)'
                          : 'Free Entry'}
                      </span>
                    </div>
                  )}

                  {selectedEvent.maxTeams ? (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#94A3B8]">{lang === 'bn' ? 'দল সংখ্যা:' : 'Squad Cap:'}</span>
                      <span className="font-bold text-white">{selectedEvent.maxTeams} {lang === 'bn' ? 'টি দল' : 'Teams'}</span>
                    </div>
                  ) : selectedEvent.maxPlayers ? (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#94A3B8]">{lang === 'bn' ? 'দল গঠন:' : 'Squad Size:'}</span>
                      <span className="font-bold text-white">
                        {selectedEvent.minPlayers || 11} - {selectedEvent.maxPlayers} {lang === 'bn' ? 'জন' : 'Players'}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#94A3B8]">{lang === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}</span>
                    <span className="font-bold text-[#00A3E0] uppercase tracking-wide text-[11px]">
                      {selectedEvent.category}
                    </span>
                  </div>
                </div>

                {/* Action Link in Card */}
                <div className="pt-2 border-t border-[#1E3B8A]/60">
                  {isCricket ? (
                    <Link
                      href="/ipl/teams"
                      className="w-full py-2.5 rounded-xl bg-[#19398A] hover:bg-[#122b6a] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <span>{lang === 'bn' ? 'অনুমোদিত দলসমূহ দেখুন →' : 'APPROVED SQUADS →'}</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/events/${selectedEvent.slug}`}
                      className="w-full py-2.5 rounded-xl bg-[#19398A] hover:bg-[#122b6a] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <span>{lang === 'bn' ? 'পূর্ণাঙ্গ বিবরণী দেখুন →' : 'EXPLORE EVENT →'}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
