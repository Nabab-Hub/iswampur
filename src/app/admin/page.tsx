'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { TeamRegistration, VillageEvent } from '@/types';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  QrCode,
  Plus,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles,
  Trophy,
  RotateCcw,
  RefreshCw,
  Eye,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboardPage() {
  const { lang, t } = useLanguage();
  const toast = useToast();
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters: Year, Month, Specific Event by Name, Search
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toggle for Previous Events Archive
  const [showPastEvents, setShowPastEvents] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [regRes, evRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/events'),
      ]);
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData);
      }
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(evData);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncFirebase = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          lang === 'bn'
            ? 'ফায়ারবেস ডেটা সফলভাবে সিঙ্ক ও রিফ্রেশ করা হয়েছে!'
            : 'Firebase data successfully synced & refreshed!'
        );
        await loadData();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch {
      toast.error('Network error during sync');
    } finally {
      setSyncing(false);
    }
  };

  // Month names map
  const monthLabels: Record<string, { bn: string; en: string }> = {
    '01': { bn: 'জানুয়ারি (Jan)', en: 'January' },
    '02': { bn: 'ফেব্রুয়ারি (Feb)', en: 'February' },
    '03': { bn: 'মার্চ (Mar)', en: 'March' },
    '04': { bn: 'এপ্রিল (Apr)', en: 'April' },
    '05': { bn: 'মে (May)', en: 'May' },
    '06': { bn: 'জুন (Jun)', en: 'June' },
    '07': { bn: 'জুলাই (Jul)', en: 'July' },
    '08': { bn: 'আগস্ট (Aug)', en: 'August' },
    '09': { bn: 'সেপ্টেম্বর (Sep)', en: 'September' },
    '10': { bn: 'অক্টোবর (Oct)', en: 'October' },
    '11': { bn: 'নভেম্বর (Nov)', en: 'November' },
    '12': { bn: 'ডিসেম্বর (Dec)', en: 'December' },
  };

  // Enriched metrics for every event
  const enrichedEvents = useMemo(() => {
    return events.map((ev) => {
      const eventRegs = registrations.filter((r) => r.eventId === ev.id);
      const totalTeams = eventRegs.length;
      const approvedCount = eventRegs.filter((r) => r.status === 'APPROVED').length;
      const pendingCount = eventRegs.filter((r) => r.status === 'PENDING_REVIEW').length;
      const revenue = eventRegs
        .filter((r) => r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

      const maxTeams = ev.maxTeams || 16;
      const capacityPercent = Math.min(100, Math.round((approvedCount / maxTeams) * 100));

      const year = ev.startDate ? ev.startDate.split('-')[0] : '';
      const month = ev.startDate ? ev.startDate.split('-')[1] : '';

      // Determine upcoming vs past
      const eventEndDate = ev.endDate || ev.startDate;
      const isPast =
        !ev.registrationEnabled &&
        Boolean(eventEndDate && new Date(eventEndDate) < new Date());
      const isUpcoming = Boolean(ev.registrationEnabled) || !isPast;

      return {
        ...ev,
        totalTeams,
        approvedCount,
        pendingCount,
        revenue,
        maxTeams,
        capacityPercent,
        year,
        month,
        isUpcoming,
        isPast,
      };
    });
  }, [events, registrations]);

  // List of all upcoming events (for dropdown selection)
  const allUpcomingEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => ev.isUpcoming);
  }, [enrichedEvents]);

  // Filter available years and months from upcoming events
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allUpcomingEvents.forEach((ev) => {
      if (ev.year) years.add(ev.year);
    });
    return Array.from(years).sort().reverse();
  }, [allUpcomingEvents]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allUpcomingEvents.forEach((ev) => {
      if (ev.month) {
        if (selectedYear === 'ALL' || ev.year === selectedYear) {
          months.add(ev.month);
        }
      }
    });
    return Array.from(months).sort();
  }, [allUpcomingEvents, selectedYear]);

  // Filtered UPCOMING events based on filters
  const filteredUpcomingEvents = useMemo(() => {
    return allUpcomingEvents.filter((ev) => {
      const matchesEvent = selectedEventId === 'ALL' || ev.id === selectedEventId;
      const matchesYear = selectedYear === 'ALL' || ev.year === selectedYear;
      const matchesMonth = selectedMonth === 'ALL' || ev.month === selectedMonth;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.bn.toLowerCase().includes(q) ||
        ev.title.en.toLowerCase().includes(q) ||
        ev.venue.bn.toLowerCase().includes(q) ||
        ev.venue.en.toLowerCase().includes(q);

      return matchesEvent && matchesYear && matchesMonth && matchesSearch;
    });
  }, [allUpcomingEvents, selectedEventId, selectedYear, selectedMonth, searchQuery]);

  // All PAST / Completed events (strictly separated from top dashboard)
  const pastEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => ev.isPast);
  }, [enrichedEvents]);

  // Top KPI metrics: STRICTLY from upcoming events in current filter scope
  const upcomingMetrics = useMemo(() => {
    const activeEventIds = new Set(filteredUpcomingEvents.map((e) => e.id));
    const scopedRegs = registrations.filter((r) => activeEventIds.has(r.eventId));

    const totalTeams = scopedRegs.length;
    const pendingCount = scopedRegs.filter((r) => r.status === 'PENDING_REVIEW').length;
    const approvedCount = scopedRegs.filter((r) => r.status === 'APPROVED').length;
    const totalRevenue = scopedRegs
      .filter((r) => r.status === 'APPROVED')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

    return {
      totalEvents: filteredUpcomingEvents.length,
      totalTeams,
      pendingCount,
      approvedCount,
      totalRevenue,
    };
  }, [filteredUpcomingEvents, registrations]);

  // Past events summary metrics for the bottom archive section
  const pastMetrics = useMemo(() => {
    const pastEventIds = new Set(pastEvents.map((e) => e.id));
    const scopedRegs = registrations.filter((r) => pastEventIds.has(r.eventId));

    const totalTeams = scopedRegs.length;
    const approvedCount = scopedRegs.filter((r) => r.status === 'APPROVED').length;
    const totalRevenue = scopedRegs
      .filter((r) => r.status === 'APPROVED')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

    return {
      totalPastEvents: pastEvents.length,
      totalTeams,
      approvedCount,
      totalRevenue,
    };
  }, [pastEvents, registrations]);

  const formatEventPeriod = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m] = dateStr.split('-');
    const mName = monthLabels[m] ? (lang === 'bn' ? monthLabels[m].bn : monthLabels[m].en) : m;
    return `${mName} ${y}`;
  };

  const hasActiveFilters =
    selectedYear !== 'ALL' ||
    selectedMonth !== 'ALL' ||
    selectedEventId !== 'ALL' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedYear('ALL');
    setSelectedMonth('ALL');
    setSelectedEventId('ALL');
    setSearchQuery('');
  };

  return (
    <AdminLayout>
      <div className="space-y-7">
        {/* Top Header & Overview Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/30">
                {lang === 'bn' ? 'আসন্ন অনুষ্ঠান নিয়ন্ত্রণ' : 'Upcoming Event Operations'}
              </span>
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {lang === 'bn' ? 'শুধুমাত্র চলতি ও আসন্ন ইভেন্টের লাইভ তথ্য' : 'Live Analytics for Upcoming Events Only'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white mt-1">
              {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড ওভারভিউ' : 'Admin Dashboard Overview'}
            </h1>
            <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] mt-1 font-semibold max-w-2xl">
              {lang === 'bn'
                ? 'আসন্ন সকল অনুষ্ঠান ও টুর্নামেন্টের নির্দিষ্ট নাম অনুযায়ী দল নিবন্ধন, যাচাইকরণ এবং লাইভ রেভিনিউ ট্র্যাকিং।'
                : 'Real-time overview and team registration tracking for upcoming events and tournaments in Iswampur.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleSyncFirebase}
              disabled={syncing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#071333] hover:border-[#F26522] text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              title={lang === 'bn' ? 'ফায়ারবেস ডেটা সিঙ্ক করুন' : 'Sync Firebase Data'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F26522] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'ডেটা সিঙ্ক' : 'Sync Data')}</span>
            </button>

            <Link
              href="/admin/events"
              className="px-4 py-2 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-[#F26522]/20 uppercase tracking-wider transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন ইভেন্ট' : 'New Event'}</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar (Year, Month, Event Name & Search) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#F26522]" />
              <span className="font-black text-xs uppercase tracking-wider text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'আসন্ন অনুষ্ঠান ফিল্টার ও নির্বাচন' : 'Upcoming Events Filter'}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ফিল্টার রিসেট' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Specific Event Name Selector */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#F26522]" />
                <span>{lang === 'bn' ? 'নির্দিষ্ট অনুষ্ঠানের নাম (Event Name)' : 'Select Event by Name'}</span>
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-50 dark:bg-[#071333] text-slate-800 dark:text-white font-bold text-xs focus:border-[#F26522]"
              >
                <option value="ALL">
                  {lang === 'bn' ? 'সকল আসন্ন অনুষ্ঠান (All Upcoming Events)' : 'All Upcoming Events'}
                </option>
                {allUpcomingEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {lang === 'bn' ? ev.title.bn : ev.title.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'bn' ? 'বছর (Year)' : 'Select Year'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth('ALL');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-50 dark:bg-[#071333] text-slate-800 dark:text-white font-bold text-xs focus:border-[#F26522]"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল বছর (All Years)' : 'All Years'}</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'bn' ? 'মাস (Month)' : 'Select Month'}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1d3575] bg-slate-50 dark:bg-[#071333] text-slate-800 dark:text-white font-bold text-xs focus:border-[#F26522]"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল মাস (All Months)' : 'All Months'}</option>
                {availableMonths.map((mKey) => (
                  <option key={mKey} value={mKey}>
                    {monthLabels[mKey] ? (lang === 'bn' ? monthLabels[mKey].bn : monthLabels[mKey].en) : mKey}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 1. UPCOMING EVENTS KPI CARDS (Only Upcoming Events Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Teams in Upcoming Events */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'আসন্ন দলের আবেদন' : 'Upcoming Teams'}
              </span>
              <Users className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
            </div>
            <p className="text-3xl font-black text-[#08143A] dark:text-white">
              {upcomingMetrics.totalTeams}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{lang === 'bn' ? `${upcomingMetrics.totalEvents}টি আসন্ন অনুষ্ঠানে` : `In ${upcomingMetrics.totalEvents} Upcoming Events`}</span>
              <span className="font-bold text-emerald-500">
                {selectedEventId !== 'ALL' ? (lang === 'bn' ? 'নির্দিষ্ট ইভেন্ট' : 'Selected Event') : (lang === 'bn' ? 'চলতি তালিকা' : 'Active Scope')}
              </span>
            </p>
          </div>

          {/* Card 2: Pending Reviews in Upcoming Events */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#F26522] dark:text-[#F9A01B]">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'যাচাইনাধীন আবেদন' : 'Pending Review'}
              </span>
              <div className="flex items-center gap-1.5">
                {upcomingMetrics.pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#F26522] animate-ping" />
                )}
                <Clock className="w-5 h-5 text-[#F26522]" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#F26522] dark:text-[#F9A01B]">
              {upcomingMetrics.pendingCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{lang === 'bn' ? 'পর্যালোচনার অপেক্ষায় রয়েছে' : 'Awaiting Reviewer Action'}</span>
              {upcomingMetrics.pendingCount > 0 && (
                <Link
                  href={`/admin/registrations?status=PENDING_REVIEW${selectedEventId !== 'ALL' ? `&eventId=${selectedEventId}` : ''}`}
                  className="text-[11px] font-bold text-[#F26522] hover:underline"
                >
                  {lang === 'bn' ? 'দেখুন →' : 'Review →'}
                </Link>
              )}
            </p>
          </div>

          {/* Card 3: Approved Squads in Upcoming Events */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'অনুমোদিত দল ও পাস' : 'Approved Squads'}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-500">
              {upcomingMetrics.approvedCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              {lang === 'bn' ? 'পাস প্রস্তুত ও টিম কনফার্মড' : 'Confirmed Team Passes'}
            </p>
          </div>

          {/* Card 4: Total Revenue in Upcoming Events */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#19398A] dark:text-[#00A3E0]">
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'bn' ? 'সংগৃহীত নিবন্ধন ফি' : 'Upcoming Revenue'}
              </span>
              <IndianRupee className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
            </div>
            <p className="text-3xl font-black text-[#19398A] dark:text-[#00A3E0]">
              ₹{upcomingMetrics.totalRevenue}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              {lang === 'bn' ? 'আসন্ন ইভেন্ট ফি ভেরিফাইড' : 'From Verified Payments'}
            </p>
          </div>
        </div>

        {/* 2. ADMIN SHORTCUTS TOOLBAR (Right Below Top KPI Cards as Requested) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs sm:text-sm text-[#08143A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F26522]" />
              <span>{lang === 'bn' ? 'অ্যাডমিন শর্টকাট ও জরুরি পদক্ষেপ' : 'Admin Shortcuts & Quick Actions'}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {lang === 'bn' ? 'জরুরি ম্যানেজমেন্ট টুলস' : 'Quick Management Tools'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/registrations${upcomingMetrics.pendingCount > 0 ? '?status=PENDING_REVIEW' : ''}${selectedEventId !== 'ALL' ? `${upcomingMetrics.pendingCount > 0 ? '&' : '?'}eventId=${selectedEventId}` : ''}`}
              className="px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-2 shadow-md shadow-[#F26522]/20 uppercase tracking-wider transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>
                {lang === 'bn'
                  ? `নিবন্ধন পর্যালোচনা করুন (${upcomingMetrics.pendingCount})`
                  : `Review Registrations (${upcomingMetrics.pendingCount})`}
              </span>
            </Link>

            <Link
              href="/admin/events"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#071333] dark:hover:bg-[#0d1f4d] text-slate-800 dark:text-slate-100 flex items-center gap-2 border border-slate-200 dark:border-[#1d3575] dark:hover:border-[#F26522]/60 transition-all hover:scale-[1.02] shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#F26522]" />
              <span>{lang === 'bn' ? 'নতুন অনুষ্ঠান তৈরি করুন' : 'Create New Event'}</span>
            </Link>

            <Link
              href="/admin/checkin"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#071333] dark:hover:bg-[#0d1f4d] text-slate-800 dark:text-slate-100 flex items-center gap-2 border border-slate-200 dark:border-[#1d3575] dark:hover:border-[#00A3E0]/60 transition-all hover:scale-[1.02] shadow-xs"
            >
              <QrCode className="w-4 h-4 text-[#00A3E0]" />
              <span>{lang === 'bn' ? 'মাঠে কিউআর স্ক্যান করুন' : 'Matchday QR Scanner'}</span>
            </Link>

            <Link
              href="/admin/form-builder"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#071333] dark:hover:bg-[#0d1f4d] text-slate-800 dark:text-slate-100 flex items-center gap-2 border border-slate-200 dark:border-[#1d3575] dark:hover:border-[#F26522]/60 transition-all hover:scale-[1.02] shadow-xs"
            >
              <Layers className="w-4 h-4 text-[#F26522]" />
              <span>{lang === 'bn' ? 'ফর্ম বিল্ডার' : 'Form Builder'}</span>
            </Link>
          </div>
        </div>

        {/* 3. ACTIVE & UPCOMING EVENTS DETAILS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'আসন্ন অনুষ্ঠানসমূহ ও লাইভ নিবন্ধন' : 'Upcoming Events & Live Registration'}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredUpcomingEvents.length} {lang === 'bn' ? 'টি আসন্ন অনুষ্ঠান সক্রিয়' : 'Upcoming Events Active'}
            </span>
          </div>

          {filteredUpcomingEvents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] text-slate-500">
              <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="font-bold text-sm">
                {lang === 'bn' ? 'নির্বাচিত ফিল্টারে কোনো আসন্ন ইভেন্ট পাওয়া যায়নি।' : 'No upcoming events found for selected filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredUpcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-3xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Banner Image */}
                    <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={ev.coverImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'}
                        alt={ev.title.en}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#08143a] via-[#08143a]/40 to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        {ev.registrationEnabled ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            {lang === 'bn' ? 'নিবন্ধন চলছে' : 'Reg Open'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#19398A] text-white shadow-md">
                            {lang === 'bn' ? 'আসন্ন অনুষ্ঠান' : 'Upcoming'}
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#F9A01B] border border-white/10">
                          {ev.category === 'cricket'
                            ? (lang === 'bn' ? 'ক্রিকেট' : 'Cricket')
                            : ev.category === 'sports'
                            ? (lang === 'bn' ? 'ফুটবল / স্পোর্টস' : 'Sports')
                            : (lang === 'bn' ? 'সাংস্কৃতিক' : 'Cultural')}
                        </span>
                      </div>

                      <div className="absolute top-3.5 right-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
                          {formatEventPeriod(ev.startDate)}
                        </span>
                      </div>

                      {/* Event Title on Image */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-md truncate">
                          {lang === 'bn' ? ev.title.bn : ev.title.en}
                        </h3>
                        <p className="text-xs text-slate-200 font-semibold truncate drop-shadow">
                          📍 {lang === 'bn' ? ev.venue.bn : ev.venue.en} • 📅 {ev.startDate}
                        </p>
                      </div>
                    </div>

                    {/* Progress & Dynamic Metrics Body */}
                    <div className="p-5 space-y-4">
                      {/* Capacity Meter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">
                            {lang === 'bn' ? 'টিম ক্যাপাসিটি পূরণ:' : 'Team Capacity Filled:'}
                          </span>
                          <span className="text-[#08143A] dark:text-white font-black">
                            {ev.approvedCount} / {ev.maxTeams} {lang === 'bn' ? 'দল' : 'Teams'} ({ev.capacityPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#071333] overflow-hidden border border-slate-200 dark:border-[#1d3575]">
                          <div
                            className="h-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0] transition-all duration-500 rounded-full"
                            style={{ width: `${Math.max(5, ev.capacityPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* 4 Metrics Pill Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {lang === 'bn' ? 'মোট আবেদন' : 'Applied'}
                          </p>
                          <p className="text-base font-black text-[#08143A] dark:text-white mt-0.5">
                            {ev.totalTeams}
                          </p>
                        </div>

                        <div className={`p-2.5 rounded-xl border ${
                          ev.pendingCount > 0
                            ? 'bg-[#F26522]/10 border-[#F26522]/30 text-[#F26522]'
                            : 'bg-slate-50 dark:bg-[#071333] border-slate-200 dark:border-[#1d3575]'
                        }`}>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {lang === 'bn' ? 'যাচাইনাধীন' : 'Pending'}
                          </p>
                          <p className={`text-base font-black mt-0.5 ${ev.pendingCount > 0 ? 'text-[#F26522]' : 'text-slate-700 dark:text-white'}`}>
                            {ev.pendingCount}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {lang === 'bn' ? 'অনুমোদিত' : 'Approved'}
                          </p>
                          <p className="text-base font-black text-emerald-500 mt-0.5">
                            {ev.approvedCount}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {lang === 'bn' ? 'সংগ্রহ' : 'Revenue'}
                          </p>
                          <p className="text-base font-black text-[#19398A] dark:text-[#00A3E0] mt-0.5">
                            ₹{ev.revenue}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-4 bg-slate-50/70 dark:bg-[#071333]/60 border-t border-slate-200 dark:border-[#1d3575] flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/registrations?eventId=${ev.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'bn'
                          ? `দলসমূহ পর্যালোচনা (${ev.totalTeams})`
                          : `Review Teams (${ev.totalTeams})`}
                      </span>
                    </Link>

                    <Link
                      href="/admin/events"
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] hover:border-[#F26522] transition-colors flex items-center gap-1"
                    >
                      <span>{lang === 'bn' ? 'ইভেন্ট সম্পাদন' : 'Edit Event'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. RECENT TEAM REGISTRATIONS STREAM */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] p-5 sm:p-6 space-y-4 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'সাম্প্রতিক দল নিবন্ধন তালিকা' : 'Recent Team Registrations Stream'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'আসন্ন অনুষ্ঠানসমূহে সর্বশেষ জমাকৃত দল ও আবেদনকারীদের তালিকা' : 'Latest teams registered for upcoming events'}
              </p>
            </div>

            <Link
              href="/admin/registrations"
              className="text-xs font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] flex items-center gap-1"
            >
              <span>{lang === 'bn' ? 'সকল দেখুন' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#071333] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">{lang === 'bn' ? 'দলের নাম ও ইভেন্ট' : 'Team & Event'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'দল প্রতিনিধি' : 'Representative'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'তারিখ' : 'Submitted At'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-3.5 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d3575]">
                {registrations
                  .filter((r) => {
                    const ev = events.find((e) => e.id === r.eventId);
                    // Show only registrations of upcoming events in recent stream
                    return ev ? ev.registrationEnabled || !ev.endDate || new Date(ev.endDate) >= new Date() : true;
                  })
                  .slice(0, 6)
                  .map((reg) => {
                    const ev = events.find((e) => e.id === reg.eventId);
                    const evName = ev ? (lang === 'bn' ? ev.title.bn : ev.title.en) : reg.eventId;

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-[#0a1945] transition-colors">
                        <td className="p-3.5">
                          <p className="font-black text-[#08143A] dark:text-white">{reg.team.name}</p>
                          <span className="inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded font-black bg-[#19398A]/10 text-[#19398A] dark:bg-[#19398A]/30 dark:text-[#00A3E0] truncate max-w-[180px]">
                            {evName}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                          {reg.team.representativeName}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#08143A] dark:text-white">
                          {reg.team.phone}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              reg.status === 'APPROVED'
                                ? 'bg-emerald-500 text-white'
                                : reg.status === 'REJECTED'
                                ? 'bg-rose-600 text-white'
                                : reg.status === 'CORRECTION_REQUIRED'
                                ? 'bg-[#F26522] text-white'
                                : 'bg-[#19398A] text-white'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/admin/registrations?id=${reg.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-black border border-slate-200 dark:border-[#1d3575] hover:border-[#F26522] bg-white dark:bg-[#071333] text-[#08143A] dark:text-white hover:text-[#F26522] transition-colors"
                          >
                            {lang === 'bn' ? 'পর্যালোচনা' : 'Review'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. BOTTOM SECTION: PREVIOUS & COMPLETED EVENTS ARCHIVE (Completely Separate Section) */}
        <div className="rounded-3xl bg-slate-50/70 dark:bg-[#071333]/40 border border-slate-200 dark:border-[#1d3575] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#19398A] dark:text-[#00A3E0]" />
                <h3 className="text-base sm:text-lg font-black text-[#08143A] dark:text-white">
                  {lang === 'bn'
                    ? 'পূর্ববর্তী সম্পন্ন অনুষ্ঠানসমূহের আর্কাইভ (Previous Events Archive)'
                    : 'Previous & Completed Events Archive'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-[#0c1a40] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1d3575]">
                  {pastEvents.length} {lang === 'bn' ? 'টি সম্পন্ন' : 'Completed'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'বিগত মাস ও বছরগুলোতে আয়োজিত সকল টুর্নামেন্ট, ম্যাচ এবং সাংস্কৃতিক উৎসবের সম্পূর্ণ আলাদা ঐতিহাসিক রেকর্ড।'
                  : 'Historical records of completed tournaments from earlier months, completely segregated from active operations.'}
              </p>
            </div>

            {/* Toggle View All Past Events Button */}
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="px-4 py-2 rounded-xl text-xs font-black border border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] hover:border-[#F26522] text-[#08143A] dark:text-white flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#F26522]" />
              <span>
                {showPastEvents
                  ? (lang === 'bn' ? 'সংকুচিত করুন' : 'Hide Past Events')
                  : (lang === 'bn' ? `পূর্ববর্তী সম্পন্ন ইভেন্ট দেখুন (${pastEvents.length})` : `View Completed Events (${pastEvents.length})`)}
              </span>
              {showPastEvents ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Past Events Section Content (Expandable) */}
          {showPastEvents && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Separate Mini KPI Strip for Past Events */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'bn' ? 'সম্পন্ন ইভেন্ট' : 'Completed Events'}</p>
                    <p className="text-xl font-black text-[#08143A] dark:text-white">{pastMetrics.totalPastEvents}</p>
                  </div>
                  <Trophy className="w-5 h-5 text-[#F9A01B]" />
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'bn' ? 'মোট অংশগ্রহণকারী দল' : 'Total Past Teams'}</p>
                    <p className="text-xl font-black text-emerald-500">{pastMetrics.totalTeams}</p>
                  </div>
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{lang === 'bn' ? 'সংগৃহীত মোট ফি' : 'Total Revenue Collected'}</p>
                    <p className="text-xl font-black text-[#19398A] dark:text-[#00A3E0]">₹{pastMetrics.totalRevenue}</p>
                  </div>
                  <IndianRupee className="w-5 h-5 text-[#19398A] dark:text-[#00A3E0]" />
                </div>
              </div>

              {/* Past Events Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((pev) => (
                  <div
                    key={pev.id}
                    className="rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] overflow-hidden flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs"
                  >
                    <div>
                      {/* Cover image */}
                      <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={pev.coverImage || 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80'}
                          alt={pev.title.en}
                          fill
                          unoptimized
                          className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800/90 text-slate-200 border border-slate-600">
                            ✓ {lang === 'bn' ? 'সম্পন্ন' : 'COMPLETED'}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-black/60 text-white backdrop-blur-xs">
                            {formatEventPeriod(pev.startDate)}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-sm font-black text-white truncate drop-shadow">
                            {lang === 'bn' ? pev.title.bn : pev.title.en}
                          </p>
                        </div>
                      </div>

                      {/* Past Stats Body */}
                      <div className="p-3.5 space-y-2.5">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                          📍 {lang === 'bn' ? pev.venue.bn : pev.venue.en}
                        </p>

                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                            <p className="text-[9px] font-bold text-slate-400">
                              {lang === 'bn' ? 'অংশগ্রহণকারী' : 'Teams'}
                            </p>
                            <p className="text-xs font-black text-slate-800 dark:text-white">
                              {pev.totalTeams}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                            <p className="text-[9px] font-bold text-slate-400">
                              {lang === 'bn' ? 'অনুমোদিত' : 'Approved'}
                            </p>
                            <p className="text-xs font-black text-emerald-500">
                              {pev.approvedCount}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575]">
                            <p className="text-[9px] font-bold text-slate-400">
                              {lang === 'bn' ? 'রাজস্ব' : 'Revenue'}
                            </p>
                            <p className="text-xs font-black text-[#00A3E0]">
                              ₹{pev.revenue}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Past Records Link */}
                    <div className="p-3 border-t border-slate-200 dark:border-[#1d3575] bg-slate-50/50 dark:bg-[#071333]/50 flex items-center justify-between">
                      <Link
                        href={`/admin/registrations?eventId=${pev.id}`}
                        className="text-xs font-bold text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] flex items-center gap-1"
                      >
                        <span>{lang === 'bn' ? 'দল ও নথি রেকর্ড দেখুন' : 'View Team Records'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
