'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import {
  Globe,
  Menu,
  X,
  Trophy,
  ShieldCheck,
  User,
  LogOut,
  Calendar,
  Image as ImageIcon,
  Bell,
  Info,
  Phone,
  Flame,
} from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/events', label: t.nav.events, icon: Calendar },
    { href: '/ipl', label: t.nav.ipl, icon: Trophy, isIPL: true },
    { href: '/gallery', label: t.nav.gallery, icon: ImageIcon },
    { href: '/announcements', label: t.nav.announcements, icon: Bell },
    { href: '/about', label: t.nav.about, icon: Info },
    { href: '/contact', label: t.nav.contact, icon: Phone },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#071333]/95 backdrop-blur-md border-b border-[#cbd9ec] dark:border-[#1d3575] transition-colors shadow-sm">
      {/* Top IPL Broadcast Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Village / IPL Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#08143A] via-[#102766] to-[#19398A] dark:from-[#0B1A42] dark:to-[#1E4BB8] p-1 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform border border-[#F9A01B]/40 overflow-hidden shrink-0">
              <Image
                src="/logo-square-web.png"
                alt="Iswampur Premier League Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain filter drop-shadow"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#08143A] dark:text-white group-hover:text-[#F26522] transition-colors">
                  {lang === 'bn' ? 'ঈশ্বমপুর' : 'Iswampur'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase bg-[#F26522] text-white">
                  IPL
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-[#273656] dark:text-[#CBD5E1] font-semibold tracking-wide">
                {lang === 'bn' ? 'ডিজিটাল গ্রাম ও স্পোর্টস প্ল্যাটফর্ম' : 'Village & Sports Digital Portal'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-9 px-3 xl:px-3.5 rounded-xl text-xs xl:text-[13px] font-bold transition-all flex items-center justify-center whitespace-nowrap ${
                    isActive
                      ? 'bg-[#19398A] dark:bg-[#1b3e9b] text-white shadow-xs'
                      : link.isIPL
                      ? 'text-[#F26522] dark:text-[#F9A01B] hover:bg-[#F26522]/10 font-extrabold'
                      : 'text-slate-700 dark:text-slate-200 hover:text-[#19398A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0d1e49]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isIPL && (
                    <span className="ml-1.5 flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26522] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F26522]"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="h-9 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1d3575] bg-slate-100/80 dark:bg-[#0c1a40] text-slate-800 dark:text-slate-200 hover:border-[#F26522] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              title="Toggle Bengali / English"
            >
              <Globe className="w-3.5 h-3.5 text-[#F26522]" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* User Auth or Sign-in */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-9 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1d3575] bg-slate-100/80 dark:bg-[#0c1a40] text-slate-800 dark:text-slate-200 hover:border-[#F26522] transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap"
                >
                  <div className="w-5 h-5 rounded-full bg-[#19398A] text-white flex items-center justify-center text-[10px] font-black">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[85px] truncate text-xs">{user.displayName || user.email}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-[#1d3575]">
                      <p className="font-bold text-[#08143A] dark:text-white truncate">{user.displayName || 'Google User'}</p>
                      <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#F26522]/15 text-[#F26522]">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/my-registration"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766] font-semibold"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#F9A01B]" />
                      <span>{t.nav.myRegistration}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766] font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#19398A] dark:text-[#00A3E0]" />
                        <span>{t.nav.adminPanel}</span>
                      </Link>
                    )}

                    {isSuperAdmin && (
                      <Link
                        href="/super-admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#F26522] hover:bg-[#F26522]/10 font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#F26522]" />
                        <span>{t.nav.superAdmin}</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-200 dark:border-[#1d3575] mt-1 pt-1">
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.nav.signOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="h-9 px-3.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#071333] hover:bg-slate-50 dark:hover:bg-[#0e2154] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-[#2b4c9e] shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <GoogleIcon />
                <span>{t.nav.signIn}</span>
              </button>
            )}

            {/* Quick Register CTA Button */}
            <Link
              href="/register/iswampur-premier-league-2026"
              className="h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md shadow-[#F26522]/20 bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span>{t.nav.registerNow}</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-black border border-[#cbd9ec] dark:border-[#1d3575] rounded-lg bg-[#f0f4fa] dark:bg-[#0c1a40] text-[#08143A] dark:text-white"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#08143A] dark:text-white hover:bg-[#e6eef8] dark:hover:bg-[#0d1e49]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#cbd9ec] dark:border-[#1d3575] bg-white dark:bg-[#071333] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-base font-bold ${
                pathname === link.href
                  ? 'bg-[#19398A] text-white'
                  : 'text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#0d1e49]'
              }`}
            >
              <div className="flex items-center gap-2">
                {link.icon && <link.icon className="w-4 h-4 text-[#F26522]" />}
                <span>{link.label}</span>
              </div>
            </Link>
          ))}

          <div className="border-t border-[#cbd9ec] dark:border-[#1d3575] pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] px-3">{user.email}</div>
                <Link
                  href="/my-registration"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-[#F26522]"
                >
                  {t.nav.myRegistration}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-[#19398A] dark:text-[#00A3E0]"
                  >
                    {t.nav.adminPanel}
                  </Link>
                )}
                {isSuperAdmin && (
                  <Link
                    href="/super-admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-[#F26522]"
                  >
                    {t.nav.superAdmin}
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600"
                >
                  {t.nav.signOut}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white flex items-center justify-center gap-2 shadow-md"
              >
                <User className="w-4 h-4" />
                {t.nav.signIn}
              </button>
            )}

            <Link
              href="/register/iswampur-premier-league-2026"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-black uppercase tracking-wider bg-[#19398A] text-white flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#F9A01B]" />
              {t.nav.registerNow}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
