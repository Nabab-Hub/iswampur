'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent, FormFieldDefinition } from '@/types';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Save,
  ExternalLink,
  Layers,
  Eye,
  Shield,
  Coins,
  Users,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';

const DEFAULT_CRICKET_RULES_BN = `১. প্রতিটি দলে নূন্যতম ১১ জন এবং সর্বোচ্চ ১৫ জন খেলোয়াড়ের তালিকা প্রদান করতে হবে।
২. টসের নূন্যতম ৩০ মিনিট পূর্বে সম্পূর্ণ দলকে মাঠে উপস্থিত ও রিপোর্ট করতে হবে।
৩. শুধুমাত্র অনুমোদিত টিম পাস প্রদর্শনকারী দলই মাঠে প্রবেশের অধিকার পাবে।
৪. আম্পায়ার ও টুর্নামেন্ট পরিচালনা কমিটির সিদ্ধান্তই চূড়ান্ত ও অলঙ্ঘনীয়।
৫. ম্যাচ চলাকালীন যেকোনো বিশৃঙ্খলা বা অসদাচরণের দায়ে দল অবিলম্বে বাতিল বলে গণ্য হবে।
৬. নির্ধারিত সময়ের মধ্যে রেজিস্ট্রেশন ফি জমা দিয়ে ভেরিফায়েড UTR নম্বর প্রদান বাধ্যতামূলক।`;

const DEFAULT_CRICKET_RULES_EN = `1. Each registered squad must have a minimum of 11 and a maximum of 15 players.
2. The entire team must report to the ground match desk at least 30 minutes prior to scheduled toss.
3. Only teams possessing the cryptographically verified official team pass are permitted on the ground.
4. The umpires' and tournament organizing committee's decisions are final and binding.
5. Any misconduct or unsporting behavior will lead to immediate disqualification without fee refund.
6. Registration fee must be fully settled with a valid bank UTR transaction receipt before confirmation.`;

export default function FormBuilderPage() {
  const { lang, resolveBilingual } = useLanguage();

  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Form Configuration State
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [regEnabled, setRegEnabled] = useState(true);
  const [regStartDate, setRegStartDate] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [regFee, setRegFee] = useState<number>(1500);
  const [minPlayers, setMinPlayers] = useState<number>(11);
  const [maxPlayers, setMaxPlayers] = useState<number>(15);
  const [maxTeams, setMaxTeams] = useState<number>(16);

  // Rules & Regulations State
  const [rulesBn, setRulesBn] = useState(DEFAULT_CRICKET_RULES_BN);
  const [rulesEn, setRulesEn] = useState(DEFAULT_CRICKET_RULES_EN);
  const [rulesVersion, setRulesVersion] = useState('2026.1');

  // Custom Fields State
  const [customFields, setCustomFields] = useState<FormFieldDefinition[]>([]);

  // Add Field Input State
  const [newLabelBn, setNewLabelBn] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newType, setNewType] = useState<FormFieldDefinition['type']>('text');
  const [newPlaceholderBn, setNewPlaceholderBn] = useState('');
  const [newPlaceholderEn, setNewPlaceholderEn] = useState('');
  const [newOptionsStr, setNewOptionsStr] = useState('');
  const [newRequired, setNewRequired] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'accessibility' | 'rules' | 'fields' | 'preview'>('accessibility');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch('/api/events');
        if (res.ok) {
          const data: VillageEvent[] = await res.json();
          setEvents(data);

          // Find IPL 2026 or default to first event
          const defaultEvent =
            data.find((e) => e.slug === 'iswampur-premier-league-2026') || data[0];

          if (defaultEvent) {
            setSelectedEventId(defaultEvent.id);
            populateFormFromEvent(defaultEvent);
          }
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  const populateFormFromEvent = (ev: VillageEvent) => {
    setIsCreatingNew(false);
    setTitleBn(ev.title?.bn || '');
    setTitleEn(ev.title?.en || '');
    setSlug(ev.slug || '');
    setRegEnabled(ev.registrationEnabled ?? true);
    setRegStartDate(ev.registrationStartDate ? ev.registrationStartDate.slice(0, 16) : '');
    setRegDeadline(ev.registrationDeadline ? ev.registrationDeadline.slice(0, 16) : '');
    setRegFee(ev.registrationFee ?? 1500);
    setMinPlayers(ev.minPlayers ?? 11);
    setMaxPlayers(ev.maxPlayers ?? 15);
    setMaxTeams(ev.maxTeams ?? 16);
    setRulesBn(ev.rules?.bn || DEFAULT_CRICKET_RULES_BN);
    setRulesEn(ev.rules?.en || DEFAULT_CRICKET_RULES_EN);
    setRulesVersion(ev.rulesVersion || '2026.1');
    setCustomFields(ev.customFields || []);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      populateFormFromEvent(ev);
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedEventId('');
    setTitleBn('');
    setTitleEn('');
    setSlug(`tournament-${Date.now().toString().slice(-4)}`);
    setRegEnabled(true);
    setRegStartDate(new Date().toISOString().slice(0, 16));
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setRegDeadline(nextMonth.toISOString().slice(0, 16));
    setRegFee(1000);
    setMinPlayers(11);
    setMaxPlayers(15);
    setMaxTeams(16);
    setRulesBn(DEFAULT_CRICKET_RULES_BN);
    setRulesEn(DEFAULT_CRICKET_RULES_EN);
    setRulesVersion('2026.1');
    setCustomFields([]);
  };

  // Add Custom Field
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelBn.trim()) {
      alert(lang === 'bn' ? 'ফিল্ডের বাংলা নাম লিখুন' : 'Please provide Bengali label');
      return;
    }

    const options =
      newType === 'select'
        ? newOptionsStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: FormFieldDefinition = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `field_${Date.now()}`,
      label: {
        bn: newLabelBn.trim(),
        en: newLabelEn.trim() || newLabelBn.trim(),
      },
      placeholder:
        newPlaceholderBn.trim() || newPlaceholderEn.trim()
          ? {
              bn: newPlaceholderBn.trim() || newPlaceholderEn.trim(),
              en: newPlaceholderEn.trim() || newPlaceholderBn.trim(),
            }
          : undefined,
      type: newType,
      options,
      required: newRequired,
      order: customFields.length + 1,
    };

    setCustomFields([...customFields, newField]);
    setNewLabelBn('');
    setNewLabelEn('');
    setNewPlaceholderBn('');
    setNewPlaceholderEn('');
    setNewOptionsStr('');
    setNewType('text');
    setNewRequired(false);
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customFields.length) return;
    const copy = [...customFields];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setCustomFields(copy);
  };

  // Save changes to Firebase / Database
  const handleSaveForm = async () => {
    if (!titleBn.trim() || !slug.trim()) {
      setErrorMessage(
        lang === 'bn'
          ? 'অনুগ্রহ করে ফর্ম/টুর্নামেন্টের শিরোনাম এবং স্ল্যাগ পূরণ করুন।'
          : 'Please provide form title and unique URL slug.'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSavedSuccess(false);

    try {
      const payload = {
        title: { bn: titleBn.trim(), en: titleEn.trim() || titleBn.trim() },
        slug: slug.trim().toLowerCase(),
        registrationEnabled: regEnabled,
        registrationStartDate: regStartDate ? new Date(regStartDate).toISOString() : undefined,
        registrationDeadline: regDeadline ? new Date(regDeadline).toISOString() : undefined,
        registrationFee: Number(regFee) || 0,
        minPlayers: Number(minPlayers) || 11,
        maxPlayers: Number(maxPlayers) || 15,
        maxTeams: Number(maxTeams) || 16,
        rules: { bn: rulesBn.trim(), en: rulesEn.trim() },
        rulesVersion: rulesVersion.trim() || '2026.1',
        customFields,
      };

      let res;
      if (isCreatingNew) {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            shortDescription: {
              bn: `${titleBn.trim()} এর অনলাইন নিবন্ধন`,
              en: `Online registration for ${titleEn.trim() || titleBn.trim()}`,
            },
            fullDescription: {
              bn: `${titleBn.trim()} এর সকল নিয়মাবলী ও অনলাইন রেজিস্ট্রেশন তথ্য।`,
              en: `All tournament guidelines and online registration info.`,
            },
            category: 'cricket',
            startDate: new Date().toISOString().split('T')[0],
            venue: {
              bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ',
              en: 'Iswampur Central Sports Ground',
            },
          }),
        });
      } else {
        res = await fetch(`/api/events/${selectedEventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save form configuration');
      }

      const savedData = await res.json();
      setSavedSuccess(true);
      if (isCreatingNew) {
        setIsCreatingNew(false);
        setSelectedEventId(savedData.id);
        setEvents([savedData, ...events]);
      } else {
        setEvents(events.map((e) => (e.id === savedData.id ? savedData : e)));
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving form builder:', err);
      setErrorMessage(err.message || 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Remaining days calculation
  const getAccessibilityInfo = () => {
    if (!regEnabled) {
      return {
        status: 'closed',
        badge: lang === 'bn' ? 'নিবন্ধন বর্তমানে বন্ধ' : 'Registration Closed',
        color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      };
    }

    const now = new Date();
    if (regStartDate && new Date(regStartDate) > now) {
      const diffMs = new Date(regStartDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        badge:
          lang === 'bn'
            ? `আসন্ন — আর ${diffDays} দিন পর চালু হবে`
            : `Upcoming — Opens in ${diffDays} days`,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      };
    }

    if (regDeadline) {
      const diffMs = new Date(regDeadline).getTime() - now.getTime();
      if (diffMs < 0) {
        return {
          status: 'expired',
          badge: lang === 'bn' ? 'সময়সীমা উত্তীর্ণ হয়েছে' : 'Registration Deadline Expired',
          color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
        };
      }
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      return {
        status: 'active',
        badge:
          lang === 'bn'
            ? `চলমান — আর ${diffDays} দিন ${diffHours} ঘণ্টা বাকি`
            : `Active — ${diffDays}d ${diffHours}h remaining`,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      };
    }

    return {
      status: 'active',
      badge: lang === 'bn' ? 'সক্রিয় (নির্দিষ্ট শেষ তারিখ নেই)' : 'Active (No Deadline Set)',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    };
  };

  const accessInfo = getAccessibilityInfo();

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-[#F26522] to-[#F9A01B] text-white shadow-sm">
                <Sliders className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {lang === 'bn' ? 'রেজিস্ট্রেশন ফর্ম ও রুলস বিল্ডার' : 'Registration Form & Rules Builder'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'টুর্নামেন্ট বা ইভেন্টের জন্য কাস্টম ফর্ম তৈরি করুন, অ্যাক্সেসিবিলিটি সময়সীমা ও নিয়মাবলী (Rules) পরিবর্তন করুন।'
                : 'Configure registration forms, custom input fields, accessibility windows, and tournament rules.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingNew && slug && (
              <Link
                href={`/register/${slug}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#071333] hover:border-[#F26522] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>{lang === 'bn' ? 'লাইভ ফর্ম দেখুন' : 'View Public Form'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F26522]" />
              </Link>
            )}

            <button
              onClick={handleSaveForm}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-[#F26522]/20 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : lang === 'bn' ? 'ফর্ম সংরক্ষণ করুন' : 'Save Form'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-scale-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>
              {lang === 'bn'
                ? '✓ ফর্ম কনফিগারেশন, অ্যাক্সেসিবিলিটি সময়সীমা এবং নিয়মাবলী সফলভাবে সংরক্ষিত হয়েছে!'
                : '✓ Form configuration, accessibility dates, and tournament rules have been saved successfully!'}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-scale-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Event Selector / Creator Switcher */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {lang === 'bn' ? 'ফর্ম / টুর্নামেন্ট নির্বাচন করুন:' : 'Select Form / Event:'}
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                disabled={isCreatingNew}
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-[#1d3575] bg-slate-50 dark:bg-[#040d21] text-slate-800 dark:text-white disabled:opacity-50"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {resolveBilingual(ev.title)} ({ev.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingNew ? (
              <button
                type="button"
                onClick={handleStartCreateNew}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#19398A] text-white hover:bg-[#122b6a] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নতুন টুর্নামেন্ট ফর্ম তৈরি' : 'Create New Form'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const ev = events.find((e) => e.id === selectedEventId) || events[0];
                  if (ev) populateFormFromEvent(ev);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#1d3575] gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'accessibility'
                ? 'border-b-2 border-[#F26522] text-[#F26522] dark:text-[#F9A01B] bg-white dark:bg-[#071333]'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{lang === 'bn' ? '১. অ্যাক্সেসিবিলিটি ও সময়সীমা' : '1. Accessibility & Schedule'}</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-b-2 border-[#F26522] text-[#F26522] dark:text-[#F9A01B] bg-white dark:bg-[#071333]'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{lang === 'bn' ? '২. নিয়ম ও শর্তাবলী (Rules)' : '2. Rules & Regulations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fields'
                ? 'border-b-2 border-[#F26522] text-[#F26522] dark:text-[#F9A01B] bg-white dark:bg-[#071333]'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'bn' ? `৩. ডাইনামিক ফিল্ডসমূহ (${customFields.length})` : `3. Custom Fields (${customFields.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-b-2 border-[#F26522] text-[#F26522] dark:text-[#F9A01B] bg-white dark:bg-[#071333]'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{lang === 'bn' ? '৪. লাইভ ফর্ম প্রিভিউ' : '4. Live Form Preview'}</span>
          </button>
        </div>

        {/* TAB 1: ACCESSIBILITY & DATES */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            {/* Live Accessibility Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs font-bold ${accessInfo.color}`}>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>
                  {lang === 'bn' ? 'বর্তমান অ্যাক্সেসিবিলিটি স্ট্যাটাস:' : 'Current Accessibility Status:'}{' '}
                  <span className="font-extrabold">{accessInfo.badge}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono">
                  {slug ? `/register/${slug}` : ''}
                </span>
              </div>
            </div>

            {/* Basic Info & Slug */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <FileText className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'ফর্মের প্রাথমিক বিবরণ' : 'Basic Form Identification'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'টুর্নামেন্ট / ইভেন্টের নাম (বাংলা) *' : 'Event / Form Title (Bengali) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'টুর্নামেন্টের নাম (English)' : 'Event / Form Title (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Iswampur Premier League 2026"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ইউআরএল স্ল্যাগ (URL Slug - ফর্মের ওয়েব ঠিকানা) *' : 'URL Slug (Registration Web Address) *'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs border border-slate-200 dark:border-slate-700">
                      /register/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="iswampur-premier-league-2026"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Windows & Dates */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <Clock className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'কত দিন ফর্মটি অ্যাক্সেসিবল থাকবে (Accessibility Schedule)' : 'Accessibility Window & Timers'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Registration Enabled Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-slate-200 dark:border-[#1d3575] flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {lang === 'bn' ? 'অনলাইন নিবন্ধন চালু রাখুন' : 'Registration Access'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {lang === 'bn'
                        ? 'এটি বন্ধ রাখলে সময় থাকা সত্ত্বেও কেউ নতুন নিবন্ধন করতে পারবে না।'
                        : 'Master toggle to temporarily close or open registration.'}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRegEnabled(!regEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        regEnabled ? 'bg-[#F26522]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          regEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="font-bold text-xs">
                      {regEnabled
                        ? lang === 'bn'
                          ? 'সক্রিয় (Open)'
                          : 'Enabled'
                        : lang === 'bn'
                        ? 'বন্ধ (Closed)'
                        : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-slate-200 dark:border-[#1d3575] space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                    {lang === 'bn' ? 'নিবন্ধন শুরুর তারিখ ও সময়' : 'Registration Opens On'}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'bn'
                      ? 'এই তারিখের পূর্বে ফর্ম অ্যাক্সেস করলে "Registration Opens Soon" দেখাবে।'
                      : 'Form will not accept teams before this date.'}
                  </p>
                  <input
                    type="datetime-local"
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold"
                  />
                </div>

                {/* Deadline */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-slate-200 dark:border-[#1d3575] space-y-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-[#F26522]" />
                    {lang === 'bn' ? 'নিবন্ধনের শেষ তারিখ ও সময় (Deadline) *' : 'Registration Deadline *'}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'bn'
                      ? 'এই সময় পার হলে স্বয়ংক্রিয়ভাবে ফর্ম সাবমিশন বন্ধ হয়ে যাবে।'
                      : 'Form submission automatically closes at this time.'}
                  </p>
                  <input
                    type="datetime-local"
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* Tournament Fee & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    <Coins className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                    {lang === 'bn' ? 'নিবন্ধন ফি (টাকা/INR)' : 'Entry Fee (INR)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={regFee}
                    onChange={(e) => setRegFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                    {lang === 'bn' ? 'নূন্যতম খেলোয়াড় সংখ্যা' : 'Min Players'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                    {lang === 'bn' ? 'সর্বোচ্চ খেলোয়াড় সংখ্যা' : 'Max Players'}
                  </label>
                  <input
                    type="number"
                    min={minPlayers}
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'সর্বোচ্চ দল সংখ্যা (Slot Cap)' : 'Max Teams Limit'}
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RULES & REGULATIONS */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F26522]" />
                  <span>{lang === 'bn' ? 'টুর্নামেন্টের নিয়ম ও শর্তাবলী (Rules & Regulations Editor)' : 'Tournament Rules & Regulations'}</span>
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">{lang === 'bn' ? 'সংস্করণ:' : 'Version:'}</span>
                  <input
                    type="text"
                    value={rulesVersion}
                    onChange={(e) => setRulesVersion(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRulesBn(DEFAULT_CRICKET_RULES_BN);
                    setRulesEn(DEFAULT_CRICKET_RULES_EN);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-slate-50 dark:bg-[#0c1a40] text-slate-700 dark:text-slate-300 font-bold hover:border-[#F26522] transition-colors"
                >
                  {lang === 'bn' ? '🏏 আইপিএল ক্রিকেট স্ট্যান্ডার্ড নিয়ম লোড করুন' : 'Load Standard Cricket Rules'}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? 'নিয়ম ও নির্দেশিকা (বাংলায়) *' : 'Rules and Regulations (Bengali) *'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {lang === 'bn' ? 'রেজিস্ট্রেশনের সময় ১ম ধাপে প্রদর্শিত হবে' : 'Shown in Step 1 of Registration'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={rulesBn}
                    onChange={(e) => setRulesBn(e.target.value)}
                    placeholder="১. প্রতিটি দলে নূন্যতম ১১ জন..."
                    className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? 'Rules & Regulations (English)' : 'Rules and Regulations (English)'}
                    </label>
                  </div>
                  <textarea
                    rows={7}
                    value={rulesEn}
                    onChange={(e) => setRulesEn(e.target.value)}
                    placeholder="1. Each registered squad must have..."
                    className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM FORM FIELDS */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            {/* Standard Core Fields Reference */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-blue-600" />
                {lang === 'bn' ? 'স্বয়ংক্রিয় মৌলিক ফিল্ডসমূহ (Default Core Fields):' : 'Pre-configured Core Fields:'}
              </p>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-1">
                {lang === 'bn'
                  ? 'দলের নাম, দল প্রতিনিধির নাম, মোবাইল নম্বর, ইমেইল, জরুরি ফোন নম্বর, খেলোয়াড়দের নাম (১১-১৫ জন) এবং পেমেন্ট UTR ও স্ক্রিনশট ফিল্ড ফর্মটিতে স্বয়ংক্রিয়ভাবে সক্রিয় রয়েছে।'
                  : 'Team Name, Representative, Mobile, Email, Emergency Contact, Players Roster (11-15), and UPI UTR & Payment Screenshot are automatically enabled.'}
              </p>
            </div>

            {/* List of Custom Fields */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white border-b pb-3 border-slate-100 dark:border-[#1d3575] flex items-center justify-between">
                <span>
                  {lang === 'bn'
                    ? `অতিরিক্ত কাস্টম ফিল্ডসমূহ (${customFields.length} টি)`
                    : `Configured Custom Fields (${customFields.length})`}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  {lang === 'bn' ? 'ধাপ ৩-এ প্রদর্শিত হবে' : 'Appears in Step 3 of Registration'}
                </span>
              </h3>

              {customFields.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold">
                    {lang === 'bn'
                      ? 'এখনো কোনো অতিরিক্ত কাস্টম ফিল্ড যোগ করা হয়নি। নিচে নতুন ফিল্ড যোগ করতে পারেন।'
                      : 'No additional custom fields added yet. Add custom questions below.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customFields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200/80 dark:border-[#1d3575]/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {resolveBilingual(f.label)}{' '}
                            <span className="text-slate-400 font-normal">
                              ({lang === 'bn' ? f.label.en : f.label.bn})
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {lang === 'bn' ? 'টাইপ:' : 'Type:'}{' '}
                              <span className="font-mono text-[#F26522] uppercase font-bold">{f.type}</span>
                            </span>
                            <span>•</span>
                            {f.required ? (
                              <span className="text-rose-500 font-bold">
                                {lang === 'bn' ? 'বাধ্যতামূলক (Required)' : 'Required'}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">
                                {lang === 'bn' ? 'ঐচ্ছিক (Optional)' : 'Optional'}
                              </span>
                            )}
                            {f.options && f.options.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="truncate">
                                  {lang === 'bn' ? 'অপশন:' : 'Options:'} {f.options.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, 'up')}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === customFields.length - 1}
                          onClick={() => handleMoveField(idx, 'down')}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-1"
                          title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Custom Field Form */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4 shadow-sm">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white border-b pb-3 border-slate-100 dark:border-[#1d3575] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'নতুন কাস্টম ফিল্ড যোগ করুন' : 'Add New Custom Form Field'}</span>
              </h3>

              <form onSubmit={handleAddCustomField} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'ফিল্ডের নাম (বাংলা লেবেল) *' : 'Field Label (Bengali) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'bn' ? 'উদাঃ জার্সির মাপ / অতিরিক্ত নোট' : 'e.g. Jersey Size'}
                      value={newLabelBn}
                      onChange={(e) => setNewLabelBn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Field Label (English)' : 'Field Label (English)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jersey Size / Additional Notes"
                      value={newLabelEn}
                      onChange={(e) => setNewLabelEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'ফিল্ডের ইনপুট টাইপ (Input Type)' : 'Field Type'}
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="text">{lang === 'bn' ? 'Text (এক লাইনের টেক্সট)' : 'Text (Single line)'}</option>
                      <option value="number">{lang === 'bn' ? 'Number (সংখ্যা)' : 'Number'}</option>
                      <option value="phone">{lang === 'bn' ? 'Phone (মোবাইল নম্বর)' : 'Phone Number'}</option>
                      <option value="email">{lang === 'bn' ? 'Email (ইমেইল)' : 'Email'}</option>
                      <option value="textarea">{lang === 'bn' ? 'Textarea (প্যারাগ্রাফ / বড় বিবরণ)' : 'Textarea (Multi-line paragraph)'}</option>
                      <option value="select">{lang === 'bn' ? 'Dropdown (ড্রপডাউন অপশন তালিকা)' : 'Select Dropdown (List)'}</option>
                      <option value="checkbox">{lang === 'bn' ? 'Checkbox (চেকবক্স স্বীকৃতি)' : 'Checkbox'}</option>
                    </select>
                  </div>

                  {newType === 'select' && (
                    <div>
                      <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                        {lang === 'bn' ? 'ড্রপডাউন অপশনসমূহ (কমা দিয়ে লিখুন) *' : 'Dropdown Options (Comma separated) *'}
                      </label>
                      <input
                        type="text"
                        placeholder="M, L, XL, XXL"
                        value={newOptionsStr}
                        onChange={(e) => setNewOptionsStr(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  )}

                  <div className="pt-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={newRequired}
                        onChange={(e) => setNewRequired(e.target.checked)}
                        className="w-4 h-4 rounded text-[#F26522] focus:ring-[#F26522]"
                      />
                      <span>
                        {lang === 'bn'
                          ? 'পূরণ করা বাধ্যতামূলক (Required Field)'
                          : 'Mandatory / Required Field'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ফিল্ড যোগ করুন' : 'Add Custom Field'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE FORM PREVIEW */}
        {activeTab === 'preview' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#1d3575]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Eye className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'ব্যবহারকারীদের জন্য ফর্ম প্রিভিউ' : 'Applicant View Preview'}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F26522]/15 text-[#F26522] font-black uppercase">
                {accessInfo.badge}
              </span>
            </div>

            {/* Simulated Step 1: Rules & Regulations */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-slate-200 dark:border-[#1d3575] space-y-3">
              <h4 className="font-black text-sm text-[#08143A] dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F26522]" />
                <span>{lang === 'bn' ? 'ধাপ ১: টুর্নামেন্টের নিয়ম ও শর্তাবলী (Rules & Regulations)' : 'Step 1: Rules & Regulations'}</span>
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300 font-medium max-h-60 overflow-y-auto">
                {lang === 'bn' ? rulesBn : rulesEn}
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked readOnly className="w-4 h-4 text-[#F26522] rounded" />
                <span>{lang === 'bn' ? 'আমি সকল নিয়ম ও শর্তাবলী পড়েছি এবং মেনে নিতে সম্মত।' : 'I have read and accept all rules.'}</span>
              </label>
            </div>

            {/* Simulated Step 3: Custom Form Fields */}
            {customFields.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-slate-200 dark:border-[#1d3575] space-y-4">
                <h4 className="font-black text-sm text-[#08143A] dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F26522]" />
                  <span>{lang === 'bn' ? 'ধাপ ৩: অতিরিক্ত কাস্টম ফিল্ড প্রিভিউ' : 'Step 3: Custom Fields Preview'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {customFields.map((field) => (
                    <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                        {resolveBilingual(field.label)} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          disabled
                          placeholder={field.placeholder ? resolveBilingual(field.placeholder) : ''}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400"
                          rows={2}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          disabled
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400"
                        >
                          <option>{lang === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}</option>
                          {field.options?.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          disabled
                          type="text"
                          placeholder={field.placeholder ? resolveBilingual(field.placeholder) : ''}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Bottom Bar for Fast Saving */}
        <div className="sticky bottom-4 p-4 rounded-2xl bg-white/95 dark:bg-[#071333]/95 backdrop-blur-md border border-slate-200 dark:border-[#1d3575] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>{lang === 'bn' ? 'নির্বাচিত ফরম:' : 'Active Form:'}</span>
            <span className="text-[#F26522] font-black">{titleBn || slug || 'None'}</span>
          </div>

          <button
            onClick={handleSaveForm}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-[#F26522]/20 hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Form Changes'}</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
