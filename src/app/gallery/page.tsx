'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VillageGalleryPreview from '@/components/home/VillageGalleryPreview';
import { useLanguage } from '@/lib/i18n/context';
import { Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19398A] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>{t.gallery.title}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'ইস্বামপুর গ্রাম্য আলোকচিত্র সংগ্রহশালা' : 'Iswampur Village Photo Archives'}
            </h1>
            <p className="text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn'
                ? 'ক্রিকেট টুর্নামেন্ট, ১৫ই আগস্ট, ২৬শে জানুয়ারি, দুর্গাপূজা ও সামাজিক উদ্যোগের ঐতিহাসিক মুহূর্ত।'
                : 'Memorable photographs from cricket championships, national celebrations, festivals, and village development.'}
            </p>
          </div>

          <VillageGalleryPreview />
        </div>
      </main>
      <Footer />
    </div>
  );
}
