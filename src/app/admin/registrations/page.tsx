'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import { TeamRegistration } from '@/types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  ExternalLink,
  Loader2,
  ChevronDown,
  Calendar,
  Check,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function RegistrationsReviewContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  const eventIdParam = searchParams.get('eventId');
  const statusParam = searchParams.get('status');

  const { lang, t } = useLanguage();
  const toast = useToast();
  const { user, hasPermission } = useAuth();
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState(statusParam || 'ALL');
  const [eventFilter, setEventFilter] = useState(eventIdParam || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Event Dropdown Search & Combobox State
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  // Review Modal State
  const [selectedReg, setSelectedReg] = useState<TeamRegistration | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'CORRECTION_REQUIRED' | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadRegistrations = async () => {
    try {
      const [res, evRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/events'),
      ]);
      if (res.ok) {
        const data: TeamRegistration[] = await res.json();
        setRegistrations(data);
        if (highlightId) {
          const found = data.find((r) => r.id === highlightId);
          if (found) setSelectedReg(found);
        }
      }
      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(evData);
        // By default, select an active event if not specified in URL query params
        if (!eventIdParam) {
          const firstActive = evData.find((e: any) => e.registrationEnabled);
          if (firstActive) {
            setEventFilter((prev) => (prev === 'ALL' ? firstActive.id : prev));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventIdParam) {
      setEventFilter(eventIdParam);
    }
  }, [eventIdParam]);

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    loadRegistrations();
  }, [highlightId]);

  // Click outside to close custom event dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setEventDropdownOpen(false);
      }
    }
    if (eventDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [eventDropdownOpen]);

  // Sort and filter events: Active registrations at the TOP with badge, followed by others, searchable
  const { activeEvents, otherEvents, selectedEventObj } = useMemo(() => {
    const q = eventSearchQuery.toLowerCase().trim();

    const matchesSearch = (ev: any) => {
      if (!q) return true;
      const titleBn = ev.title?.bn?.toLowerCase() || '';
      const titleEn = ev.title?.en?.toLowerCase() || '';
      const venueBn = ev.venue?.bn?.toLowerCase() || '';
      const venueEn = ev.venue?.en?.toLowerCase() || '';
      return titleBn.includes(q) || titleEn.includes(q) || venueBn.includes(q) || venueEn.includes(q);
    };

    const active = events.filter((e) => e.registrationEnabled && matchesSearch(e));
    const others = events.filter((e) => !e.registrationEnabled && matchesSearch(e));
    const selected = events.find((e) => e.id === eventFilter);

    return {
      activeEvents: active,
      otherEvents: others,
      selectedEventObj: selected,
    };
  }, [events, eventFilter, eventSearchQuery]);

  const getEventRegCount = (eventId: string) => {
    return registrations.filter((r) => r.eventId === eventId).length;
  };

  // 1-Click Approve & Issue Pass (Predefined approval note, dispatches email & pass automatically)
  const handleApproveDirectly = async () => {
    if (!selectedReg || processing) return;

    setProcessing(true);
    setActionSuccessMsg('');

    const defaultApprovalNote =
      lang === 'bn'
        ? 'পেমেন্ট ও খেলোয়াড় তালিকা যাচাইপূর্বক স্কোয়াড সফলভাবে অনুমোদন করা হয়েছে। অফিসিয়াল ডিজিটাল ম্যাচডে টিম পাস ইস্যু করা হলো।'
        : 'Payment verified and squad roster accepted. Official digital matchday team pass issued.';

    try {
      const res = await fetch(`/api/registrations/${selectedReg.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          reason: defaultApprovalNote,
          actorEmail: user?.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || (lang === 'bn' ? 'অনুমোদন ব্যর্থ হয়েছে' : 'Approval failed'));

      const successMsg =
        lang === 'bn'
          ? `✓ "${selectedReg.team.name}" দল অনুমোদিত হয়েছে এবং অফিসিয়াল টিম পাস (${resData.humanPassCode}) ইমেইলে পাঠিয়ে দেওয়া হয়েছে!`
          : `✓ Squad "${selectedReg.team.name}" approved! Digital Team Pass (${resData.humanPassCode}) issued and emailed.`;

      setActionSuccessMsg(successMsg);
      toast.success(successMsg);

      await loadRegistrations();
      setSelectedReg(null);
      setReviewAction(null);
      setReviewReason('');
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedReg || !reviewAction) return;

    if ((reviewAction === 'REJECT' || reviewAction === 'CORRECTION_REQUIRED') && !reviewReason.trim()) {
      toast.warning(
        lang === 'bn'
          ? 'প্রত্যাখ্যান বা সংশোধনের জন্য কারণ উল্লেখ করা বাধ্যতামূলক।'
          : 'Please provide a reason for rejection or correction.'
      );
      return;
    }

    setProcessing(true);
    setActionSuccessMsg('');

    try {
      const res = await fetch(`/api/registrations/${selectedReg.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reviewAction,
          reason: reviewReason.trim(),
          actorEmail: user?.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || (lang === 'bn' ? 'পর্যালোচনা ব্যর্থ হয়েছে' : 'Review action failed'));

      const successMsg =
        reviewAction === 'APPROVE'
          ? (lang === 'bn'
            ? `✓ দলটি অনুমোদিত হয়েছে এবং ডিজিটাল টিম পাস (${resData.humanPassCode}) ইমেইলে প্রেরিত হয়েছে!`
            : `✓ Squad approved! Digital Team Pass (${resData.humanPassCode}) issued and emailed.`)
          : (lang === 'bn'
            ? `✓ দলের অবস্থা পরিবর্তন করা হয়েছে (${resData.status}) এবং ইমেইল নোটিফিকেশন পাঠানো হয়েছে।`
            : `✓ Registration status updated (${resData.status}) and email notification dispatched.`);

      setActionSuccessMsg(successMsg);
      toast.success(successMsg);

      // Refresh list
      await loadRegistrations();
      setSelectedReg(null);
      setReviewAction(null);
      setReviewReason('');
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    const headers = ['Registration ID', 'Team Name', 'Representative', 'Email', 'Phone', 'Members Count', 'UTR', 'Status', 'Pass Code'];
    const rows = registrations.map((r) => [
      r.id,
      `"${r.team.name.replace(/"/g, '""')}"`,
      `"${r.team.representativeName.replace(/"/g, '""')}"`,
      r.team.email,
      r.team.phone,
      r.team.members.length,
      r.payment.utr || '',
      r.status,
      r.humanPassCode || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Iswampur_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = registrations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesEvent = eventFilter === 'ALL' || r.eventId === eventFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.team.name.toLowerCase().includes(q) ||
      r.team.representativeName.toLowerCase().includes(q) ||
      r.team.phone.includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.payment.utr && r.payment.utr.toLowerCase().includes(q));
    return matchesStatus && matchesEvent && matchesSearch;
  });

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'ALL':
        return lang === 'bn' ? 'সকল অবস্থা' : 'All Status';
      case 'PENDING_REVIEW':
        return lang === 'bn' ? 'যাচাইনাধীন' : 'Pending';
      case 'APPROVED':
        return lang === 'bn' ? 'অনুমোদিত' : 'Approved';
      case 'CORRECTION_REQUIRED':
        return lang === 'bn' ? 'সংশোধন প্রয়োজন' : 'Correction Needed';
      case 'REJECTED':
        return lang === 'bn' ? 'বাতিল' : 'Rejected';
      default:
        return st;
    }
  };

  const getEventName = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return eventId === 'event-ipl-2026' ? 'IPL 2026' : eventId;
    return lang === 'bn' ? ev.title.bn : ev.title.en;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
            {lang === 'bn' ? 'দল নিবন্ধন ও পেমেন্ট পর্যালোচনা' : 'Team Registrations & Payment Review'}
          </h1>
          <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] mt-1 font-semibold">
            {lang === 'bn'
              ? 'আবেদনসমূহের পেমেন্ট স্ক্রিনশট, খেলোয়াড় তালিকা যাচাই এবং অনুমোদন / বাতিলকরণ।'
              : 'Review submitted payment screenshots, squad rosters, and approve or reject submissions.'}
          </p>
        </div>

        {hasPermission('registrations.export') && (
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-white hover:border-[#F26522] flex items-center gap-2 shadow-xs shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'bn' ? 'CSV এক্সপোর্ট করুন' : 'Export CSV'}</span>
          </button>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex flex-col lg:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'দলের নাম, মোবাইল বা UTR...' : 'Search squad, phone or UTR...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-xs focus:border-[#F26522]"
            />
          </div>

          {/* Custom Searchable Event Combobox with Active Events on Top & Active Badges */}
          <div className="relative w-full sm:w-auto" ref={eventDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setEventDropdownOpen(!eventDropdownOpen);
                if (!eventDropdownOpen) setEventSearchQuery('');
              }}
              className="w-full sm:w-auto min-w-[210px] max-w-full sm:max-w-[320px] px-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-bold text-xs flex items-center justify-between gap-2 hover:border-[#19398A] dark:hover:border-cyan-400/50 transition-all shadow-xs text-left"
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <Calendar className="w-3.5 h-3.5 text-[#19398A] dark:text-cyan-400 shrink-0" />
                <span className="truncate">
                  {selectedEventObj
                    ? (lang === 'bn' ? selectedEventObj.title.bn : selectedEventObj.title.en)
                    : (lang === 'bn' ? 'সকল ইভেন্ট / অনুষ্ঠান' : 'All Events')}
                </span>
                {selectedEventObj?.registrationEnabled && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {eventFilter !== 'ALL' && (
                  <span
                    role="button"
                    title={lang === 'bn' ? 'ফিল্টার মুছুন' : 'Clear filter'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventFilter('ALL');
                    }}
                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    eventDropdownOpen ? 'rotate-180 text-[#19398A] dark:text-cyan-400' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Popover */}
            {eventDropdownOpen && (
              <div className="absolute left-0 sm:left-0 mt-1.5 w-full sm:w-[350px] max-w-[95vw] bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Search Input Inside Dropdown */}
                <div className="p-2.5 border-b border-[#cbd9ec] dark:border-[#1d3575] bg-[#f8fafc] dark:bg-[#071333]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'ইভেন্টের নাম দিয়ে খুঁজুন...' : 'Search event by name...'}
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-[#cbd9ec] dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] text-[#08143A] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#19398A] dark:focus:border-cyan-400"
                    />
                    {eventSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEventSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Options List */}
                <div className="max-h-[300px] overflow-y-auto divide-y divide-[#edf2f9] dark:divide-[#12234e] text-xs">
                  {/* All Events Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setEventFilter('ALL');
                      setEventDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors ${
                      eventFilter === 'ALL'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-[#19398A] dark:text-cyan-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-[#112766] text-[#08143A] dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="font-bold">{lang === 'bn' ? 'সকল ইভেন্ট / অনুষ্ঠান' : 'All Events'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                        {registrations.length} {lang === 'bn' ? 'দল' : 'teams'}
                      </span>
                      {eventFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-[#19398A] dark:text-cyan-400" />}
                    </div>
                  </button>

                  {/* Active Events Section (TOP) */}
                  {activeEvents.length > 0 && (
                    <div className="p-1">
                      <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 rounded flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{lang === 'bn' ? 'চলমান রেজিস্ট্রেশন (Active)' : 'Active Registrations (Top)'}</span>
                        <span className="ml-auto text-[10px] font-bold">({activeEvents.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {activeEvents.map((ev) => {
                          const isSelected = eventFilter === ev.id;
                          const regCount = getEventRegCount(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                setEventFilter(ev.id);
                                setEventDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-[#112766] text-[#08143A] dark:text-slate-200'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-semibold text-xs">
                                    {lang === 'bn' ? ev.title.bn : ev.title.en}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0">
                                    Active
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {ev.venue ? (lang === 'bn' ? ev.venue.bn : ev.venue.en) : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                  {regCount} {lang === 'bn' ? 'দল' : 'teams'}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Other / Completed Events Section */}
                  {otherEvents.length > 0 && (
                    <div className="p-1">
                      <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/40 rounded flex items-center gap-1.5">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        <span>{lang === 'bn' ? 'অন্যান্য ও অতীত ইভেন্ট' : 'Other / Past Events'}</span>
                        <span className="ml-auto text-[10px] font-bold">({otherEvents.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {otherEvents.map((ev) => {
                          const isSelected = eventFilter === ev.id;
                          const regCount = getEventRegCount(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                setEventFilter(ev.id);
                                setEventDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-colors ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#19398A] dark:text-cyan-300 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-[#112766] text-[#08143A] dark:text-slate-200'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-medium text-xs">
                                    {lang === 'bn' ? ev.title.bn : ev.title.en}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                                    {lang === 'bn' ? 'সমাপ্ত' : 'Closed'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {ev.venue ? (lang === 'bn' ? ev.venue.bn : ev.venue.en) : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                  {regCount} {lang === 'bn' ? 'দল' : 'teams'}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#19398A] dark:text-cyan-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty Search Result */}
                  {activeEvents.length === 0 && otherEvents.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'bn'
                        ? `"${eventSearchQuery}" নামে কোনো ইভেন্ট পাওয়া যায়নি`
                        : `No events found matching "${eventSearchQuery}"`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <Filter className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 mr-1" />
          {['ALL', 'PENDING_REVIEW', 'APPROVED', 'CORRECTION_REQUIRED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-black shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-[#19398A] text-white shadow-xs'
                  : 'bg-[#e6eef8] dark:bg-[#112766] text-[#273656] dark:text-[#CBD5E1] hover:text-[#08143A] dark:hover:text-white'
              }`}
            >
              {getStatusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4fa] dark:bg-[#071333] text-[#64748B] dark:text-[#94A3B8] font-black uppercase">
              <tr>
                <th className="p-3.5">{lang === 'bn' ? 'দলের নাম ও ইভেন্ট' : 'Team & Event'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'দল প্রতিনিধি' : 'Representative'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'মোবাইল' : 'Phone'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'সদস্য' : 'Players'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'UTR / ফি' : 'UTR / Fee'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'বর্তমান অবস্থা' : 'Status'}</th>
                <th className="p-3.5 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd9ec] dark:divide-[#1d3575]">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#f0f4fa] dark:hover:bg-[#0a1945]">
                  <td className="p-3.5">
                    <p className="font-black text-[#08143A] dark:text-white">{reg.team.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">{reg.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-[#19398A]/10 text-[#19398A] dark:bg-[#19398A]/30 dark:text-[#00A3E0] truncate max-w-[160px]">
                        {getEventName(reg.eventId)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#273656] dark:text-[#CBD5E1] font-semibold">
                    {reg.team.representativeName}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#08143A] dark:text-white">{reg.team.phone}</td>
                  <td className="p-3.5 font-bold text-[#19398A] dark:text-[#00A3E0]">
                    {reg.team.members.length} {lang === 'bn' ? 'জন' : 'Players'}
                  </td>
                  <td className="p-3.5">
                    <p className="font-black text-[#08143A] dark:text-white">₹{reg.payment.amount}</p>
                    <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px]">
                      {reg.payment.utr || 'N/A'}
                    </p>
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
                    <button
                      onClick={() => setSelectedReg(reg)}
                      className="px-3 py-1.5 rounded-lg font-black text-xs bg-[#e6eef8] dark:bg-[#112766] text-[#08143A] dark:text-white hover:bg-[#F26522] hover:text-white transition-colors"
                    >
                      {lang === 'bn' ? 'পর্যালোচনা' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Review Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1a40] rounded-3xl border border-[#cbd9ec] dark:border-[#1d3575] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#e6eef8] dark:bg-[#112766] text-[#19398A] dark:text-[#00A3E0]">
                  {selectedReg.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#08143A] dark:text-white mt-1">
                  {selectedReg.team.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-2 text-[#64748B] hover:text-[#08143A] dark:hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Info & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1.5">
                <p className="text-[#F26522] uppercase font-black">
                  {lang === 'bn' ? 'দল ও প্রতিনিধি তথ্য' : 'SQUAD & CONTACT INFO'}
                </p>
                <p><strong>{lang === 'bn' ? 'প্রতিনিধি:' : 'Representative:'}</strong> {selectedReg.team.representativeName}</p>
                <p><strong>{lang === 'bn' ? 'ঠিকানা:' : 'Address:'}</strong> {selectedReg.team.address}</p>
                <p><strong>{lang === 'bn' ? 'মোবাইল:' : 'Phone:'}</strong> {selectedReg.team.phone}</p>
                <p><strong>{lang === 'bn' ? 'জরুরি নম্বর:' : 'Emergency:'}</strong> {selectedReg.team.emergencyPhone || 'N/A'}</p>
                <p><strong>{lang === 'bn' ? 'ইমেইল:' : 'Email:'}</strong> {selectedReg.team.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-1.5">
                <p className="text-[#19398A] dark:text-[#00A3E0] uppercase font-black">
                  {lang === 'bn' ? 'পেমেন্ট বিবরণ' : 'PAYMENT DETAILS'}
                </p>
                <p><strong>{lang === 'bn' ? 'ফি:' : 'Fee:'}</strong> ₹{selectedReg.payment.amount}</p>
                <p><strong>{lang === 'bn' ? 'UTR:' : 'UTR / Txn ID:'}</strong> {selectedReg.payment.utr || 'N/A'}</p>
                <p suppressHydrationWarning><strong>{lang === 'bn' ? 'জমার সময়:' : 'Submitted:'}</strong> {new Date(selectedReg.createdAt).toLocaleString()}</p>
                {selectedReg.humanPassCode && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#F9A01B] to-[#F26522] text-[#050D24] flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
                        {lang === 'bn' ? 'অফিসিয়াল পাস কোড (PASS CODE)' : 'OFFICIAL PASS CODE / ID'}
                      </span>
                      <span className="font-mono text-base font-black tracking-wider block select-all">
                        {selectedReg.humanPassCode}
                      </span>
                    </div>
                    {selectedReg.passId && (
                      <a
                        href={`/verify/${selectedReg.passId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#050D24] text-white text-xs font-bold hover:bg-[#112766] transition-colors"
                      >
                        {lang === 'bn' ? 'পাস দেখুন →' : 'View Pass →'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Screenshot */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'bn' ? 'পেমেন্ট স্ক্রিনশট:' : 'Payment Screenshot:'}
              </p>
              <div className="rounded-2xl overflow-hidden border border-[#cbd9ec] dark:border-[#1d3575] bg-[#050d24] p-2 text-center">
                <img
                  src={selectedReg.payment.screenshotUrl}
                  alt="Payment Screenshot"
                  className="max-h-72 object-contain mx-auto rounded-xl"
                />
                <a
                  href={selectedReg.payment.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F9A01B] hover:underline mt-2"
                >
                  <span>{lang === 'bn' ? 'নতুন ট্যাবে বড় করে দেখুন' : 'View Full Image'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Squad Players */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                {lang === 'bn' ? `খেলোয়াড় তালিকা (${selectedReg.team.members.length} জন):` : `Squad Roster (${selectedReg.team.members.length}):`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedReg.team.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-xs flex justify-between items-center"
                  >
                    <span className="font-semibold">{idx + 1}. {m.name}</span>
                    {m.role && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.role === 'captain' || idx === 0
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : m.role === 'vice_captain' || idx === 1
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                        }`}
                      >
                        {m.role === 'captain' || idx === 0
                          ? 'Captain (C)'
                          : m.role === 'vice_captain' || idx === 1
                          ? 'Vice-Cap (VC)'
                          : m.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Actions */}
            {hasPermission('registrations.review') && (
              <div className="pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-xs font-black uppercase text-[#64748B] dark:text-[#94A3B8]">
                    {lang === 'bn' ? 'পর্যালোচনা সিদ্ধান্ত গ্রহণ করুন:' : 'Take Review Decision:'}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'bn' ? '১-ক্লিকে স্বয়ংক্রিয় পাস তৈরি ও ইমেইল প্রেরণ' : '1-Click instant pass & email dispatch'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* 1-Click Instant Approve & Issue Pass (No extra input required, dispatches pass & email immediately) */}
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleApproveDirectly}
                    className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    {processing && !reviewAction ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'bn' ? 'পাস ইস্যু ও ইমেইল পাঠানো হচ্ছে...' : 'Issuing Pass & Sending Email...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'অনুমোদন ও পাস ইস্যু (১-ক্লিকে মেইল পাঠান)' : 'Approve & Issue Pass'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setReviewAction('CORRECTION_REQUIRED');
                      setReviewReason('');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      reviewAction === 'CORRECTION_REQUIRED'
                        ? 'bg-[#F26522] text-white shadow-md'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সংশোধন চান (Request Correction)' : 'Request Correction'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setReviewAction('REJECT');
                      setReviewReason('');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      reviewAction === 'REJECT'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বাতিল করুন (Reject)' : 'Reject Squad'}</span>
                  </button>
                </div>

                {/* Reason Input only shown for Correction or Rejection */}
                {reviewAction && (
                  <div className="p-4 rounded-2xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] space-y-3 animate-in fade-in">
                    <label className="block text-xs font-black text-[#08143A] dark:text-white">
                      {reviewAction === 'CORRECTION_REQUIRED'
                        ? (lang === 'bn' ? 'কী সংশোধন করতে হবে তা লিখুন (ইমেইলে পাঠানো হবে) *:' : 'Specify what needs correction (Emailed to Team) *:')
                        : (lang === 'bn' ? 'বাতিলের কারণ লিখুন (ইমেইলে পাঠানো হবে) *:' : 'Reason for rejection (Emailed to Team) *:')}
                    </label>
                    <textarea
                      rows={2}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder={
                        reviewAction === 'CORRECTION_REQUIRED'
                          ? (lang === 'bn' ? 'উদাঃ প্রেরিত স্ক্রিনশটে ট্রানজ্যাকশন আইডি অস্পষ্ট। পুনরায় সঠিক স্ক্রিনশট আপলোড করুন।' : 'e.g. Screenshot UTR is unreadable. Please re-upload with clear UTR.')
                          : (lang === 'bn' ? 'উদাঃ ভুয়া বা ত্রুটিযুক্ত পেমেন্ট রসিদ প্রদান করা হয়েছে।' : 'e.g. Invalid payment verification details.')
                      }
                      className="w-full p-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] text-[#08143A] dark:text-white font-semibold text-xs focus:border-[#F26522]"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewAction(null);
                          setReviewReason('');
                        }}
                        className="px-3 py-1.5 text-xs text-[#64748B] font-bold"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        disabled={processing}
                        onClick={handleReviewSubmit}
                        className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-60 text-white shadow-md uppercase tracking-wider flex items-center gap-1.5"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'}</span>
                          </>
                        ) : (
                          <span>{lang === 'bn' ? 'সিদ্ধান্ত পাঠান' : 'Submit & Send Email'}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationsReviewPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-center text-[#64748B]">Loading...</div>}>
        <RegistrationsReviewContent />
      </Suspense>
    </AdminLayout>
  );
}
