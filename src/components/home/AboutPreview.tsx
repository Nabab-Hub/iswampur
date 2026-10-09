'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { Info, ArrowRight, Shield, Award, Users } from 'lucide-react';

export default function AboutPreview() {
  const { lang, t } = useLanguage();

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F26522] dark:text-[#F9A01B]">
              <Info className="w-4 h-4" />
              <span>{t.nav.about}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'ঐতিহ্য ও সম্প্রীতির ইস্বামপুর গ্রাম' : 'Historic & Harmonious Iswampur Village'}
            </h2>

            <p className="text-[#273656] dark:text-[#CBD5E1] text-sm sm:text-base leading-relaxed font-medium">
              {lang === 'bn'
                ? 'ইস্বামপুর একটি ঐতিহ্যবাহী গ্রাম, যেখানে যুগ যুগ ধরে সকল ধর্ম ও বর্ণের মানুষ ভ্রাতৃত্ব ও সৌহার্দ্যের সাথে বসবাস করে আসছেন। খেলাধুলা, সাংস্কৃতিক অনুষ্ঠান এবং বিভিন্ন সামাজিক উৎসবের মাধ্যমে আমাদের গ্রামবাসীরা একতাবদ্ধ।'
                : 'Iswampur is a time-honored village renowned for unity, peace, and brotherhood across generations. Sports tournaments, national commemorations, and traditional festivals bind our community closely.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1 shadow-sm">
                <Shield className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
                <h4 className="font-black text-sm text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'ভ্রাতৃত্ববোধ' : 'Unity'}
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {lang === 'bn' ? 'শতবর্ষের মেলবন্ধন' : 'Centuries of Peace'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1 shadow-sm">
                <Award className="w-5 h-5 text-[#F9A01B]" />
                <h4 className="font-black text-sm text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'ক্রীড়া ঐতিহ্য' : 'Athletic Spirit'}
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {lang === 'bn' ? '১০ম বর্ষের আইপিএল' : '10th Season IPL'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1 shadow-sm">
                <Users className="w-5 h-5 text-[#F26522]" />
                <h4 className="font-black text-sm text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'তরুণ প্রজন্ম' : 'Youth Energy'}
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {lang === 'bn' ? 'ডিজিটাল উদ্ভাবন' : 'Digital Growth'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] hover:underline transition-colors"
              >
                <span>{lang === 'bn' ? 'আমাদের ইতিহাস ও বিস্তারিত পড়ুন' : 'Read Our History & Details'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#19398A] dark:border-[#1d3575]">
              <img
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80"
                alt="Iswampur Ground"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08143A] via-[#08143A]/40 to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[#F9A01B]">
                    {lang === 'bn' ? 'গ্রাম্য প্রান্তর' : 'Village Heart'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black drop-shadow">
                    {lang === 'bn' ? 'ইস্বামপুর হাইস্কুল কেন্দ্রীয় মাঠ' : 'Iswampur High School Ground'}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
