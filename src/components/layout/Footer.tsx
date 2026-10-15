'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';
import { Phone, Mail, MapPin, Share2, Video, MessageCircle, Heart, Trophy, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-[#cbd9ec] dark:border-[#1d3575] bg-[#e6eef8]/70 dark:bg-[#071333] transition-colors mt-auto">
      {/* Top IPL Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#19398A]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Village Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[#08143A] via-[#102766] to-[#19398A] p-1 flex items-center justify-center shadow-md border border-[#F9A01B]/40 overflow-hidden shrink-0">
                <Image
                  src="/logo-square-web.png"
                  alt="Iswampur Premier League Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <span className="font-black text-xl tracking-tight text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'ঈশ্বমপুর গ্রাম ও প্রিমিয়ার লীগ' : 'Iswampur Village & Premier League'}
              </span>
            </div>
            <p className="text-sm text-[#273656] dark:text-[#CBD5E1] max-w-md leading-relaxed font-medium">
              {lang === 'bn'
                ? 'ঈশ্বমপুর গ্রামের প্রতিটি উৎসব, আনন্দময় মুহূর্ত ও বার্ষিক ক্রিকেট মহোৎসব (IPL) এর ঐক্যবদ্ধ ডিজিটাল মিলনমেলা। গ্রামের সংস্কৃতি ও পারস্পরিক সৌহার্দ্য রক্ষা করাই আমাদের ব্রত।'
                : 'A unified digital community platform dedicated to celebrating our village festivals, sports excellence in the Iswampur Premier League (IPL), and fostering community unity.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-[#CBD5E1] hover:text-white hover:bg-[#1877F2] flex items-center justify-center transition-all shadow-xs"
                aria-label="Community Page"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-[#CBD5E1] hover:text-white hover:bg-[#FF0000] flex items-center justify-center transition-all shadow-xs"
                aria-label="Video Channel"
              >
                <Video className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-[#CBD5E1] hover:text-white hover:bg-[#25D366] flex items-center justify-center transition-all shadow-xs"
                aria-label="WhatsApp Community"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#08143A] dark:text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link
                  href="/events"
                  className="text-[#273656] dark:text-[#CBD5E1] hover:text-[#19398A] dark:hover:text-[#00A3E0] transition-colors"
                >
                  {t.nav.events}
                </Link>
              </li>
              <li>
                <Link
                  href="/ipl"
                  className="text-[#F26522] dark:text-[#F9A01B] font-bold hover:underline flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{t.nav.ipl}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register/iswampur-premier-league-2026"
                  className="text-[#19398A] dark:text-[#00A3E0] font-bold hover:underline"
                >
                  {t.nav.registerNow}
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-[#273656] dark:text-[#CBD5E1] hover:text-[#19398A] dark:hover:text-[#00A3E0] transition-colors"
                >
                  {t.nav.gallery}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#273656] dark:text-[#CBD5E1] hover:text-[#19398A] dark:hover:text-[#00A3E0] transition-colors"
                >
                  {lang === 'bn' ? 'শর্তাবলী ও নিয়মাবলী' : 'Terms & Conditions'}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[#273656] dark:text-[#CBD5E1] hover:text-[#19398A] dark:hover:text-[#00A3E0] transition-colors"
                >
                  {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#273656] dark:text-[#CBD5E1] hover:text-[#19398A] dark:hover:text-[#00A3E0] transition-colors"
                >
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#08143A] dark:text-white">
              {t.footer.contactTitle}
            </h4>
            <div className="space-y-3 text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F26522] shrink-0 mt-0.5" />
                <span>
                  {lang === 'bn'
                    ? 'ঈশ্বমপুর গ্রাম, পোস্ট: ঈশ্বমপুর, পশ্চিমবঙ্গ, ভারত'
                    : 'Iswampur Village, PO: Iswampur, West Bengal, India'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F26522] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F26522] shrink-0" />
                <span>contact@iswampur.org</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#cbd9ec] dark:border-[#1d3575] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-4 flex-wrap">
            <p>© {lang === 'bn' ? '২০২৬' : new Date().getFullYear()} {t.footer.rights}</p>
            <span className="hidden sm:inline">•</span>
            <Link href="/terms" className="hover:text-[#F26522] transition-colors">
              {lang === 'bn' ? 'শর্তাবলী' : 'Terms'}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#F26522] transition-colors">
              {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Official Digital Platform of</span>
            <span className="text-[#F26522] font-black">{lang === 'bn' ? 'ঈশ্বমপুর গ্রাম কমিটি' : 'Iswampur Gram Committee'}</span>
          </div>
        </div>

        {/* Developer & Platform Maintainer Credit */}
        <div className="mt-6 pt-5 border-t border-[#cbd9ec]/50 dark:border-[#1d3575]/40 flex items-center justify-center">
          <a
            href="https://skahidulla.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-white/80 dark:bg-[#0c1a40]/90 backdrop-blur-md border border-[#cbd9ec] dark:border-[#1e3a7a] hover:border-[#F26522]/60 dark:hover:border-[#F9A01B]/60 shadow-xs hover:shadow-[0_4px_24px_rgba(242,101,34,0.18)] transition-all duration-300 hover:-translate-y-0.5"
            title="Sk Ahidulla - Portfolio & Projects"
          >
            {/* Live Status Indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            <span className="text-[11.5px] sm:text-xs font-semibold text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
              <span>Made and Managed by</span>
              <span className="font-black bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#F26522] bg-[length:200%_auto] bg-clip-text text-transparent group-hover:bg-right transition-all duration-500 underline-offset-2">
                Sk Ahidulla
              </span>
            </span>

            <ExternalLink className="w-3.5 h-3.5 text-[#F26522] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
          </a>
        </div>
      </div>
    </footer>
  );
}
