'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import {
  FileText,
  ShieldCheck,
  Users,
  AlertTriangle,
  Scale,
  CreditCard,
  QrCode,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function TermsClient() {
  const { lang } = useLanguage();

  const sections = [
    {
      id: 'acceptance',
      icon: Scale,
      title: {
        bn: '১. সাধারণ শর্তাবলীর গ্রহণযোগ্যতা',
        en: '1. Acceptance of Terms',
      },
      content: {
        bn: `ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম এবং ঈশ্বমপুর প্রিমিয়ার লীগ (IPL) টুর্নামেন্ট পোর্টালে আপনাকে স্বাগতম। এই ওয়েবসাইট ব্যবহার করে কোনো ইভেন্টে অংশগ্রহণ বা দল নিবন্ধন করার মাধ্যমে আপনি এই শর্তাবলী সম্পূর্ণভাবে মেনে নিতে সম্মত হচ্ছেন। পরিচালনা কমিটি যেকোনো সময় এই নিয়মাবলী সংস্কার বা হালনাগাদ করার অধিকার সংরক্ষণ করে।`,
        en: `Welcome to the Iswampur Village Digital Platform and Iswampur Premier League (IPL) portal. By using this website, submitting registrations, or participating in tournaments, you agree to be bound by these Terms & Conditions. The committee reserves the right to amend these terms at any time.`,
      },
    },
    {
      id: 'registration',
      icon: Users,
      title: {
        bn: '২. দল নিবন্ধন ও খেলোয়াড়দের যোগ্যতা',
        en: '2. Team Registration & Player Eligibility',
      },
      content: {
        bn: `প্রতিটি ক্রিকেট দলে নূন্যতম ১১ জন এবং অনধিক ১৫ জন নিবন্ধিত খেলোয়াড় অন্তর্ভুক্ত থাকতে হবে। প্রতিটি দলের একজন নির্দিষ্ট অধিনায়ক বা প্রতিনিধি থাকবেন যিনি কমিটির সাথে যাবতীয় যোগাযোগের জন্য দায়বদ্ধ থাকবেন। একবার দল অনুমোদিত হয়ে গেলে কমিটি অনুমতি ব্যতীত কোনো খেলোয়াড় পরিবর্তন গ্রহণযোগ্য হবে না। বাইরের কোনো অনিবন্ধিত খেলোয়াড় মাঠে নামানো সম্পূর্ণ নিষিদ্ধ।`,
        en: `Each cricket squad must consist of a minimum of 11 and a maximum of 15 registered players. Each squad must designate an official Captain/Representative responsible for all coordination with the management. Once approved, player replacements are strictly prohibited without prior written consent from the committee.`,
      },
    },
    {
      id: 'passes',
      icon: QrCode,
      title: {
        bn: '৩. ডিজিটাল কিউআর টিম পাস ও মাঠের প্রবেশাধিকার',
        en: '3. Digital QR Team Pass & Ground Access',
      },
      content: {
        bn: `অনুমোদনের পর প্রতিটি দলকে একটি অনন্য ক্রিপ্টোগ্রাফিক ডিজিটাল কিউআর টিম পাস প্রদান করা হয়। ম্যাচ দিবসে নির্ধারিত টসের নূন্যতম ৩০ মিনিট পূর্বে সম্পূর্ণ দলকে মাঠে উপস্থিত হয়ে অফিশিয়াল চেকিং ডেস্কে পাস স্ক্যান করে রিপোর্ট করতে হবে। বৈধ পাস ছাড়া কোনো খেলোয়াড় বা দলকে মাঠে প্রবেশ করতে দেওয়া হবে না।`,
        en: `Upon approval, each team is issued a cryptographically verified Digital QR Team Pass. On matchday, the entire squad must report to the check-in desk at least 30 minutes prior to the scheduled toss to scan their QR pass. Teams or players without a valid digital pass will be denied ground entry.`,
      },
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: {
        bn: '৪. নিবন্ধন ফি ও রিফান্ড সংক্রান্ত নীতিমালা',
        en: '4. Entry Fees & Refund Policy',
      },
      content: {
        bn: `নিবন্ধিত টুর্নামেন্ট বা ইভেন্টের জন্য প্রযোজ্য এন্ট্রি ফি অফিসিয়াল কিউআর কোড বা ইউপিআই এর মাধ্যমে পরিশোধ করতে হবে এবং সঠিক ব্যাংক ইউটিআর (UTR) নম্বর প্রদান করতে হবে। কমিটি কর্তৃক রেজিস্ট্রেশন চূড়ান্ত অনুমোদন লাভের পর কোনো অবস্থাতেই নিবন্ধন ফি ফেরতযোগ্য (Non-refundable) নয়। তবে কমিটি যদি টুর্নামেন্ট বাতিল করে, তবে সম্পূর্ণ ফি ফেরত দেওয়া হবে।`,
        en: `Tournament entry fees must be settled via the official UPI QR code with a valid bank UTR transaction reference. Once a registration is reviewed and approved by the committee, entry fees are strictly non-refundable. If the tournament is officially cancelled by the organizers, 100% of the fee will be refunded.`,
      },
    },
    {
      id: 'conduct',
      icon: ShieldCheck,
      title: {
        bn: '৫. খেলার মাঠের শৃঙ্খলা ও আম্পায়ারের সিদ্ধান্ত',
        en: '5. Fair Play, Discipline & Umpiring Authority',
      },
      content: {
        bn: `মাঠে এবং মাঠের বাইরে সকল খেলোয়াড় ও সমর্থকদের সুস্থ ক্রীড়াসুলভ আচরণ এবং শৃঙ্খলা বজায় রাখতে হবে। আম্পায়ার ও টুর্নামেন্ট পরিচালনা কমিটির সিদ্ধান্তই চূড়ান্ত ও অলঙ্ঘনীয়। যেকোনো ধরনের দুর্ব্যবহার, অবাধ্যতা বা শৃঙ্খলাভঙ্গের দায়ে সংশ্লিষ্ট দল বা খেলোয়াড়কে তাৎক্ষণিক টুর্নামেন্ট থেকে বহিষ্কার করা হতে পারে।`,
        en: `Fair play, respectful sportsmanship, and ground discipline must be upheld by all participants and supporters. The decisions of the on-field match umpires and tournament committee are ultimate and binding. Any indiscipline or misconduct may result in immediate team disqualification without appeal.`,
      },
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: {
        bn: '৬. সুরক্ষা, ঝুঁকি ও দায়বদ্ধতা',
        en: '6. Safety, Assumption of Risk & Liability',
      },
      content: {
        bn: `খেলা চলাকালীন খেলোয়াড়দের ব্যক্তিগত সুরক্ষা সরঞ্জাম (গার্ড, প্যাড ইত্যাদি) নিজ দায়িত্বে ব্যবহার করতে হবে। খেলার সাধারণ গতিতে অনাকাঙ্ক্ষিত কোনো শারীরিক আঘাত বা দুর্ঘটনার ক্ষেত্রে কমিটি তাৎক্ষণিক প্রাথমিক চিকিৎসার ব্যবস্থা করবে, তবে কোনো আর্থিক বা আইনি ক্ষতিপূরণের দায়ভার গ্রহণ করবে না।`,
        en: `Participants play at their own risk and must wear adequate protective gear. While on-field first aid is provided on matchday, the tournament organizers and village committee shall not be held liable for any unforeseen injuries, property loss, or incidental damages.`,
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
              {lang === 'bn' ? 'শর্তাবলী ও নিয়মাবলী' : 'Terms & Conditions'}
            </span>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-[#08143A] via-[#0D1F4D] to-[#19398A] text-white border-2 border-[#1E3B8A] shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F26522]/20 blur-3xl pointer-events-none rounded-full" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-[#F9A01B]">
                <FileText className="w-4 h-4 text-[#F26522]" />
                <span>OFFICIAL TERMS & POLICIES</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {lang === 'bn' ? 'শর্তাবলী ও টুর্নামেন্ট আচরণবিধি' : 'Terms & Conditions of Participation'}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {lang === 'bn'
                  ? 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্মের সকল নিয়মাবলী, স্বচ্ছ স্পোর্টসম্যানশিপ ও টুর্নামেন্ট নীতিমালার অফিসিয়াল রূপরেখা।'
                  : 'Official guidelines governing fair play, digital registrations, matchday attendance, and community standards for Iswampur.'}
              </p>
            </div>
          </div>

          {/* Policy Sections Cards */}
          <div className="space-y-6">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs hover:border-[#F26522] transition-colors space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#e6eef8] dark:bg-[#0C1A40] text-[#F26522] flex items-center justify-center shrink-0">
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

          {/* Support Strip */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-orange-500/10 border border-[#cbd9ec] dark:border-[#1d3575] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-black text-base text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'কোনো নিয়ম বা শর্ত নিয়ে প্রশ্ন আছে?' : 'Have Questions About the Rules?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'সরাসরি ঈশ্বমপুর গ্রাম কমিটি বা টুর্নামেন্ট কন্ট্রোল ডেস্কের সাথে যোগাযোগ করুন।'
                  : 'Contact the Iswampur Gram Committee or tournament match desk directly.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/privacy"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#0C1A40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#19398A] dark:text-white hover:border-[#F26522] transition-colors"
              >
                {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <span>{lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}</span>
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
