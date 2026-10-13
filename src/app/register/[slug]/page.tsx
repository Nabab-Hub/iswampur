'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/authContext';
import { VillageEvent, SiteSettings } from '@/types';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Calendar,
  Plus,
  Trash2,
  FileCheck,
  Loader2,
  Check,
  X,
} from 'lucide-react';

function GoogleIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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

function RegistrationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const editId = searchParams?.get('edit');
  const router = useRouter();
  const { lang, t, resolveBilingual } = useLanguage();
  const { user, signInWithGoogle } = useAuth();

  const [event, setEvent] = useState<VillageEvent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Stepper state (1 to 5)
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Correction Mode & Previous Review Note
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [adminCorrectionNote, setAdminCorrectionNote] = useState<string | null>(null);

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamAddress, setTeamAddress] = useState('');
  const [repName, setRepName] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamPhone, setTeamPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Players list
  const [players, setPlayers] = useState<{ name: string; role?: string }[]>([
    { name: '', role: 'captain' },
    { name: '', role: 'vice_captain' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
    { name: '', role: 'player' },
  ]);

  // Payment Form State
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRegId, setSubmittedRegId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [eventRes, settingsRes] = await Promise.all([
          fetch(`/api/events/${slug}`),
          fetch('/api/admin/settings'),
        ]);

        if (eventRes.ok) {
          const evData = await eventRes.json();
          setEvent(evData);
        }
        if (settingsRes.ok) {
          const settsData = await settingsRes.json();
          setSettings(settsData);
        }

        // If in edit / correction mode, load existing registration details
        if (editId) {
          try {
            const regRes = await fetch(`/api/registrations/${editId}`);
            if (regRes.ok) {
              const regData = await regRes.json();
              setEditingRegId(regData.id);
              if (regData.team?.name) setTeamName(regData.team.name);
              if (regData.team?.address) setTeamAddress(regData.team.address);
              if (regData.team?.representativeName) setRepName(regData.team.representativeName);
              if (regData.team?.email) setTeamEmail(regData.team.email);
              if (regData.team?.phone) setTeamPhone(regData.team.phone);
              if (regData.team?.emergencyName) setEmergencyName(regData.team.emergencyName);
              if (regData.team?.emergencyPhone) setEmergencyPhone(regData.team.emergencyPhone);
              if (regData.team?.members && regData.team.members.length > 0) {
                setPlayers(regData.team.members);
              }
              if (regData.customFieldValues) setCustomFieldValues(regData.customFieldValues);
              if (regData.payment?.utr) setUtrNumber(regData.payment.utr);
              if (regData.payment?.screenshotUrl) setScreenshotUrl(regData.payment.screenshotUrl);
              if (regData.reviewNote) setAdminCorrectionNote(regData.reviewNote);
              setTermsAccepted(true);
            }
          } catch (e) {
            console.error('Failed to load edit registration:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load event data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, editId]);

  // Synchronize players count strictly with event.maxPlayers configuration
  useEffect(() => {
    if (event?.maxPlayers) {
      const maxCount = Number(event.maxPlayers) || 15;
      setPlayers((prev) => {
        if (prev.length === maxCount) return prev;
        return Array.from({ length: maxCount }, (_, idx) => {
          const existing = prev[idx];
          return {
            name: existing?.name || (idx === 0 && user?.displayName ? user.displayName : ''),
            role: existing?.role || (idx === 0 ? 'captain' : idx === 1 ? 'vice_captain' : 'player'),
          };
        });
      });
    }
  }, [event?.maxPlayers, user?.displayName]);

  // Sync user info into form once signed in
  useEffect(() => {
    if (user) {
      if (!teamEmail && user.email) setTeamEmail(user.email);
      if (!repName && user.displayName) setRepName(user.displayName);
      if (!players[0].name && user.displayName) {
        setPlayers((prev) => {
          const copy = [...prev];
          copy[0] = { ...copy[0], name: user.displayName || '' };
          return copy;
        });
      }
    }
  }, [user]);

  // Dynamic player row handlers
  const handleAddPlayer = () => {
    const max = event?.maxPlayers || 15;
    if (players.length < max) {
      setPlayers([...players, { name: '', role: 'player' }]);
    }
  };

  const handleRemovePlayer = (idx: number) => {
    const min = event?.minPlayers || 11;
    if (players.length > min) {
      setPlayers(players.filter((_, i) => i !== idx));
    }
  };

  const handlePlayerNameChange = (idx: number, name: string) => {
    const copy = [...players];
    copy[idx] = { ...copy[idx], name };
    setPlayers(copy);
  };

  // Payment screenshot upload simulation / Cloudinary sign
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(lang === 'bn' ? 'ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে।' : 'File size must be under 5 MB.');
      return;
    }

    setUploadingScreenshot(true);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setUploadingScreenshot(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMsg(lang === 'bn' ? 'ফাইল আপলোড করতে সমস্যা হয়েছে।' : 'Failed to upload screenshot.');
      setUploadingScreenshot(false);
    }
  };

  // Step 3 Validation & Next Navigation
  const handleNextFromStep3 = () => {
    const cleanPhone = teamPhone.replace(/\D/g, '');
    if (event?.formPresets?.requirePhone !== false && cleanPhone.length !== 10) {
      setErrorMsg(
        lang === 'bn'
          ? 'মোবাইল নম্বরটি অবশ্যই সঠিক ১০ ডিজিটের হতে হবে (উদাঃ 9876543210)।'
          : 'Mobile phone number must be exactly 10 digits (e.g. 9876543210).'
      );
      return;
    }

    const cleanEmerPhone = emergencyPhone.replace(/\D/g, '');
    if (emergencyPhone.trim()) {
      if (cleanEmerPhone.length !== 10) {
        setErrorMsg(
          lang === 'bn'
            ? 'জরুরি ফোন নম্বরটিও অবশ্যই সঠিক ১০ ডিজিটের হতে হবে।'
            : 'Emergency phone number must be exactly 10 digits.'
        );
        return;
      }
      if (cleanEmerPhone === cleanPhone) {
        setErrorMsg(
          lang === 'bn'
            ? 'জরুরি ফোন নম্বর এবং প্রধান মোবাইল নম্বর আলাদা হতে হবে।'
            : 'Emergency phone number must be different from primary phone number.'
        );
        return;
      }
    }

    setErrorMsg('');
    setStep(4);
  };

  // Final Registration Submission
  const handleSubmitRegistration = async () => {
    if (!user) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে প্রথমে গুগল দিয়ে সাইন-ইন করুন।' : 'Please sign in with Google first.');
      return;
    }
    if (!event) return;

    const cleanPhone = teamPhone.replace(/\D/g, '');
    if (event?.formPresets?.requirePhone !== false && cleanPhone.length !== 10) {
      setErrorMsg(lang === 'bn' ? 'মোবাইল নম্বরটি অবশ্যই সঠিক ১০ ডিজিটের হতে হবে।' : 'Phone number must be exactly 10 digits.');
      setStep(3);
      return;
    }
    const cleanEmer = emergencyPhone.replace(/\D/g, '');
    if (emergencyPhone.trim() && cleanEmer.length !== 10) {
      setErrorMsg(lang === 'bn' ? 'জরুরি ফোন নম্বরটিও অবশ্যই সঠিক ১০ ডিজিটের হতে হবে।' : 'Emergency phone number must be exactly 10 digits.');
      setStep(3);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const isSquadRequired = event.formPresets?.requireSquad !== false;
      const effectiveMembers = isSquadRequired && players.filter((p) => p.name.trim() !== '').length > 0
        ? players.filter((p) => p.name.trim() !== '')
        : [{ name: repName.trim() || user.displayName || 'Participant', role: 'captain' }];

      const payload = {
        id: editingRegId || undefined,
        eventId: event.id,
        eventSlug: event.slug || slug,
        ownerUid: user.uid,
        ownerEmail: user.email,
        language: lang,
        rulesAcceptedAt: new Date().toISOString(),
        termsVersion: event.rulesVersion || '2026.1',
        team: {
          name: teamName.trim() || repName.trim() || user.displayName || 'Participant',
          address: teamAddress.trim() || 'N/A',
          representativeName: repName.trim() || user.displayName || 'Representative',
          email: teamEmail.trim() || user.email || '',
          phone: cleanPhone,
          emergencyName: emergencyName.trim(),
          emergencyPhone: cleanEmer,
          members: effectiveMembers,
        },
        customFieldValues,
        payment: {
          amount: event.registrationFee ?? 0,
          utr: utrNumber.trim() || (event.registrationFee === 0 ? 'FREE_REGISTRATION' : ''),
          screenshotUrl:
            screenshotUrl ||
            (event.registrationFee === 0
              ? 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'
              : ''),
        },
        status: 'PENDING_REVIEW',
      };

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || (lang === 'bn' ? 'নিবন্ধন জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit registration.'));
      }

      setSubmittedRegId(resData.id);
      setStep(5); // Go to final confirmation step
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'bn' ? 'নিবন্ধন জমা দিতে সমস্যা হয়েছে।' : 'Submission failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#273656] dark:text-[#CBD5E1]">
              {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Step 0: Gate check
  const now = new Date();
  const todayStr = new Date().toISOString().slice(0, 10);
  const isEventEnded = Boolean(
    event?.endDate ? event.endDate < todayStr : event?.startDate ? event.startDate < todayStr : false
  );
  const isDraft = event?.status === 'draft' || event?.published === false;
  const isNotStarted =
    Boolean(event?.registrationStartDate && new Date(event.registrationStartDate) > now);
  const isExpired =
    Boolean(event?.registrationDeadline && new Date(event.registrationDeadline) < now);
  const isRegistrationClosed = !event?.registrationEnabled || isExpired || isNotStarted || isEventEnded || isDraft;

  if (isRegistrationClosed) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24]">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-full text-white flex items-center justify-center mx-auto shadow-md ${
              isNotStarted ? 'bg-amber-500' : 'bg-rose-600'
            }`}
          >
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white">
            {isDraft
              ? lang === 'bn'
                ? 'অনলাইন নিবন্ধন বর্তমানে প্রস্তুত করা হচ্ছে'
                : 'Registration Form Under Preparation'
              : isEventEnded
              ? lang === 'bn'
                ? 'অনুষ্ঠানটি সম্পন্ন হয়েছে'
                : 'Event Has Concluded'
              : isNotStarted
              ? lang === 'bn'
                ? 'অনলাইন নিবন্ধন শীঘ্রই চালু হবে'
                : 'Registration Opens Soon'
              : t.hero.registrationClosed}
          </h1>
          <p className="text-[#273656] dark:text-[#CBD5E1] text-sm sm:text-base font-semibold">
            {isDraft
              ? lang === 'bn'
                ? `${resolveBilingual(event?.title)} এর ফর্মটি ড্রাফট মোডে রয়েছে। খুব শীঘ্রই প্রকাশ করা হবে।`
                : `The registration form for ${resolveBilingual(event?.title)} is currently in draft mode.`
              : isEventEnded
              ? lang === 'bn'
                ? `${resolveBilingual(event?.title)} অনুষ্ঠানটির সময়কাল শেষ হয়ে যাওয়ায় নিবন্ধন বন্ধ করা হয়েছে।`
                : `${resolveBilingual(event?.title)} has ended and registrations are now permanently closed.`
              : isNotStarted
              ? lang === 'bn'
                ? `${resolveBilingual(event?.title)} এর অনলাইন নিবন্ধন শুরু হবে: ${new Date(
                    event!.registrationStartDate!
                  ).toLocaleString('bn-BD', { dateStyle: 'long', timeStyle: 'short' })}`
                : `Online registration for ${resolveBilingual(event?.title)} begins on ${new Date(
                    event!.registrationStartDate!
                  ).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}`
              : isExpired
              ? lang === 'bn'
                ? `${resolveBilingual(event?.title)} এর অনলাইন নিবন্ধনের সময়সীমা (${new Date(
                    event!.registrationDeadline!
                  ).toLocaleDateString('bn-BD', { dateStyle: 'long' })}) শেষ হয়েছে।`
                : `The registration deadline for ${resolveBilingual(event?.title)} has expired.`
              : lang === 'bn'
              ? `${resolveBilingual(event?.title)} এর অনলাইন নিবন্ধন বর্তমান সময়ে বন্ধ রয়েছে।`
              : `Online registration for ${resolveBilingual(event?.title)} is currently closed.`}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#19398A] text-white shadow-sm inline-block">
              {resolveBilingual(event?.title)}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#08143A] dark:text-white">
              {t.registration.title}
            </h1>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="space-y-1.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    step >= s ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B]' : 'bg-[#cbd9ec] dark:bg-[#1d3575]'
                  }`}
                />
                <span
                  className={
                    step === s
                      ? 'text-[#F26522] dark:text-[#F9A01B] font-black'
                      : 'text-[#64748B] dark:text-[#94A3B8] font-bold'
                  }
                >
                  {lang === 'bn' ? `ধাপ ${s}` : `Step ${s}`}
                </span>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: RULES & ACCEPTANCE ================= */}
          {step === 1 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
              <div className="flex items-center gap-3 text-[#F26522] dark:text-[#F9A01B] font-black border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
                <FileCheck className="w-6 h-6" />
                <h3 className="text-xl">{t.registration.step1}</h3>
              </div>

              {/* Admin Correction Note Banner if in edit mode */}
              {adminCorrectionNote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-[#F9A01B] space-y-2 text-left animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#F9A01B] font-black text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{lang === 'bn' ? 'অ্যাডমিন নির্দেশিত সংশোধন নোট (Correction Required):' : 'Admin Correction Instructions:'}</span>
                  </div>
                  <div className="bg-white dark:bg-[#071333] p-3 rounded-xl border border-amber-300 dark:border-amber-700">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {adminCorrectionNote}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                    {lang === 'bn'
                      ? 'দয়া করে পরবর্তী ধাপগুলোতে প্রয়োজনীয় তথ্য সংশোধন করে ফর্মটি পুনরায় জমা দিন।'
                      : 'Please adjust the necessary details in the next steps and resubmit for immediate re-verification.'}
                  </p>
                </div>
              )}

              {/* Quick Google Sign-In helper at Step 1 */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#08143A] dark:text-white">
                        {lang === 'bn' ? 'গুগল দিয়ে দ্রুত সাইন-ইন' : 'Sign in with Google'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        {lang === 'bn' ? 'যেকোনো সময় গুগল দিয়ে সাইন-ইন করে নিবন্ধন সম্পন্ন করতে পারবেন।' : 'Sign in to auto-fill your email and keep your pass secure.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-white dark:bg-[#0c1a40] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-[#F26522] shadow-xs flex items-center gap-2 shrink-0 transition-all hover:scale-105"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন' : 'Sign in with Google'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      {lang === 'bn' ? 'গুগল অ্যাকাউন্ট সংযুক্ত:' : 'Connected Account:'} <span className="font-mono font-black">{user.email}</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              )}

              <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
                {t.registration.rulesNotice}
              </p>

              <div className="p-5 rounded-2xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] max-h-80 overflow-y-auto text-xs sm:text-sm text-[#08143A] dark:text-[#CBD5E1] whitespace-pre-line leading-relaxed font-medium">
                {lang === 'bn'
                  ? (event?.rules?.bn ||
                    `১. প্রতিটি দলে নূন্যতম ১১ জন এবং সর্বোচ্চ ১৫ জন খেলোয়াড় থাকতে হবে।\n২. সকল খেলোয়াড়কে ম্যাচ শুরুর ৩০ মিনিট পূর্বে মাঠে উপস্থিত থাকতে হবে।\n৩. বৈধ পেমেন্ট স্ক্রিনশট ও সঠিক মোবাইল নম্বর প্রদান বাধ্যতামূলক।\n৪. অনুমোদনের পর প্রাপ্ত টিম পাস প্রিন্ট করে মাঠে সাথে রাখতে হবে।`)
                  : (event?.rules?.en ||
                    `1. Each squad must have a minimum of 11 and a maximum of 15 players.\n2. All players must report to the ground 30 minutes prior to match schedule.\n3. Valid payment screenshot and correct contact numbers are mandatory.\n4. Teams must print the official verified team pass for entry at the ground.`)}
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded text-[#F26522] focus:ring-[#F26522] border-[#cbd9ec]"
                />
                <span className="text-xs sm:text-sm font-bold text-[#08143A] dark:text-white leading-snug">
                  {t.registration.acceptTermsLabel}
                </span>
              </label>

              <div className="flex justify-end pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                <button
                  disabled={!termsAccepted}
                  onClick={() => setStep(2)}
                  className="px-7 py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-md"
                >
                  <span>{t.common.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: GOOGLE AUTH ================= */}
          {step === 2 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] flex items-center justify-center mx-auto shadow-md">
                <GoogleIcon className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}
                </h3>
                <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
                  {lang === 'bn'
                    ? 'নিবন্ধনের স্থিতি, পেমেন্ট নিশ্চিতকরণ ও ডিজিটাল টিম পাস পাওয়ার জন্য গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।'
                    : 'Sign in with your Google account to submit team registration and receive your digital matchday pass.'}
                </p>
              </div>

              {user ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 max-w-md mx-auto space-y-1.5 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{t.registration.googleAccountConnected}</span>
                    </p>
                    <span className="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  </div>
                  <p className="font-black text-[#08143A] dark:text-white text-base">{user.displayName || 'Google User'}</p>
                  <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-mono">{user.email}</p>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={signInWithGoogle}
                    className="px-7 py-3.5 rounded-xl font-black text-slate-800 dark:text-white bg-white dark:bg-[#071333] hover:bg-slate-50 dark:hover:bg-[#0f2358] border-2 border-slate-300 dark:border-[#2a4d9c] shadow-md hover:shadow-lg inline-flex items-center gap-3 uppercase tracking-wider text-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766]"
                >
                  ← {t.common.back}
                </button>
                <button
                  disabled={!user}
                  onClick={() => setStep(3)}
                  className="px-7 py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-md"
                >
                  <span>{lang === 'bn' ? 'পরবর্তী ধাপে যান' : 'Continue to Form'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: TEAM & PLAYERS FORM ================= */}
          {step === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
              <div className="flex items-center gap-3 text-[#F26522] dark:text-[#F9A01B] font-black border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
                <Trophy className="w-6 h-6" />
                <h3 className="text-xl">{t.registration.step3}</h3>
              </div>

              {/* Team basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.teamName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'উদাঃ ঈশ্বমপুর ওয়ারিয়র্স' : 'e.g. Iswampur Warriors'}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.teamAddress} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'উদাঃ পশ্চিম পাড়া, ঈশ্বমপুর' : 'e.g. West Para, Iswampur'}
                    value={teamAddress}
                    onChange={(e) => setTeamAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.representativeName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'দলনেতা / প্রতিনিধির পুরো নাম' : 'Captain / Representative Full Name'}
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-[#08143A] dark:text-white">
                      {t.registration.phone} *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {teamPhone.length}/10
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={lang === 'bn' ? '১০ সংখ্যার মোবাইল নম্বর (উদাঃ 9876543210)' : '10-digit Phone Number'}
                    value={teamPhone}
                    onChange={(e) => setTeamPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                  {teamPhone.length > 0 && teamPhone.length < 10 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                      {lang === 'bn'
                        ? `আরও ${10 - teamPhone.length} টি সংখ্যা দিন (সঠিক ১০ ডিজিট প্রয়োজন)`
                        : `${10 - teamPhone.length} more digits needed (must be 10 digits)`}
                    </p>
                  )}
                  {teamPhone.length === 10 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'সঠিক ১০ ডিজিটের নম্বর' : 'Valid 10-digit number'}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1 flex items-center justify-between">
                    <span>{t.registration.email} *</span>
                    {user?.email && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে সংযুক্ত' : 'Auto-filled via Google'}</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(user?.email)}
                    readOnly={Boolean(user?.email)}
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-200/60 dark:disabled:bg-[#07102b] select-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-[#08143A] dark:text-white">
                      {t.registration.emergencyPhone} *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {emergencyPhone.length}/10
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={t.registration.emergencyPhonePlaceholder || (lang === 'bn' ? '১০ সংখ্যার বিকল্প/জরুরি ফোন নম্বর' : '10-digit Emergency Phone Number')}
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                  {emergencyPhone.length > 0 && emergencyPhone.length < 10 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                      {lang === 'bn'
                        ? `আরও ${10 - emergencyPhone.length} টি সংখ্যা দিন (সঠিক ১০ ডিজিট প্রয়োজন)`
                        : `${10 - emergencyPhone.length} more digits needed (must be 10 digits)`}
                    </p>
                  )}
                  {emergencyPhone.length === 10 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'সঠিক ১০ ডিজিটের নম্বর' : 'Valid 10-digit number'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Players Squad List (Only shown if requireSquad is enabled) */}
              {event?.formPresets?.requireSquad !== false && (
                <div className="pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-[#08143A] dark:text-white text-base">
                        {t.registration.playersSection} ({event?.maxPlayers || players.length} {lang === 'bn' ? 'জন' : 'Players'})
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">
                        {lang === 'bn'
                          ? `১ থেকে ${event?.minPlayers || 11} জন খেলোয়াড় পূরণ বাধ্যতামূলক (*), এবং ${(event?.minPlayers || 11) + 1} থেকে ${event?.maxPlayers || 15} জন পর্যন্ত ঐচ্ছিক (Optional)।`
                          : `Players 1 to ${event?.minPlayers || 11} are required (*), and ${(event?.minPlayers || 11) + 1} to ${event?.maxPlayers || 15} are optional.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e6eef8] dark:bg-[#112766] text-[#19398A] dark:text-cyan-300 border border-[#cbd9ec] dark:border-[#1d3575]">
                        {event?.minPlayers || 11} {lang === 'bn' ? 'বাধ্যতামূলক' : 'Required'} • {Math.max(0, (event?.maxPlayers || 15) - (event?.minPlayers || 11))} {lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {players.map((player, idx) => {
                      const isRequired = idx < (event?.minPlayers || 11);
                      const placeholderText =
                        idx === 0
                          ? lang === 'bn'
                            ? 'Captain * (অধিনায়ক)'
                            : 'Captain *'
                          : idx === 1
                          ? lang === 'bn'
                            ? 'Vice-Captain * (সহ-অধিনায়ক)'
                            : 'Vice-Captain *'
                          : isRequired
                          ? lang === 'bn'
                            ? `Player ${idx + 1} * (বাধ্যতামূলক)`
                            : `Player ${idx + 1} * (Required)`
                          : lang === 'bn'
                          ? `Player ${idx + 1} (ঐচ্ছিক)`
                          : `Player ${idx + 1} (Optional)`;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          {idx === 0 ? (
                            <span
                              className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0 min-w-[76px] text-center"
                              title={lang === 'bn' ? 'দলের অধিনায়ক (বাধ্যতামূলক)' : 'Team Captain (Required)'}
                            >
                              {lang === 'bn' ? '১. Captain *' : '1. Captain *'}
                            </span>
                          ) : idx === 1 ? (
                            <span
                              className="px-2 py-1 rounded-lg text-[10px] font-black bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shrink-0 min-w-[76px] text-center"
                              title={lang === 'bn' ? 'দলের সহ-অধিনায়ক (বাধ্যতামূলক)' : 'Team Vice-Captain (Required)'}
                            >
                              {lang === 'bn' ? '২. Vice-Cap *' : '2. Vice-Cap *'}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0 min-w-[36px] justify-end">
                              <span className="text-xs font-black text-[#64748B] dark:text-[#94A3B8]">
                                {idx + 1}.
                              </span>
                              {isRequired ? (
                                <span className="text-rose-500 font-black text-xs" title={lang === 'bn' ? 'বাধ্যতামূলক' : 'Required'}>
                                  *
                                </span>
                              ) : (
                                <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {lang === 'bn' ? 'ঐচ্ছিক' : 'Opt'}
                                </span>
                              )}
                            </div>
                          )}

                          <input
                            type="text"
                            required={isRequired}
                            placeholder={placeholderText}
                            value={player.name}
                            onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-xl border bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white text-xs sm:text-sm font-semibold focus:border-[#F26522] ${
                              isRequired
                                ? 'border-[#cbd9ec] dark:border-[#1d3575]'
                                : 'border-dashed border-slate-300 dark:border-slate-700'
                            }`}
                          />

                          {!isRequired && player.name && (
                            <button
                              type="button"
                              onClick={() => handlePlayerNameChange(idx, '')}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg shrink-0 transition-colors"
                              title={lang === 'bn' ? 'নাম মুছুন' : 'Clear name'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Custom Fields (Configured from Admin Form Builder) */}
              {event?.customFields && event.customFields.length > 0 && (
                <div className="pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
                  <div>
                    <h4 className="font-black text-[#08143A] dark:text-white text-base">
                      {lang === 'bn' ? 'অতিরিক্ত তথ্য (Custom Form Fields)' : 'Additional Required Information'}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {lang === 'bn' ? 'টুর্নামেন্ট কমিটির নির্দেশ অনুযায়ী নিচের তথ্যগুলো পূরণ করুন।' : 'Please fill in the additional details required for this tournament.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.customFields.map((field) => (
                      <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                          {resolveBilingual(field.label)} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            rows={3}
                            placeholder={field.placeholder ? resolveBilingual(field.placeholder) : ''}
                            value={customFieldValues[field.id] || ''}
                            onChange={(e) =>
                              setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white text-xs sm:text-sm font-semibold focus:border-[#F26522]"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            required={field.required}
                            value={customFieldValues[field.id] || ''}
                            onChange={(e) =>
                              setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white text-xs sm:text-sm font-semibold focus:border-[#F26522]"
                          >
                            <option value="">{lang === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center gap-2 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={Boolean(customFieldValues[field.id])}
                              onChange={(e) =>
                                setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.checked })
                              }
                              className="w-4 h-4 rounded text-[#F26522]"
                            />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {field.placeholder
                                ? resolveBilingual(field.placeholder)
                                : resolveBilingual(field.label)}
                            </span>
                          </label>
                        ) : (
                          <input
                            type={field.type}
                            required={field.required}
                            placeholder={field.placeholder ? resolveBilingual(field.placeholder) : ''}
                            value={customFieldValues[field.id] || ''}
                            onChange={(e) =>
                              setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white text-xs sm:text-sm font-semibold focus:border-[#F26522]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766]"
                >
                  ← {t.common.back}
                </button>
                <button
                  disabled={
                    (event?.formPresets?.requireTeamName !== false && event?.formPresets?.participationType !== 'individual' && !teamName.trim()) ||
                    (event?.formPresets?.requireAddress !== false && !teamAddress.trim()) ||
                    (event?.formPresets?.requirePhone !== false && teamPhone.replace(/\D/g, '').length !== 10) ||
                    (emergencyPhone.trim() !== '' && emergencyPhone.replace(/\D/g, '').length !== 10) ||
                    !repName.trim() ||
                    (event?.formPresets?.requireSquad !== false &&
                      players.slice(0, event?.minPlayers || 11).some((p) => !p.name.trim())) ||
                    Boolean(
                      event?.customFields &&
                        event.customFields.some((f) => f.required && !customFieldValues[f.id])
                    )
                  }
                  onClick={handleNextFromStep3}
                  className="px-7 py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-md"
                >
                  <span>{t.common.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: PAYMENT & SCREENSHOT ================= */}
          {step === 4 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-6 shadow-sm">
              <div className="flex items-center gap-3 text-[#F26522] dark:text-[#F9A01B] font-black border-b pb-4 border-[#cbd9ec] dark:border-[#1d3575]">
                <QrCode className="w-6 h-6" />
                <h3 className="text-xl">{t.registration.paymentHeading}</h3>
              </div>

              {(event?.registrationFee ?? 0) === 0 || event?.formPresets?.requirePaymentProof === false ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-300">
                    {lang === 'bn' ? 'বিনামূল্যে রেজিস্ট্রেশন (Free Registration)' : 'Free Event Registration'}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 max-w-md mx-auto">
                    {lang === 'bn'
                      ? 'এই ইভেন্টে কোনো রেজিস্ট্রেশন ফি প্রযোজ্য নয়। কোনো পেমেন্ট বা ইউটিআর জমার প্রয়োজন নেই। সরাসরি নিচের বাটনে ক্লিক করে আবেদন সম্পন্ন করুন।'
                      : 'No entry fee is required for this event. Simply click submit below to complete your registration.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Payment QR & details */}
                  <div className="p-6 rounded-2xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-center space-y-4">
                    <div className="inline-block p-3 rounded-xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575]">
                      <img
                        src={settings?.payment?.qrCodeUrl || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
                        alt="Payment QR"
                        className="w-44 h-44 object-contain mx-auto"
                      />
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm font-semibold">
                      <p className="font-black text-[#F26522] dark:text-[#F9A01B] text-lg">
                        {t.registration.feeAmount} ₹{event?.registrationFee || 1500}
                      </p>
                      <p className="text-[#08143A] dark:text-white">
                        {t.registration.upiId} <strong>{settings?.payment?.upiId || 'iswampur.cricket@upi'}</strong>
                      </p>
                      <p className="text-[#64748B] dark:text-[#94A3B8]">
                        {t.registration.payeeName} {settings?.payment?.payeeName || 'Iswampur Sports'}
                      </p>
                    </div>
                  </div>

                  {/* Upload & UTR inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                        {t.registration.utrLabel} *
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? '১২ সংখ্যার UTR / ট্রানজ্যাকশন আইডি' : '12-digit UTR / Txn Reference ID'}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                        {t.registration.screenshotLabel} *
                      </label>
                      <div className="border-2 border-dashed border-[#cbd9ec] dark:border-[#1d3575] rounded-2xl p-6 text-center hover:border-[#F26522] transition-colors">
                        {screenshotUrl ? (
                          <div className="space-y-3">
                            <img
                              src={screenshotUrl}
                              alt="Screenshot Preview"
                              className="w-32 h-32 object-cover rounded-xl mx-auto shadow-md"
                            />
                            <p className="text-xs text-emerald-600 font-bold">
                              {lang === 'bn' ? '✓ স্ক্রিনশট সফলভাবে সংযুক্ত হয়েছে' : '✓ Screenshot attached successfully'}
                            </p>
                            <label className="text-xs text-[#F26522] underline cursor-pointer font-bold">
                              {lang === 'bn' ? 'পরিবর্তন করুন' : 'Change screenshot'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleScreenshotUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-2 block">
                            <Upload className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8] mx-auto" />
                            <p className="text-xs sm:text-sm font-bold text-[#08143A] dark:text-white">
                              {uploadingScreenshot
                                ? t.registration.uploading
                                : (lang === 'bn' ? 'ক্লিক করে স্ক্রিনশট ফাইল নির্বাচন করুন' : 'Click to upload payment screenshot')}
                            </p>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766]"
                >
                  ← {t.common.back}
                </button>
                <button
                  disabled={
                    submitting ||
                    ((event?.registrationFee ?? 0) > 0 &&
                      event?.formPresets?.requirePaymentProof !== false &&
                      !screenshotUrl)
                  }
                  onClick={handleSubmitRegistration}
                  className="px-8 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] disabled:opacity-40 transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.registration.submitBtn}</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SUCCESS & TRACKING ================= */}
          {step === 5 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white">
                  {t.registration.successTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] leading-relaxed font-semibold">
                  {t.registration.successMsg}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f0f4fa] dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] max-w-sm mx-auto text-xs space-y-1">
                <p className="text-[#64748B] dark:text-[#94A3B8] font-bold">Registration Reference ID:</p>
                <p className="font-mono font-black text-[#F26522] dark:text-[#F9A01B] text-base">{submittedRegId}</p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Status: PENDING_REVIEW</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push(`/my-registration?id=${submittedRegId}`)}
                  className="px-6 py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] transition-all text-sm shadow-md uppercase tracking-wider"
                >
                  {lang === 'bn' ? 'আবেদনের স্থিতি ও টিম পাস দেখুন →' : 'Track Status & View Pass →'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-5 py-3 rounded-xl font-bold text-[#08143A] dark:text-white hover:bg-[#e6eef8] dark:hover:bg-[#112766] border border-[#cbd9ec] dark:border-[#1d3575] text-sm"
                >
                  {lang === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050D24] flex items-center justify-center text-white">Loading...</div>}>
      <RegistrationContent />
    </Suspense>
  );
}
