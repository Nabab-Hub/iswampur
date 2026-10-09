'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { EventPhoto } from '@/types';
import { Image as ImageIcon, ArrowRight, X } from 'lucide-react';

interface VillageGalleryPreviewProps {
  photos?: EventPhoto[];
}

export default function VillageGalleryPreview({ photos }: VillageGalleryPreviewProps) {
  const { lang, t, resolveBilingual } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);

  const samplePhotos: EventPhoto[] = photos && photos.length > 0 ? photos : [
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      caption: {
        bn: 'ইস্বামপুর প্রিমিয়ার লীগের ফাইনাল ম্যাচের দৃশ্য',
        en: 'Grand Final match atmosphere of Iswampur Premier League',
      },
      order: 1,
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
      caption: {
        bn: 'বিজয়ী দলের হাতে চ্যাম্পিয়ন ট্রফি প্রদান',
        en: 'Champions lifting the winner trophy',
      },
      order: 2,
    },
    {
      id: 'g3',
      url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
      caption: {
        bn: 'স্বাধীনতা দিবসে গ্রামের প্রভাতফেরি ও পতাকা উত্তোলন',
        en: 'Independence Day morning march and flag hoisting',
      },
      order: 3,
    },
    {
      id: 'g4',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      caption: {
        bn: 'শারদীয় দুর্গোৎসব সাংস্কৃতিক মঞ্চের নৃত্য পরিবেশন',
        en: 'Traditional dance on Sharodotsav cultural stage',
      },
      order: 4,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#e6eef8]/50 dark:bg-[#081333]/60 border-y border-[#cbd9ec] dark:border-[#1d3575] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F26522] dark:text-[#F9A01B]">
              <ImageIcon className="w-4 h-4" />
              <span>{t.gallery.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
              {t.gallery.subtitle}
            </h2>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors group"
          >
            <span>{t.gallery.all}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {samplePhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522] transition-all"
            >
              <img
                src={photo.url}
                alt={resolveBilingual(photo.caption)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08143A]/90 via-[#08143A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-xs font-bold text-white line-clamp-2">
                  {resolveBilingual(photo.caption)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#08143A]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={resolveBilingual(selectedPhoto.caption)}
              className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-[#1D3D8F]"
            />
            <p className="text-sm sm:text-base font-bold text-white mt-4 text-center px-4">
              {resolveBilingual(selectedPhoto.caption)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
