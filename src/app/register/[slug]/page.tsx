'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';

export default function RegistrationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { lang, t, resolveBilingual } = useLanguage();
  const { user, signInWithGoogle } = useAuth();

  const [event, setEvent] = useState<VillageEvent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Stepper state (1 to 5)
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      } catch (err) {
        console.error('Failed to load event data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

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

  // Final Registration Submission
  const handleSubmitRegistration = async () => {
    if (!user) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে প্রথমে গুগল দিয়ে সাইন-ইন করুন।' : 'Please sign in with Google first.');
      return;
    }
    if (!event) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        eventId: event.id,
        ownerUid: user.uid,
        ownerEmail: user.email,
        language: lang,
        rulesAcceptedAt: new Date().toISOString(),
        termsVersion: event.rulesVersion || '2026.1',
        team: {
          name: teamName.trim(),
          address: teamAddress.trim(),
          representativeName: repName.trim(),
          email: teamEmail.trim(),
          phone: teamPhone.trim(),
          emergencyName: emergencyName.trim(),
          emergencyPhone: emergencyPhone.trim(),
          members: players.filter((p) => p.name.trim() !== ''),
        },
        customFieldValues,
        payment: {
          amount: event.registrationFee || 1500,
          utr: utrNumber.trim(),
          screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
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
  const isNotStarted =
    event?.registrationStartDate && new Date(event.registrationStartDate) > now;
  const isExpired =
    event?.registrationDeadline && new Date(event.registrationDeadline) < now;
  const isRegistrationClosed = !event?.registrationEnabled || isExpired || isNotStarted;

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
            {isNotStarted
              ? lang === 'bn'
                ? 'অনলাইন নিবন্ধন শীঘ্রই চালু হবে'
                : 'Registration Opens Soon'
              : t.hero.registrationClosed}
          </h1>
          <p className="text-[#273656] dark:text-[#CBD5E1] text-sm sm:text-base font-semibold">
            {isNotStarted
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
              <div className="w-16 h-16 rounded-full bg-[#19398A] text-white flex items-center justify-center mx-auto shadow-md">
                <User className="w-8 h-8 text-[#F9A01B]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-black text-[#08143A] dark:text-white">
                  {t.registration.step2}
                </h3>
                <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
                  {t.registration.googleSignInPrompt}
                </p>
              </div>

              {user ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 max-w-md mx-auto space-y-1.5 text-left">
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">{t.registration.googleAccountConnected}</p>
                  <p className="font-black text-[#08143A] dark:text-white">{user.displayName || 'Google User'}</p>
                  <p className="text-xs text-[#273656] dark:text-[#CBD5E1] font-mono">{user.email}</p>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={signInWithGoogle}
                    className="px-6 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] shadow-md inline-flex items-center gap-2 uppercase tracking-wider text-sm"
                  >
                    <User className="w-5 h-5" />
                    <span>{t.nav.signIn}</span>
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
                  <span>{t.common.next}</span>
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
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={lang === 'bn' ? '১০ সংখ্যার মোবাইল নম্বর' : '10-digit Phone Number'}
                    value={teamPhone}
                    onChange={(e) => setTeamPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                    {t.registration.emergencyPhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]"
                  />
                </div>
              </div>

              {/* Dynamic Players Squad List */}
              <div className="pt-4 border-t border-[#cbd9ec] dark:border-[#1d3575] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-[#08143A] dark:text-white text-base">
                      {t.registration.playersSection} ({players.length} {lang === 'bn' ? 'জন' : 'Players'})
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      {lang === 'bn'
                        ? `নূন্যতম ${event?.minPlayers || 11} জন এবং সর্বোচ্চ ${event?.maxPlayers || 15} জন`
                        : `Minimum ${event?.minPlayers || 11} and maximum ${event?.maxPlayers || 15} players`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    disabled={players.length >= (event?.maxPlayers || 15)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-[#19398A] text-white hover:bg-[#122b6a] disabled:opacity-40 flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.registration.addPlayer}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {players.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-black text-[#64748B] dark:text-[#94A3B8] text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? `খেলোয়াড় ${idx + 1} এর পুরো নাম` : `Player ${idx + 1} Full Name`}
                        value={player.name}
                        onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white text-xs sm:text-sm font-semibold focus:border-[#F26522]"
                      />
                      {idx >= (event?.minPlayers || 11) && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                    !teamName ||
                    !teamAddress ||
                    !teamPhone ||
                    players.slice(0, event?.minPlayers || 11).some((p) => !p.name.trim()) ||
                    Boolean(
                      event?.customFields &&
                        event.customFields.some((f) => f.required && !customFieldValues[f.id])
                    )
                  }
                  onClick={() => setStep(4)}
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

              <div className="flex justify-between pt-6 border-t border-[#cbd9ec] dark:border-[#1d3575]">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#08143A] dark:text-[#CBD5E1] hover:bg-[#e6eef8] dark:hover:bg-[#112766]"
                >
                  ← {t.common.back}
                </button>
                <button
                  disabled={submitting || !screenshotUrl}
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
