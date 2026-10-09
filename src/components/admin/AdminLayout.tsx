'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  QrCode,
  Sliders,
  LogOut,
  Globe,
  ArrowLeft,
  Flame,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hasPermission, signOut } = useAuth();
  const { lang, toggleLanguage } = useLanguage();

  const isSuperAdmin = user?.role === 'super_admin';

  const menuItems = [
    {
      href: '/admin',
      label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Overview Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/admin/registrations',
      label: lang === 'bn' ? 'দল নিবন্ধন পর্যালোচনা' : 'Review Registrations',
      icon: Users,
      show: hasPermission('registrations.view') || hasPermission('registrations.review'),
    },
    {
      href: '/admin/events',
      label: lang === 'bn' ? 'অনুষ্ঠান ব্যবস্থাপনা' : 'Events Management',
      icon: Calendar,
      show: hasPermission('events.manage'),
    },
    {
      href: '/admin/posts',
      label: lang === 'bn' ? 'বিজ্ঞপ্তি ও ঘোষণা' : 'Notices & Updates',
      icon: Bell,
      show: hasPermission('notices.manage'),
    },
    {
      href: '/admin/checkin',
      label: lang === 'bn' ? 'মাঠের কিউআর চেক-ইন' : 'Matchday QR Check-in',
      icon: QrCode,
      show: hasPermission('matchday.checkin'),
    },
    {
      href: '/admin/form-builder',
      label: lang === 'bn' ? 'ফর্ম বিল্ডার (Dynamic)' : 'Registration Form Builder',
      icon: Sliders,
      show: hasPermission('ipl.manage') || isSuperAdmin,
    },
    {
      href: '/admin/content',
      label: lang === 'bn' ? 'সাইট কন্টেন্ট ও পেমেন্ট' : 'Site Content & Payment QR',
      icon: Settings,
      show: hasPermission('content.manage') || isSuperAdmin,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0f4fa] dark:bg-[#050d24] text-[#08143A] dark:text-white transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#071333] border-r border-[#cbd9ec] dark:border-[#1d3575] flex flex-col shrink-0 shadow-sm">
        <div className="p-5 border-b border-[#cbd9ec] dark:border-[#1d3575] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#08143A] to-[#19398A] border border-[#F9A01B]/40 p-1 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              <Image
                src="/logo-square-web.png"
                alt="Iswampur Premier League Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'ইস্বামপুর অ্যাডমিন' : 'Iswampur Admin'}
              </p>
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
                Management Panel
              </p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="px-5 py-3 border-b border-[#cbd9ec] dark:border-[#1d3575] bg-[#e6eef8]/50 dark:bg-[#0a1945]/50">
          <p className="text-xs font-black text-[#08143A] dark:text-white truncate">
            {user?.displayName || user?.email || 'Admin User'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-[#F26522] text-white'
                  : 'bg-[#19398A] text-white'
              }`}
            >
              {user?.role || 'Admin'}
            </span>
            {isSuperAdmin && (
              <Link
                href="/super-admin"
                className="text-[11px] font-black text-[#F26522] hover:underline"
              >
                Super Admin →
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#19398A] text-white shadow-sm'
                      : 'text-[#273656] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766] hover:text-[#08143A] dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0 text-[#F26522]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] font-black text-xs"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
            <Link
              href="/"
              className="p-1.5 rounded-lg border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40]"
              title="Return to site"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#19398A] dark:text-white" />
            </Link>
          </div>

          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-[#071333] border-b border-[#cbd9ec] dark:border-[#1d3575] px-6 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'ইস্বামপুর ডিজিটাল ব্যবস্থাপনা' : 'Iswampur Village & Tournament Management'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] font-black text-xs flex items-center gap-1.5 hover:border-[#F26522] transition-colors shadow-xs"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3.5 h-3.5 text-[#F26522]" />
              <span className="text-[#08143A] dark:text-white">{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'Visit Website'}</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
