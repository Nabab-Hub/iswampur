'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { MapPin, Shield, Users, Heart, Award, Info } from 'lucide-react';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#19398A] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <Info className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>{lang === 'bn' ? 'গ্রামের পরিচয় ও গৌরবময় ইতিহাস' : 'HERITAGE & HISTORY'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'ঐতিহ্যবাহী ঈশ্বমপুর গ্রাম' : 'Historic Iswampur Village'}
            </h1>
            <p className="text-base text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn'
                ? 'ঐতিহ্য, সম্প্রীতি ও বার্ষিক ক্রিকেট টুর্নামেন্টের অনন্য মিলনমেলা।'
                : 'A peaceful community celebrated for unity, culture, and premier cricket tournaments.'}
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-72 sm:h-96 border-2 border-[#19398A] dark:border-[#1d3575]">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
              alt="Iswampur"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08143A]/95 via-transparent to-transparent flex items-end p-8">
              <p className="text-white font-black text-lg sm:text-xl drop-shadow">
                {lang === 'bn'
                  ? 'ঐতিহ্য, সম্প্রীতি ও ডিজিটাল অগ্রযাত্রায় আমাদের ঈশ্বমপুর'
                  : 'Tradition, Brotherhood & Digital Innovation in Iswampur'}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
            <h2 className="text-2xl font-black text-[#08143A] dark:text-white border-b pb-3 border-[#cbd9ec] dark:border-[#1d3575]">
              {lang === 'bn' ? 'আমাদের গ্রাম সম্পর্কে' : 'About Our Community'}
            </h2>
            <div className="space-y-4 text-[#273656] dark:text-[#CBD5E1] leading-relaxed text-base font-medium">
              <p>
                {lang === 'bn'
                  ? 'ঈশ্বমপুর একটি ঐতিহ্যবাহী গ্রাম, যেখানে যুগ যুগ ধরে সকল ধর্ম ও বর্ণের মানুষ ভ্রাতৃত্ব ও সৌহার্দ্যের সাথে বসবাস করে আসছেন। খেলাধুলা, সাংস্কৃতিক অনুষ্ঠান এবং বিভিন্ন সামাজিক উৎসবের মাধ্যমে আমাদের গ্রামবাসীরা একতাবদ্ধ।'
                  : 'Iswampur is a time-honored village renowned for unity, peace, and brotherhood across generations. Sports tournaments, national commemorations, and traditional festivals bind our community closely.'}
              </p>
              <p>
                {lang === 'bn'
                  ? 'প্রতি বছর আয়োজিত "ঈশ্বমপুর প্রিমিয়ার লীগ" (IPL) আমাদের যুব সমাজ ও ক্রীড়ামোদী মানুষের সবচেয়ে বড় আকর্ষণ। এছাড়া ২৬শে জানুয়ারি, ১৫ই আগস্ট ও শারদীয় দুর্গোৎসবে গ্রাম কমিটি এক হয়ে কাজ করে।'
                  : 'The annual Iswampur Premier League (IPL) cricket championship is our greatest youth and sporting festival, complemented by proud celebrations of Independence Day, Republic Day, and cultural Pujas.'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
