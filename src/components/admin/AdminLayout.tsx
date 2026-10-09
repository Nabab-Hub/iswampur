'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, hasPermission, signInWithGoogle, signOut } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  // 1. Loading state (Guaranteed same on SSR and initial client hydration pass)
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl border-4 border-[#F26522] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">
          {lang === 'bn' ? 'অ্যাডমিন অনুমতি যাচাই করা হচ্ছে...' : 'Verifying Administrator Authorization...'}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state (Prompt Sign in)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#071333] border border-[#1d3575] rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {lang === 'bn' ? 'অ্যাডমিন লগইন আবশ্যক' : 'Admin Login Required'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'ঈশ্বমপুর অ্যাডমিন প্যানেলে প্রবেশের জন্য অনুমোদিত অ্যাডমিন গুগল অ্যাকাউন্টে সাইন-ইন করুন।'
                : 'Access to the Iswampur Admin Panel is restricted. Please sign in with an authorized administrator account.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F26522]/30"
            >
              <GoogleIcon />
              <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
            </button>

            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized state (Logged in, but not an admin or super admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050D24] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#071333] border border-rose-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-black uppercase tracking-wider">
              403 FORBIDDEN
            </div>
            <h2 className="text-2xl font-black text-white">
              {lang === 'bn' ? 'অননুমোদিত প্রবেশাধিকার' : 'Access Denied'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? `আপনার অ্যাকাউন্ট (${user.email}) এর অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই। এটি কেবল দায়িত্বপ্রাপ্ত গ্রাম কমিটি অ্যাডমিনদের জন্য সংরক্ষিত।`
                : `Your account (${user.email}) does not have administrator privileges. This area is strictly restricted to authorized committee admins.`}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/"
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#19398A] to-[#1e4bb8] text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#19398A]/30 border border-[#F9A01B]/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Home'}</span>
            </Link>

            <button
              onClick={signOut}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগআউট / অন্য অ্যাকাউন্ট দিয়ে লগইন' : 'Sign Out / Switch Account'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
