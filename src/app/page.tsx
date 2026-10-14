import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AnnouncementsTicker from '@/components/home/AnnouncementsTicker';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import IPLPromoBanner from '@/components/home/IPLPromoBanner';
import VillageGalleryPreview from '@/components/home/VillageGalleryPreview';
import AboutPreview from '@/components/home/AboutPreview';
import LiveBracketSection from '@/components/tournament/LiveBracketSection';
import { repository } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const events = await repository.getEvents(true);
  const posts = await repository.getPosts(true);

  // Find hero event (either marked showInHero or latest cricket event)
  const heroEvent =
    events.find((e) => e.showInHero) ||
    events.find((e) => e.category === 'cricket') ||
    events[0] ||
    null;

  // Find active cricket tournament event for live bracket
  const cricketEvent =
    events.find((e) => e.id === 'event-ipl-2026') ||
    events.find((e) => e.category === 'cricket' && e.status !== 'archived') ||
    heroEvent;

  // Fetch initial bracket data on server for instant render
  const initialBracket = cricketEvent
    ? await repository.getTournamentBracket(cricketEvent.id)
    : null;

  const showFixturesOnPublic = initialBracket ? initialBracket.showOnPublicPages !== false : true;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <AnnouncementsTicker posts={posts} />
      <main className="flex-1">
        <HeroSection featuredEvent={heroEvent} />

        {/* Live Cricket Tournament Fixtures & Multi-Stage Knockout Bracket */}
        {cricketEvent && showFixturesOnPublic && (
          <section className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <LiveBracketSection
              eventId={cricketEvent.id}
              initialBracket={initialBracket}
            />
          </section>
        )}

        <FeaturedEvents events={events} posts={posts} />
        <IPLPromoBanner />
        <VillageGalleryPreview />
        <AboutPreview />
      </main>
      <Footer />
    </div>
  );
}
