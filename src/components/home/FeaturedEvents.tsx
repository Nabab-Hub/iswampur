'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import EventCard from '@/components/events/EventCard';
import { Calendar, ArrowRight } from 'lucide-react';

interface FeaturedEventsProps {
  events: VillageEvent[];
}

export default function FeaturedEvents({ events }: FeaturedEventsProps) {
  const { t } = useLanguage();

  if (!events || events.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span>{t.events.upcoming}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.events.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {t.events.subtitle}
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 group"
          >
            <span>{t.hero.exploreEvents}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
