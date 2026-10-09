'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface CountdownProps {
  targetDate: string; // ISO string
}

export default function Countdown({ targetDate }: CountdownProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold">
        {t.hero.registrationClosed}
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3">
      <div className="flex flex-col items-center bg-slate-900/80 dark:bg-slate-800/90 text-white rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-md border border-slate-700/50 min-w-[50px] sm:min-w-[58px]">
        <span className="text-base sm:text-xl font-extrabold text-amber-400">{pad(timeLeft.days)}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-300">{t.hero.days}</span>
      </div>
      <span className="text-amber-500 font-extrabold text-lg">:</span>
      <div className="flex flex-col items-center bg-slate-900/80 dark:bg-slate-800/90 text-white rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-md border border-slate-700/50 min-w-[50px] sm:min-w-[58px]">
        <span className="text-base sm:text-xl font-extrabold text-amber-400">{pad(timeLeft.hours)}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-300">{t.hero.hours}</span>
      </div>
      <span className="text-amber-500 font-extrabold text-lg">:</span>
      <div className="flex flex-col items-center bg-slate-900/80 dark:bg-slate-800/90 text-white rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-md border border-slate-700/50 min-w-[50px] sm:min-w-[58px]">
        <span className="text-base sm:text-xl font-extrabold text-amber-400">{pad(timeLeft.minutes)}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-300">{t.hero.minutes}</span>
      </div>
      <span className="text-amber-500 font-extrabold text-lg">:</span>
      <div className="flex flex-col items-center bg-slate-900/80 dark:bg-slate-800/90 text-white rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-md border border-slate-700/50 min-w-[50px] sm:min-w-[58px]">
        <span className="text-base sm:text-xl font-extrabold text-amber-400">{pad(timeLeft.seconds)}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-300">{t.hero.seconds}</span>
      </div>
    </div>
  );
}
