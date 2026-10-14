'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import { TeamPass, VillageEvent } from '@/types';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  Camera,
  CameraOff,
  Upload,
  Users,
  ShieldCheck,
  Clock,
  RefreshCw,
  XCircle,
  Sparkles,
  Loader2,
  Calendar,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { extractPassIdOrCode } from '@/lib/pass/utils';

export default function MatchdayCheckinPage() {
  const { user } = useAuth();
  const { lang, resolveBilingual } = useLanguage();
  const toast = useToast();

  const [passInput, setPassInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'manual'>('camera');
  const [result, setResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    message: string;
    pass?: TeamPass;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'pending' | 'entered'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingList, setPendingList] = useState<TeamPass[]>([]);
  const [enteredList, setEnteredList] = useState<TeamPass[]>([]);
  const [highlightedPassId, setHighlightedPassId] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(true);

  // Event Selection & Filter State
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  const scannerRef = useRef<any>(null);
  const qrRegionId = 'qr-reader-container';

  // Fetch pending and entered passes along with events
  const fetchData = async () => {
    setLoadingLists(true);
    try {
      const [res, evRes] = await Promise.all([
        fetch('/api/admin/checkin'),
        fetch('/api/events'),
      ]);
      if (res.ok) {
        const data = await res.json();
        setPendingList(data.pending || []);
        setEnteredList(data.entered || []);
      }
      if (evRes.ok) {
        const evData: VillageEvent[] = await evRes.json();
        setEvents(evData);
        // By default, select the first active event if currently ALL
        const firstActive = evData.find((e) => e.registrationEnabled);
        if (firstActive) {
          setEventFilter((prev) => (prev === 'ALL' ? firstActive.id : prev));
        }
      }
    } catch (err) {
      console.error('Failed to fetch checkin data:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Sort and filter events: ONLY active events (registrationEnabled: true) are shown for check-in
  const { activeEvents, selectedEventObj } = useMemo(() => {
    const q = eventSearchQuery.toLowerCase().trim();

    const matchesSearch = (ev: VillageEvent) => {
      if (!q) return true;
      const titleBn = ev.title?.bn?.toLowerCase() || '';
      const titleEn = ev.title?.en?.toLowerCase() || '';
      const venueBn = ev.venue?.bn?.toLowerCase() || '';
      const venueEn = ev.venue?.en?.toLowerCase() || '';
      return titleBn.includes(q) || titleEn.includes(q) || venueBn.includes(q) || venueEn.includes(q);
    };

    const active = events.filter((e) => e.registrationEnabled && matchesSearch(e));
    const selected = events.find((e) => e.id === eventFilter);

    return {
      activeEvents: active,
      selectedEventObj: selected,
    };
  }, [events, eventFilter, eventSearchQuery]);

  const getEventPassCount = (eventId: string) => {
    const pCount = pendingList.filter((p) => p.eventId === eventId).length;
    const eCount = enteredList.filter((p) => p.eventId === eventId).length;
    return { pending: pCount, entered: eCount, total: pCount + eCount };
  };

  // Initialize and manage camera QR scanner
  const startCameraScanner = async () => {
    if (scanning) return;
    try {
      if (scannerRef.current) {
        await stopCameraScanner();
      }

      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        () => {
          // Ignore non-matches
        }
      );
      setScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      await stopCameraScanner();
      toast.error(
        lang === 'bn'
          ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে। ক্যামেরা পারমিশন দেওয়া আছে কিনা দেখুন।'
          : 'Failed to access camera. Please allow camera permissions in your browser.'
      );
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch (err: any) {
        // Suppress transient play() interruption / clear errors
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        try {
          if (scanner.isScanning) {
            scanner.stop().catch(() => {});
          }
          scanner.clear();
        } catch {}
      }
    };
  }, []);

  // Process QR code (single-use scan)
  const handleScannedCode = async (rawCode: string) => {
    // If scanning was running, stop or pause briefly to avoid double-triggers
    if (scannerRef.current) {
      await stopCameraScanner();
    }

    const cleanCode = extractPassIdOrCode(rawCode);
    setPassInput(cleanCode);
    executeCheckin(cleanCode);
  };

  // Scan from file upload
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('file-qr-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      try {
        html5QrCode.clear();
      } catch {}
      handleScannedCode(decodedText);
    } catch (err) {
      console.error('File scan error:', err);
      setResult({
        success: false,
        message:
          lang === 'bn'
            ? 'ছবিতে কোনো বৈধ কিউআর কোড পাওয়া যায়নি। অনুগ্রহ করে পরিষ্কার ছবি নির্বাচন করুন।'
            : 'No valid QR code detected in this image. Please select a clearer image.',
      });
    } finally {
      // Clear input so same file can be re-scanned if desired
      e.target.value = '';
    }
  };

  const executeCheckin = async (code: string) => {
    const cleanCode = extractPassIdOrCode(code);
    if (!cleanCode) return;
    setPassInput(cleanCode);
    setChecking(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passCode: cleanCode,
          actorEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
        if (!data.alreadyCheckedIn && data.pass) {
          // Move from pending to entered list immediately at the top
          setPendingList((prev) => prev.filter((p) => p.passId !== data.pass.passId && p.humanPassCode !== data.pass.humanPassCode));
          setEnteredList((prev) => [data.pass, ...prev.filter((p) => p.passId !== data.pass.passId && p.humanPassCode !== data.pass.humanPassCode)]);
          setActiveTab('entered');
          setSearchQuery('');
          setHighlightedPassId(data.pass.passId);
          toast.success(
            lang === 'bn'
              ? `✓ সফলভাবে চেক-ইন সম্পন্ন! দলের নাম: ${data.pass.teamName}`
              : `✓ Check-in confirmed! Team: ${data.pass.teamName}`
          );
        } else if (data.alreadyCheckedIn && data.pass) {
          // Squad is already checked in: switch to entered tab, keep all teams visible, and highlight this team at the TOP
          setActiveTab('entered');
          setSearchQuery('');
          setHighlightedPassId(data.pass.passId);
          // Ensure this team is moved to the top of enteredList
          setEnteredList((prev) => {
            const others = prev.filter((p) => p.passId !== data.pass.passId && p.humanPassCode !== data.pass.humanPassCode);
            return [data.pass, ...others];
          });
          toast.warning(
            lang === 'bn'
              ? `⚠️ "${data.pass.teamName}" দল ইতিমধ্যে তালিকায় উপস্থিত (Already in the List)!`
              : `⚠️ Squad "${data.pass.teamName}" is already in the entered list!`
          );
        }
      } else {
        setResult({
          success: false,
          alreadyCheckedIn: false,
          message: data.error || (lang === 'bn' ? 'অবৈধ পাস বা ভুল কিউআর কোড।' : 'Invalid pass or unrecognized QR code.'),
        });
        toast.error(data.error || (lang === 'bn' ? 'কোনো বৈধ পাস পাওয়া যায়নি।' : 'Pass not found or invalid.'));
      }
    } catch {
      setResult({
        success: false,
        message: lang === 'bn' ? 'নেটওয়ার্ক সমস্যা হয়েছে।' : 'Network error verifying pass.',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passInput.trim()) return;
    const cleanCode = extractPassIdOrCode(passInput.trim());
    setPassInput(cleanCode);
    executeCheckin(cleanCode);
  };

  const activeEventIds = useMemo(() => {
    return new Set(events.filter((e) => e.registrationEnabled).map((e) => e.id));
  }, [events]);

  const allActivePassCount = useMemo(() => {
    const p = pendingList.filter((x) => activeEventIds.has(x.eventId)).length;
    const e = enteredList.filter((x) => activeEventIds.has(x.eventId)).length;
    return { pending: p, entered: e, total: p + e };
  }, [pendingList, enteredList, activeEventIds]);

  const currentEventStats = useMemo(() => {
    if (eventFilter === 'ALL') return allActivePassCount;
    const p = pendingList.filter((x) => x.eventId === eventFilter).length;
    const e = enteredList.filter((x) => x.eventId === eventFilter).length;
    return { pending: p, entered: e, total: p + e };
  }, [eventFilter, allActivePassCount, pendingList, enteredList]);

  const filteredPending = pendingList.filter((p) => {
    const matchesEvent =
      eventFilter === 'ALL'
        ? (activeEventIds.size > 0 ? activeEventIds.has(p.eventId) : true)
        : p.eventId === eventFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.teamName.toLowerCase().includes(q) ||
      p.humanPassCode.toLowerCase().includes(q) ||
      p.representativeName.toLowerCase().includes(q);
    return matchesEvent && matchesSearch;
  });

  const filteredEntered = useMemo(() => {
    const list = enteredList.filter((p) => {
      const matchesEvent =
        eventFilter === 'ALL'
          ? (activeEventIds.size > 0 ? activeEventIds.has(p.eventId) : true)
          : p.eventId === eventFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.teamName.toLowerCase().includes(q) ||
        p.humanPassCode.toLowerCase().includes(q) ||
        p.representativeName.toLowerCase().includes(q);
      return matchesEvent && matchesSearch;
    });

    if (highlightedPassId) {
      return [...list].sort((a, b) => {
        if (a.passId === highlightedPassId) return -1;
        if (b.passId === highlightedPassId) return 1;
        return 0;
      });
    }
    return list;
  }, [enteredList, eventFilter, activeEventIds, searchQuery, highlightedPassId]);

  return (
    <AdminLayout>
      <div id="file-qr-temp" className="hidden" />

      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-[#1d3575]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#F26522] text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ম্যাচ-ডে প্রবেশ যাচাইকরণ গেট' : 'Matchday Access Verification Gate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {lang === 'bn' ? 'লাইভ কিউআর স্ক্যানার ও টিম চেক-ইন' : 'Live QR Scanner & Team Check-In'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'একটি কিউআর কোড একবারই স্ক্যান করা যাবে। সফল স্ক্যানে দল প্রবেশ তালিকায় যুক্ত হবে।'
                : 'Each QR code can only be scanned once. Valid scans immediately confirm entry and prevent duplicate entries.'}
            </p>
          </div>

          <button
            onClick={fetchData}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#071333] hover:bg-slate-200 dark:hover:bg-[#11245a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1d3575] transition-all hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLists ? 'animate-spin' : ''}`} />
            <span>{lang === 'bn' ? 'তালিকা রিফ্রেশ' : 'Refresh Lists'}</span>
          </button>
        </div>

        {/* Event Selection & Active Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400 shrink-0">
              <Calendar className="w-4 h-4 text-[#F26522]" />
              <span>{lang === 'bn' ? 'চেক-ইন ইভেন্ট নির্বাচন:' : 'Select Check-in Event:'}</span>
            </div>

            {/* Custom Searchable Event Combobox with Active Events on Top & Active Badges */}
            <div className="relative w-full sm:w-auto" ref={eventDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setEventDropdownOpen(!eventDropdownOpen);
                  if (!eventDropdownOpen) setEventSearchQuery('');
                }}
                className="w-full sm:w-auto min-w-[240px] max-w-full sm:max-w-[360px] px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-slate-50 dark:bg-[#0c1a40] text-slate-900 dark:text-white font-bold text-xs flex items-center justify-between gap-2 hover:border-[#F26522] dark:hover:border-cyan-400/50 transition-all shadow-xs text-left"
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className="truncate">
                    {selectedEventObj
                      ? (lang === 'bn' ? selectedEventObj.title.bn : selectedEventObj.title.en)
                      : (lang === 'bn' ? 'সকল অ্যাক্টিভ ইভেন্ট' : 'All Active Events')}
                  </span>
                  {selectedEventObj?.registrationEnabled && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {eventFilter !== 'ALL' && activeEvents.length > 1 && (
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
                      eventDropdownOpen ? 'rotate-180 text-[#F26522]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {eventDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[360px] rounded-2xl bg-white dark:bg-[#0a1844] border border-slate-200 dark:border-[#1d3575] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Search inside event dropdown */}
                  <div className="p-2 border-b border-slate-100 dark:border-[#142654]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'অ্যাক্টিভ ইভেন্টের নাম বা মাঠ খুঁজুন...' : 'Search active event name or venue...'}
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1d3575] bg-slate-50 dark:bg-[#071333] text-slate-900 dark:text-white font-medium text-xs focus:border-[#F26522]"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-[#142654]/60 text-xs">
                    {/* All Active Events option (shown when there are multiple active events) */}
                    {activeEvents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEventFilter('ALL');
                          setEventDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors ${
                          eventFilter === 'ALL'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-[#112766] text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-bold">{lang === 'bn' ? 'সকল অ্যাক্টিভ ইভেন্ট' : 'All Active Events'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            {allActivePassCount.total} {lang === 'bn' ? 'পাস' : 'passes'}
                          </span>
                          {eventFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                      </button>
                    )}

                    {/* Active Events List */}
                    {activeEvents.length > 0 ? (
                      <div className="p-1 space-y-0.5">
                        {activeEvents.map((ev) => {
                          const isSelected = eventFilter === ev.id;
                          const pCount = getEventPassCount(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => {
                                setEventFilter(ev.id);
                                setEventDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-2.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'hover:bg-slate-50 dark:hover:bg-[#112766] text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-semibold text-xs">
                                    {lang === 'bn' ? ev.title.bn : ev.title.en}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {ev.venue ? (lang === 'bn' ? ev.venue.bn : ev.venue.en) : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                  {pCount.total} {lang === 'bn' ? 'পাস' : 'passes'}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'কোনো অ্যাক্টিভ ইভেন্ট পাওয়া যায়নি' : 'No active events found'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'মোট নিবন্ধিত পাস:' : 'Total Registered Passes:'}{' '}
            <span className="font-bold text-[#F26522]">{currentEventStats.total}</span>
          </div>
        </div>

        {/* Scan & Verification Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Scanner Card */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#1d3575]">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'কিউআর কোড স্ক্যান করুন' : 'Scan QR Code'}</span>
              </h2>

              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setScanMode('camera')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scanMode === 'camera'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'ক্যামেরা' : 'Camera'}
                </button>
                <button
                  onClick={() => {
                    stopCameraScanner();
                    setScanMode('file');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scanMode === 'file'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'ফাইল/ছবি' : 'Image File'}
                </button>
                <button
                  onClick={() => {
                    stopCameraScanner();
                    setScanMode('manual');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scanMode === 'manual'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'টাইপ' : 'Manual'}
                </button>
              </div>
            </div>

            {/* Persistent Hidden Container for File Scanning */}
            <div id="file-qr-temp" className="hidden" aria-hidden="true" />

            {/* Camera Viewport (kept mounted in DOM with CSS visibility to prevent video aborts) */}
            <div className={scanMode === 'camera' ? 'space-y-4' : 'hidden'}>
              <div className="relative w-full min-h-[260px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* Dedicated mount target for Html5Qrcode - zero React children inside */}
                <div id={qrRegionId} className="w-full h-full min-h-[260px]" />

                {/* React-controlled overlay shown when camera is idle */}
                {!scanning && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 space-y-2 pointer-events-none z-10">
                    <Camera className="w-12 h-12 mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400 font-medium text-center">
                      {lang === 'bn'
                        ? 'ক্যামেরা চালু করতে নিচের বাটনে চাপ দিন'
                        : 'Click button below to activate live camera'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={startCameraScanner}
                    className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'লাইভ ক্যামেরা স্ক্যানার চালু করুন' : 'Start Live Camera Scanner'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="w-full py-3 rounded-xl font-black text-white bg-rose-600 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-rose-500/20"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ক্যামেরা বন্ধ করুন' : 'Stop Camera'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* File Upload Scan */}
            {scanMode === 'file' && (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-[#1d3575] hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#040d21] transition-all hover:scale-[1.01]">
                  <Upload className="w-10 h-10 text-blue-500 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {lang === 'bn' ? 'কিউআর কোডের ছবি বা স্ক্রিনশট আপলোড করুন' : 'Upload QR Code Image / Screenshot'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleFileScan} className="hidden" />
                </label>
              </div>
            )}

            {/* Manual Form Entry */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'অথবা পাস কোড / আইডি লিখুন:' : 'Or Enter Pass Code / ID:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ISW-IPL26-W9K2"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold dark:text-white"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 text-xs transition-all flex items-center gap-1.5 shadow-md shrink-0 hover:scale-[1.02]"
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'যাচাই' : 'Verify'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Scan Feedback Banner */}
            {result && (
              <div
                className={`p-5 rounded-2xl border transition-all animate-scale-in text-center space-y-3 ${
                  result.success
                    ? result.alreadyCheckedIn
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="flex justify-center">
                  {result.success ? (
                    result.alreadyCheckedIn ? (
                      <AlertTriangle className="w-10 h-10 text-amber-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                    )
                  ) : (
                    <XCircle className="w-10 h-10 text-rose-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black tracking-tight">{result.message}</h3>
                  {result.alreadyCheckedIn && (
                    <div className="mt-2 space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'দলটি ইতিমধ্যেই তালিকায় উপস্থিত (Already in the List)' : 'Already in the Entered List'}</span>
                      </span>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {lang === 'bn'
                          ? '⛔ একটি কিউআর কোড দ্বিতীয়বার স্ক্যান করা যাবে না! প্রবেশ ইতিমধ্যে নিবন্ধিত।'
                          : '⛔ Multiple scans prevented! Team was already checked in earlier.'}
                      </p>
                    </div>
                  )}
                </div>

                {result.pass && (
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#040d21] border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1 text-slate-800 dark:text-slate-200">
                    <p>
                      <strong className="text-slate-500">{lang === 'bn' ? 'দলের নাম:' : 'Team:'}</strong>{' '}
                      <span className="font-bold text-[#F26522]">{result.pass.teamName}</span>
                    </p>
                    <p>
                      <strong className="text-slate-500">{lang === 'bn' ? 'অধিনায়ক/প্রতিনিধি:' : 'Rep:'}</strong>{' '}
                      <span className="font-semibold">{result.pass.representativeName}</span>
                    </p>
                    <p>
                      <strong className="text-slate-500">{lang === 'bn' ? 'খেলোয়াড়:' : 'Players:'}</strong>{' '}
                      {result.pass.memberCount} {lang === 'bn' ? 'জন' : 'squad'}
                    </p>
                    <p>
                      <strong className="text-slate-500">{lang === 'bn' ? 'পাস আইডি:' : 'Pass Code:'}</strong>{' '}
                      <span className="font-mono">{result.pass.humanPassCode}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dual Lists Panel (Pending Entry vs Entered List) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tab Switcher & Search */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                      activeTab === 'pending'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'অপেক্ষমান দল' : 'Pending Entry'}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
                      {filteredPending.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('entered')}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                      activeTab === 'entered'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'মাঠে প্রবেশকৃত দল' : 'Entered / Checked-In'}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
                      {filteredEntered.length}
                    </span>
                  </button>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'দল বা পাস খুঁজুন...' : 'Search team / pass...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs dark:text-white"
                  />
                </div>
              </div>

              {/* Stats overview banner */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-[#1d3575] text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    {lang === 'bn' ? 'মোট অপেক্ষমান দল:' : 'Pending in queue:'}{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {searchQuery ? filteredPending.length : currentEventStats.pending}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {lang === 'bn' ? 'মাঠে মোট প্রবেশ:' : 'Entered the ground:'}{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {searchQuery ? filteredEntered.length : currentEventStats.entered}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* List Content */}
            <div className="space-y-3">
              {activeTab === 'pending' ? (
                filteredPending.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] text-slate-400 space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-medium">
                      {lang === 'bn' ? 'কোনো অপেক্ষমান দল নেই!' : 'No pending teams waiting for entry.'}
                    </p>
                  </div>
                ) : (
                  filteredPending.map((pass) => (
                    <div
                      key={pass.passId}
                      className="p-4 rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] flex items-center justify-between gap-4 hover:border-amber-400 dark:hover:border-amber-500 transition-all hover:scale-[1.01] shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            {pass.teamName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                            {pass.humanPassCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lang === 'bn' ? 'প্রতিনিধি:' : 'Rep:'} {pass.representativeName} •{' '}
                          {pass.memberCount} {lang === 'bn' ? 'জন খেলোয়াড়' : 'players'}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : filteredEntered.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">
                    {lang === 'bn' ? 'এখনো কোনো দল প্রবেশ করেনি।' : 'No teams have entered the ground yet.'}
                  </p>
                </div>
              ) : (
                filteredEntered.map((pass) => {
                  const isHighlighted = highlightedPassId === pass.passId;
                  return (
                    <div
                      key={pass.passId}
                      className={`p-4 rounded-2xl transition-all shadow-sm flex items-center justify-between gap-4 ${
                        isHighlighted
                          ? 'bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-500 ring-4 ring-amber-400/20 shadow-lg shadow-amber-500/10 scale-[1.01]'
                          : 'bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">
                            {pass.teamName}
                          </h4>
                          {isHighlighted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'স্ক্যানকৃত দল (তালিকায় উপস্থিত)' : 'Scanned Team (Already in List)'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'ভেরিফায়েড প্রবেশ' : 'Entered'}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lang === 'bn' ? 'প্রতিনিধি:' : 'Rep:'} {pass.representativeName} •{' '}
                          {pass.memberCount} {lang === 'bn' ? 'জন' : 'squad'} •{' '}
                          <span className="font-mono text-slate-400">{pass.humanPassCode}</span>
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                        <div
                          className={`flex items-center justify-end gap-1 font-bold ${
                            isHighlighted ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span suppressHydrationWarning>
                            {pass.checkedInAt
                              ? new Date(pass.checkedInAt).toLocaleTimeString()
                              : 'Entered'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {pass.checkedInBy || 'Gate Officer'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
