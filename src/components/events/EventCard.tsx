'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: VillageEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { lang, t, resolveBilingual } = useLanguage();

  const isRegistrationOpen =
    event.registrationEnabled &&
    (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date());

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'cricket':
        return 'bg-[#F26522] text-white';
      case 'national_day':
        return 'bg-[#19398A] text-white';
      case 'cultural':
        return 'bg-purple-700 text-white';
      case 'festival':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-[#00A3E0] text-white';
    }
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#08143A]">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'}
          alt={resolveBilingual(event.title)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08143A]/90 via-[#08143A]/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md ${getCategoryBadge(
              event.category
            )}`}
          >
            {event.category.replace('_', ' ')}
          </span>

          {isRegistrationOpen && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>{lang === 'bn' ? 'নিবন্ধন চলছে' : 'Reg Open'}</span>
            </span>
          )}
        </div>

        {/* Date on image overlay */}
        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-bold drop-shadow-md">
          <Calendar className="w-3.5 h-3.5 text-[#F9A01B]" />
          <span>{event.startDate}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-black text-lg text-[#08143A] dark:text-white group-hover:text-[#F26522] transition-colors line-clamp-1">
            {resolveBilingual(event.title)}
          </h3>
          <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed font-medium">
            {resolveBilingual(event.shortDescription)}
          </p>
        </div>

        {/* Venue & Fee details */}
        <div className="pt-2 border-t border-[#cbd9ec] dark:border-[#1d3575] text-xs text-[#273656] dark:text-[#CBD5E1] space-y-1.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#19398A] dark:text-[#00A3E0] shrink-0" />
            <span className="truncate font-semibold text-[#08143A] dark:text-white">
              {resolveBilingual(event.venue)}
            </span>
          </div>

          {event.registrationFee !== undefined && event.registrationFee > 0 && (
            <div className="flex items-center gap-2 font-black text-[#F26522] dark:text-[#F9A01B]">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t.events.registrationFee}: ₹{event.registrationFee}
              </span>
            </div>
          )}
        </div>

        {/* Card Footer Action */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <Link
            href={`/events/${event.slug}`}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-[#19398A] hover:bg-[#122b6a] transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{t.events.viewDetails}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
