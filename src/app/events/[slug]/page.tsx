'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import { Calendar, MapPin, Trophy, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { lang, t, resolveBilingual } = useLanguage();
  const [event, setEvent] = useState<VillageEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 text-[#273656] dark:text-[#CBD5E1] font-bold">
          {lang === 'bn' ? 'অনুষ্ঠানের তথ্য লোড হচ্ছে...' : 'Loading event details...'}
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-lg font-bold text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'অনুষ্ঠানটি খুঁজে পাওয়া যায়নি।' : 'Event not found.'}
          </p>
          <Link
            href="/events"
            className="px-4 py-2 rounded-xl bg-[#19398A] text-white font-bold text-sm"
          >
            {lang === 'bn' ? 'সকল অনুষ্ঠানে ফিরে যান' : 'Back to Events'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isRegistrationOpen =
    event.registrationEnabled &&
    (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date());

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সকল অনুষ্ঠানে ফিরে যান' : 'Back to All Events'}</span>
          </Link>

          {/* Cover & Header Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-64 sm:h-96 w-full border-2 border-[#19398A] dark:border-[#1d3575]">
            <img
              src={event.coverImage}
              alt={resolveBilingual(event.title)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08143A]/95 via-[#08143A]/40 to-transparent flex items-end p-6 sm:p-10">
              <div className="space-y-3 text-white max-w-3xl">
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F26522] text-white shadow-md inline-block">
                  {event.category.replace('_', ' ')}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                  {resolveBilingual(event.title)}
                </h1>
                <p className="text-sm sm:text-base text-[#CBD5E1] font-semibold line-clamp-2">
                  {resolveBilingual(event.shortDescription)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex items-center gap-3.5 shadow-sm">
              <Calendar className="w-6 h-6 text-[#F26522] shrink-0" />
              <div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold uppercase">
                  {lang === 'bn' ? 'তারিখ' : 'EVENT DATE'}
                </p>
                <p className="font-black text-[#08143A] dark:text-white text-sm sm:text-base">
                  {event.startDate}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex items-center gap-3.5 shadow-sm">
              <MapPin className="w-6 h-6 text-[#19398A] dark:text-[#00A3E0] shrink-0" />
              <div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold uppercase">
                  {lang === 'bn' ? 'স্থান' : 'VENUE'}
                </p>
                <p className="font-black text-[#08143A] dark:text-white text-sm sm:text-base truncate">
                  {resolveBilingual(event.venue)}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex items-center gap-3.5 shadow-sm">
              <Trophy className="w-6 h-6 text-[#F9A01B] shrink-0" />
              <div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold uppercase">
                  {lang === 'bn' ? 'নিবন্ধন ফি' : 'ENTRY FEE'}
                </p>
                <p className="font-black text-[#08143A] dark:text-white text-sm sm:text-base">
                  {event.registrationFee ? `₹${event.registrationFee}` : (lang === 'bn' ? 'বিনামূল্যে' : 'Free')}
                </p>
              </div>
            </div>
          </div>

          {/* Details & Registration Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-4 shadow-sm">
                <h3 className="text-xl font-black text-[#08143A] dark:text-white border-b pb-3 border-[#cbd9ec] dark:border-[#1d3575]">
                  {lang === 'bn' ? 'অনুষ্ঠানের বিস্তারিত বিবরণ' : 'Event Description'}
                </h3>
                <div className="space-y-4 text-[#273656] dark:text-[#CBD5E1] leading-relaxed text-sm sm:text-base font-medium">
                  <p>{resolveBilingual(event.fullDescription) || resolveBilingual(event.shortDescription)}</p>
                </div>
              </div>

              {/* Event Gallery */}
              {event.gallery && event.gallery.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-4 shadow-sm">
                  <h3 className="text-xl font-black text-[#08143A] dark:text-white border-b pb-3 border-[#cbd9ec] dark:border-[#1d3575]">
                    {lang === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.gallery.map((photo) => (
                      <div key={photo.id} className="rounded-xl overflow-hidden shadow-md border border-[#cbd9ec] dark:border-[#1d3575]">
                        <img
                          src={photo.url}
                          alt={resolveBilingual(photo.caption) || 'Event photo'}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform"
                        />
                        {photo.caption && (
                          <div className="p-3 bg-white dark:bg-[#071333] text-xs font-bold text-[#08143A] dark:text-white">
                            {resolveBilingual(photo.caption)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Registration Status & Action */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1a40] border-2 border-[#19398A] dark:border-[#1d3575] space-y-5 shadow-lg">
                <h4 className="text-lg font-black text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'অনলাইন দল নিবন্ধন' : 'Team Registration'}
                </h4>

                {isRegistrationOpen ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>{lang === 'bn' ? 'নিবন্ধন প্রক্রিয়া সক্রিয় রয়েছে' : 'Registration is Active'}</span>
                    </div>

                    <div className="text-xs text-[#273656] dark:text-[#CBD5E1] space-y-2 border-y py-3 border-[#cbd9ec] dark:border-[#1d3575] font-semibold">
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'খেলোয়াড় সংখ্যা:' : 'Roster Size:'}</span>
                        <span className="font-black text-[#08143A] dark:text-white">
                          {event.minPlayers} - {event.maxPlayers} {lang === 'bn' ? 'জন' : 'Players'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'সর্বোচ্চ দল সীমা:' : 'Max Teams:'}</span>
                        <span className="font-black text-[#08143A] dark:text-white">
                          {event.maxTeams || 16} {lang === 'bn' ? 'টি' : 'Teams'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/register/${event.slug}`}
                      className="w-full py-3.5 rounded-xl text-center font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-md block transition-all uppercase tracking-wider text-sm"
                    >
                      {lang === 'bn' ? 'এখনই নিবন্ধন করুন →' : 'Register Now →'}
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] text-center text-[#64748B] dark:text-[#94A3B8] text-sm font-bold">
                    {lang === 'bn' ? 'এই অনুষ্ঠানের অনলাইন নিবন্ধন বর্তমানে বন্ধ রয়েছে।' : 'Online registration is currently closed.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
