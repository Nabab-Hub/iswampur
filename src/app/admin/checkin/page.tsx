'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import { TeamPass } from '@/types';
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
} from 'lucide-react';

export default function MatchdayCheckinPage() {
  const { user } = useAuth();
  const { lang, resolveBilingual } = useLanguage();

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
  const [loadingLists, setLoadingLists] = useState(true);

  const scannerRef = useRef<any>(null);
  const qrRegionId = 'qr-reader-container';

  // Fetch pending and entered passes
  const fetchPasses = async () => {
    setLoadingLists(true);
    try {
      const res = await fetch('/api/admin/checkin');
      if (res.ok) {
        const data = await res.json();
        setPendingList(data.pending || []);
        setEnteredList(data.entered || []);
      }
    } catch (err) {
      console.error('Failed to fetch passes:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  // Initialize and manage camera QR scanner
  const startCameraScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

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
      alert(
        lang === 'bn'
          ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে। ক্যামেরা পারমিশন দেওয়া আছে কিনা দেখুন।'
          : 'Failed to access camera. Please allow camera permissions in your browser.'
      );
      setScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Camera stop error:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
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

    let extractedCode = rawCode.trim();
    // In case the QR code contains JSON payload
    try {
      const parsed = JSON.parse(extractedCode);
      if (parsed.humanPassCode) extractedCode = parsed.humanPassCode;
      else if (parsed.passId) extractedCode = parsed.passId;
    } catch {}

    setPassInput(extractedCode);
    executeCheckin(extractedCode);
  };

  // Scan from file upload
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('file-qr-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
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
    }
  };

  const executeCheckin = async (code: string) => {
    if (!code) return;
    setChecking(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passCode: code,
          actorEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
        if (!data.alreadyCheckedIn && data.pass) {
          // Move from pending to entered list immediately
          setPendingList((prev) => prev.filter((p) => p.passId !== data.pass.passId && p.humanPassCode !== data.pass.humanPassCode));
          setEnteredList((prev) => [data.pass, ...prev]);
        }
      } else {
        setResult({
          success: false,
          alreadyCheckedIn: false,
          message: data.error || (lang === 'bn' ? 'অবৈধ পাস বা ভুল কিউআর কোড।' : 'Invalid pass or unrecognized QR code.'),
        });
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
    executeCheckin(passInput.trim());
  };

  const filteredPending = pendingList.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.teamName.toLowerCase().includes(q) ||
      p.humanPassCode.toLowerCase().includes(q) ||
      p.representativeName.toLowerCase().includes(q)
    );
  });

  const filteredEntered = enteredList.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.teamName.toLowerCase().includes(q) ||
      p.humanPassCode.toLowerCase().includes(q) ||
      p.representativeName.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div id="file-qr-temp" className="hidden" />

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
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
            onClick={fetchPasses}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#071333] hover:bg-slate-200 dark:hover:bg-[#11245a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1d3575] transition-all hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLists ? 'animate-spin' : ''}`} />
            <span>{lang === 'bn' ? 'তালিকা রিফ্রেশ' : 'Refresh Lists'}</span>
          </button>
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

            {/* Camera Viewport */}
            {scanMode === 'camera' && (
              <div className="space-y-4">
                <div
                  id={qrRegionId}
                  className="w-full min-h-[260px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-slate-400 border border-slate-800 relative"
                >
                  {!scanning && (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="w-12 h-12 mx-auto text-slate-600" />
                      <p className="text-xs text-slate-400 font-medium">
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
            )}

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
                  <Search className="w-3.5 h-3.5" />
                  <span>{checking ? '...' : lang === 'bn' ? 'যাচাই' : 'Verify'}</span>
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
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {lang === 'bn'
                        ? '⛔ একটি কিউআর কোড দ্বিতীয়বার স্ক্যান করা যাবে না! প্রবেশ ইতিমধ্যে নিবন্ধিত।'
                        : '⛔ Multiple scans prevented! Team was already checked in earlier.'}
                    </p>
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
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white">
                      {pendingList.length}
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
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white">
                      {enteredList.length}
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
                    <strong className="text-slate-900 dark:text-white">{pendingList.length}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {lang === 'bn' ? 'মাঠে মোট প্রবেশ:' : 'Entered the ground:'}{' '}
                    <strong className="text-slate-900 dark:text-white">{enteredList.length}</strong>
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

                      <button
                        onClick={() => executeCheckin(pass.humanPassCode)}
                        disabled={checking}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 shadow-md transition-all hover:scale-105 shrink-0"
                      >
                        {lang === 'bn' ? 'প্রবেশ নিশ্চিত করুন' : 'Confirm Entry'}
                      </button>
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
                filteredEntered.map((pass) => (
                  <div
                    key={pass.passId}
                    className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-4 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {pass.teamName}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'ভেরিফায়েড প্রবেশ' : 'Entered'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'প্রতিনিধি:' : 'Rep:'} {pass.representativeName} •{' '}
                        {pass.memberCount} {lang === 'bn' ? 'জন' : 'squad'} •{' '}
                        <span className="font-mono text-slate-400">{pass.humanPassCode}</span>
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
