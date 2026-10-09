import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AnnouncementsTicker from '@/components/home/AnnouncementsTicker';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import IPLPromoBanner from '@/components/home/IPLPromoBanner';
import VillageGalleryPreview from '@/components/home/VillageGalleryPreview';
import AboutPreview from '@/components/home/AboutPreview';
import { repository } from '@/lib/db/repository';

export default async function HomePage() {
  const events = await repository.getEvents(true);
  const posts = await repository.getPosts(true);

  // Find hero event (either marked showInHero or latest cricket event)
  const heroEvent =
    events.find((e) => e.showInHero) ||
    events.find((e) => e.category === 'cricket') ||
    events[0] ||
    null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <AnnouncementsTicker posts={posts} />
      <main className="flex-1">
        <HeroSection featuredEvent={heroEvent} />
        <FeaturedEvents events={events} />
        <IPLPromoBanner />
        <VillageGalleryPreview />
        <AboutPreview />
      </main>
      <Footer />
    </div>
  );
}
