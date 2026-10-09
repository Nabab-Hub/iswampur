'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { PostAnnouncement } from '@/types';
import { Bell, ArrowRight } from 'lucide-react';

interface AnnouncementsTickerProps {
  posts: PostAnnouncement[];
}

export default function AnnouncementsTicker({ posts }: AnnouncementsTickerProps) {
  const { lang, resolveBilingual } = useLanguage();
  if (!posts || posts.length === 0) return null;

  const latest = posts[0];

  return (
    <div className="bg-[#19398A]/10 dark:bg-[#0c1a40] border-b border-[#cbd9ec] dark:border-[#1d3575] py-2.5 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F26522] text-white font-black uppercase tracking-wider text-[11px] shrink-0">
            <Bell className="w-3 h-3" />
            <span>{lang === 'bn' ? 'বিজ্ঞপ্তি' : 'NOTICE'}</span>
          </span>
          <p className="font-bold text-[#08143A] dark:text-white truncate">
            {resolveBilingual(latest.title)}
          </p>
        </div>

        <Link
          href="/announcements"
          className="shrink-0 flex items-center gap-1 text-[#F26522] dark:text-[#F9A01B] font-black hover:underline text-xs sm:text-sm"
        >
          <span>{lang === 'bn' ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
