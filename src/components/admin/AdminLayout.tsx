'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hasPermission, signOut } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-white dark:bg-[#071333] border-r border-[#cbd9ec] dark:border-[#1d3575] flex-col shrink-0 shadow-sm min-h-screen">
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
                {lang === 'bn' ? 'ঈশ্বমপুর অ্যাডমিন' : 'Iswampur Admin'}
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
        <header className="h-16 bg-white dark:bg-[#071333] border-b border-[#cbd9ec] dark:border-[#1d3575] px-4 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="md:hidden relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#08143A] to-[#19398A] border border-[#F9A01B]/40 p-0.5 flex items-center justify-center shrink-0">
              <Image
                src="/logo-square-web.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xs sm:text-base lg:text-lg font-black text-[#08143A] dark:text-white truncate">
              {lang === 'bn' ? 'ঈশ্বমপুর অ্যাডমিন প্যানেল' : 'Iswampur Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 sm:px-3 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#0c1a40] font-black text-xs flex items-center gap-1.5 hover:border-[#F26522] transition-colors shadow-xs"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3.5 h-3.5 text-[#F26522]" />
              <span className="text-[#08143A] dark:text-white hidden sm:inline">{lang === 'bn' ? 'English' : 'বাংলা'}</span>
              <span className="text-[#08143A] dark:text-white sm:hidden">{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] hover:underline hidden sm:flex items-center gap-1"
            >
              <span>{lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'Visit Website'}</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>

            {/* Mobile 3-bar hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 active:scale-95 text-white shadow-md shadow-[#F26522]/30 transition-all border border-[#F9A01B]/40"
              aria-label="Open Admin Menu"
              title="Admin Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.75] text-white" />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>

      {/* Mobile Right-Slide Drawer for Admin */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-[290px] sm:w-[320px] max-w-[85vw] bg-white dark:bg-[#071333] border-l border-slate-200 dark:border-[#1d3575] shadow-2xl z-50 flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1d3575]">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#08143A] to-[#19398A] border border-[#F9A01B]/40 p-1 flex items-center justify-center">
                <Image
                  src="/logo-square-web.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-black text-xs text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'ঈশ্বমপুর অ্যাডমিন' : 'Iswampur Admin'}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Management Panel
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Card */}
          <div className="my-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-50 dark:bg-[#040d21]">
            <p className="text-xs font-black text-[#08143A] dark:text-white truncate">
              {user?.displayName || user?.email || 'Admin User'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isSuperAdmin ? 'bg-[#F26522] text-white' : 'bg-[#19398A] text-white'
                }`}
              >
                {user?.role || 'Admin'}
              </span>
              {isSuperAdmin && (
                <Link
                  href="/super-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[10px] font-black text-[#F26522] hover:underline"
                >
                  Super Admin →
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 flex-1 overflow-y-auto py-1">
            {menuItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#19398A] text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#112766]'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 text-[#F26522]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Drawer Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#1d3575] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-100 dark:bg-[#0c1a40] font-black text-xs flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-[#F26522]" />
                <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>

              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-100 dark:bg-[#0c1a40] flex items-center gap-1 text-[11px] font-bold text-[#19398A] dark:text-[#00A3E0]"
              >
                <span>{lang === 'bn' ? 'ওয়েবসাইট' : 'Website'}</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>

            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
