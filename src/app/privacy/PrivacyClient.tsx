'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Server,
  FileCheck,
  ArrowRight,
  ChevronRight,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function PrivacyClient() {
  const { lang } = useLanguage();

  const sections = [
    {
      id: 'collection',
      icon: Database,
      title: {
        bn: '১. আমরা যেসকল তথ্য সংগ্রহ করি',
        en: '1. Information We Collect',
      },
      content: {
        bn: `আমরা দল নিবন্ধনের সময় দলের নাম, অধিনায়ক বা প্রতিনিধির নাম, মোবাইল ও হোয়াটসঅ্যাপ নম্বর, ইমেইল ঠিকানা, খেলোয়াড়দের তালিকা, জার্সি সাইজ এবং পেমেন্টের ইউটিআর (UTR) লেনদেন নম্বর সংগ্রহ করি। এছাড়া ম্যাচ ডে-তে কিউআর টিম পাস স্ক্যান করার সময় উপস্থিতি ও সময়ের ডিজিটাল তথ্য রেকর্ড করা হয়।`,
        en: `When registering for tournaments or village events, we collect team names, representative/captain names, mobile and WhatsApp numbers, email addresses, squad member lists, jersey sizes, and payment UTR transaction references. On matchday, QR verification timestamps are also logged.`,
      },
    },
    {
      id: 'usage',
      icon: Eye,
      title: {
        bn: '২. সংগৃহীত তথ্যের সঠিক ব্যবহার',
        en: '2. How We Use Your Information',
      },
      content: {
        bn: `সংগৃহীত তথ্য শুধুমাত্র টুর্নামেন্ট পরিচালনা, অফিসিয়াল ডিজিটাল কিউআর টিম পাস জেনারেশন, ফিক্সচার ড্র, ম্যাচ শিডিউল জানানো, জরুরি নিরাপত্তা যোগাযোগ এবং অংশগ্রহণকারীদের সার্টিফিকেট প্রদানের উদ্দেশ্যে ব্যবহৃত হয়। আমরা কোনো বাণিজ্যিক বিজ্ঞাপনদাতা বা বহিরাগত তৃতীয় পক্ষের কাছে কোনো তথ্য বিক্রয় করি না।`,
        en: `Your data is strictly utilized for tournament match scheduling, official Digital QR Team Pass generation, lottery draw allocations, emergency match updates, and issuing verified certificates. We never sell or lease user information to commercial advertisers or third-party brokers.`,
      },
    },
    {
      id: 'security',
      icon: Lock,
      title: {
        bn: '৩. তথ্য সুরক্ষা ও এনক্রিপশন',
        en: '3. Data Security & Cryptographic Protection',
      },
      content: {
        bn: `ঈশ্বমপুর ডিজিটাল প্ল্যাটফর্ম গুগলের সুরক্ষিত ক্লাউড অবকাঠামো (Google Cloud & Firebase) এবং আধুনিক এসএসএল (SSL/TLS) এনক্রিপশন প্রোটোকল ব্যবহার করে। প্রতিটি ডিজিটাল টিম পাস এইচএমএসি-এসএইচএ২৫৬ (HMAC-SHA256) ক্রিপ্টোগ্রাফিক অ্যালগরিদম দ্বারা সুরক্ষিত, যা যেকোনো জালিয়াতি বা ডুপ্লিকেট কিউআর পাস তৈরি প্রতিরোধ করে।`,
        en: `The platform operates on enterprise Google Cloud & Firebase infrastructure with full SSL/TLS HTTPS encryption. Each Digital Team Pass is signed with an HMAC-SHA256 cryptographic signature to prevent counterfeiting, tampering, or duplicate entries.`,
      },
    },
    {
      id: 'storage',
      icon: Server,
      title: {
        bn: '৪. কুকিজ ও লোকাল স্টোরেজ',
        en: '4. Cookies & Local Storage',
      },
      content: {
        bn: `আমাদের ওয়েবসাইটে আপনার ভাষা পছন্দ (বাংলা বা ইংরেজি) এবং অ্যাডমিন অথেনটিকেশন সেশনের স্থায়িত্ব বজায় রাখার জন্য ব্রাউজারের লোকাল স্টোরেজ ও নিরাপদ কুকিজ ব্যবহৃত হয়। আপনি চাইলে যেকোনো সময় আপনার ব্রাউজার সেটিংস থেকে এটি মুছে ফেলতে পারেন।`,
        en: `We use minimal local browser storage to retain your preferred language (Bengali or English) and maintain secure admin authentication state across page navigations. You may clear your browser cookies and storage at any time through browser settings.`,
      },
    },
    {
      id: 'thirdparty',
      icon: UserCheck,
      title: {
        bn: '৫. থার্ড-পার্টি ও বাহ্যিক সেবা',
        en: '5. Third-Party Services',
      },
      content: {
        bn: `নিরাপদ অ্যাডমিন লগইনের জন্য আমরা গুগল ও-অথ (Google OAuth) এবং ভেরিফায়েড ইমেইল প্রেরণের জন্য সুরক্ষিত এসএমটিপি (SMTP/Mailer) সেবা ব্যবহার করি। এই সকল সেবা নিজস্ব আন্তর্জাতিক গোপনীয়তা ও নিরাপত্তা মানদণ্ড অনুসরণ করে পরিচালিত হয়।`,
        en: `For secure committee authentication, we integrate Google OAuth, and for official confirmation emails, we use standard secure SMTP dispatchers. These services comply with international cloud privacy regulations.`,
      },
    },
    {
      id: 'contact',
      icon: Mail,
      title: {
        bn: '৬. গোপনীয়তা সংক্রান্ত যোগাযোগ',
        en: '6. Privacy Inquiries & Data Rights',
      },
      content: {
        bn: `আপনার নিবন্ধিত কোনো তথ্য সংশোধন, হালনাগাদ বা ডাটা মুছে ফেলার অনুরোধের জন্য সরাসরি ঈশ্বমপুর ডিজিটাল কমিটি অ্যাডমিনের সাথে contact@iswampur.org ঠিকানায় যোগাযোগ করুন।`,
        en: `If you wish to update your registered team information or submit a data privacy request, please contact the Iswampur Digital Committee at contact@iswampur.org.`,
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] text-[#08143A] dark:text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-[#F26522] transition-colors">
              {lang === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#19398A] dark:text-[#00A3E0] font-bold">
              {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </span>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-[#06122C] via-[#0A1B44] to-[#102A6B] text-white border-2 border-[#1E3B8A] shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A3E0]/20 blur-3xl pointer-events-none rounded-full" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-[#00A3E0]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DATA PRIVACY & USER SECURITY</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {lang === 'bn' ? 'তথ্য সুরক্ষা ও গোপনীয়তা নীতি' : 'Privacy Policy & Data Security'}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {lang === 'bn'
                  ? 'আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষা রক্ষা করা আমাদের সর্বোচ্চ অগ্রাধিকার। জেনে নিন কীভাবে আপনার ডাটা নিরাপদে সংরক্ষণ ও ব্যবহার করা হয়।'
                  : 'We are committed to protecting your personal information and team data with the highest security and transparency standards.'}
              </p>
            </div>
          </div>

          {/* Policy Sections Cards */}
          <div className="space-y-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs hover:border-[#00A3E0] transition-colors space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#e6eef8] dark:bg-[#0C1A40] text-[#00A3E0] flex items-center justify-center shrink-0">
                    <sec.icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#08143A] dark:text-white">
                    {lang === 'bn' ? sec.title.bn : sec.title.en}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-13 font-medium">
                  {lang === 'bn' ? sec.content.bn : sec.content.en}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Action Strip */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-[#cbd9ec] dark:border-[#1d3575] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-black text-base text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'শর্তাবলী ও আচরণবিধি দেখতে চান?' : 'Looking for Terms & Conditions?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'টুর্নামেন্টে অংশগ্রহণের সকল নিয়মাবলী শর্তাবলী পাতায় বিস্তারিত বর্ণিত রয়েছে।'
                  : 'Review all participation rules and ground guidelines on the Terms page.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/terms"
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#19398A] to-[#00A3E0] hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>{lang === 'bn' ? 'শর্তাবলী পড়ুন' : 'View Terms'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
