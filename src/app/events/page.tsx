'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/events/EventCard';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import { Calendar, Filter } from 'lucide-react';

export default function EventsListPage() {
  const { lang, t } = useLanguage();
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const categories = [
    { id: 'all', label: t.events.allCategories },
    { id: 'cricket', label: t.events.cricket },
    { id: 'national_day', label: t.events.national_day },
    { id: 'cultural', label: t.events.cultural },
    { id: 'festival', label: t.events.festival },
  ];

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(e => e.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19398A] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>{t.events.upcoming}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#08143A] dark:text-white">
              {t.events.title}
            </h1>
            <p className="text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {t.events.subtitle}
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#19398A] text-white shadow-md'
                    : 'bg-white dark:bg-[#0c1a40] text-[#08143A] dark:text-[#CBD5E1] border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#273656] dark:text-[#CBD5E1] font-bold">
              {lang === 'bn' ? 'অনুষ্ঠান লোড হচ্ছে...' : 'Loading events...'}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#273656] dark:text-[#CBD5E1] font-bold">
              {t.events.noEvents}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
