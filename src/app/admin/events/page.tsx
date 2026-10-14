'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent, FormFieldDefinition, EventFormPresets } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Trophy,
  X,
  Check,
  Loader2,
  Sliders,
  Sparkles,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Layers,
  ShieldCheck,
  FileText,
  Users,
  User,
  CreditCard,
  Clock,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Shirt,
  Info,
  Search,
  Filter,
  Eye,
  CheckSquare,
  Link as LinkIcon,
  Save,
  Globe,
  Upload,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const DEFAULT_CRICKET_RULES_BN = `১. প্রতিটি দলে নূন্যতম ১১ জন এবং সর্বোচ্চ ১৫ জন খেলোয়াড়ের তালিকা প্রদান করতে হবে।
২. টসের নূন্যতম ৩০ মিনিট পূর্বে সম্পূর্ণ দলকে মাঠে উপস্থিত হয়ে রিপোর্ট করতে হবে।
৩. শুধুমাত্র ভেরিফায়েড অফিশিয়াল টিম পাস প্রদর্শনকারী দলই মাঠে প্রবেশের অধিকার পাবে।
৪. আম্পায়ার ও টুর্নামেন্ট পরিচালনা কমিটির সিদ্ধান্তই চূড়ান্ত ও অলঙ্ঘনীয়।
৫. নির্ধারিত সময়ের মধ্যে রেজিস্ট্রেশন ফি জমা দিয়ে ভেরিফায়েড UTR নম্বর প্রদান বাধ্যতামূলক।`;

const DEFAULT_CRICKET_RULES_EN = `1. Each registered squad must have a minimum of 11 and a maximum of 15 players.
2. The entire team must report to the ground match desk at least 30 minutes prior to scheduled toss.
3. Only teams possessing the verified official team pass are permitted on the ground.
4. The umpires' and tournament committee's decisions are final and binding.
5. Registration fee must be settled with a valid bank UTR receipt before confirmation.`;

const DEFAULT_FORM_PRESETS: EventFormPresets = {
  participationType: 'team',
  requireTeamName: true,
  requireCaptain: true,
  requirePhone: true,
  requireWhatsApp: true,
  requireEmail: true,
  requireAddress: true,
  requireEmergencyContact: true,
  requireSquad: true,
  requireJerseySize: true,
  requireAgeGroup: false,
  requirePaymentProof: true,
  requireIdProof: false,
  requireNotes: false,
};

type ModalTab = 'basic' | 'registration' | 'form_builder' | 'rules';

export default function AdminEventsPage() {
  const { user } = useAuth();
  const { lang, resolveBilingual } = useLanguage();
  const toast = useToast();

  const isSuperAdmin = Boolean(
    user && user.email?.toLowerCase().trim() === 'skahidulla568@gmail.com'
  );

  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'EXPIRED'>('ALL');

  // Modal & Tab States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VillageEvent | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('basic');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tab 1: Basic Info & Lifecycle
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [shortDescBn, setShortDescBn] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [fullDescBn, setFullDescBn] = useState('');
  const [fullDescEn, setFullDescEn] = useState('');
  const [category, setCategory] = useState<VillageEvent['category']>('cricket');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venueBn, setVenueBn] = useState('');
  const [venueEn, setVenueEn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showInHero, setShowInHero] = useState(false);
  const [published, setPublished] = useState(true);

  // Tab 2: Registration & Limits (With Calendar Pickers)
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [registrationStartDate, setRegistrationStartDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [maxTeams, setMaxTeams] = useState<number>(16);

  // Tab 3: Form Presets & Checkboxes
  const [formPresets, setFormPresets] = useState<EventFormPresets>(DEFAULT_FORM_PRESETS);
  const [minPlayers, setMinPlayers] = useState<number>(11);
  const [maxPlayers, setMaxPlayers] = useState<number>(15);

  // Tab 3: Dynamic Custom Fields Builder
  const [customFields, setCustomFields] = useState<FormFieldDefinition[]>([]);
  const [newLabelBn, setNewLabelBn] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newType, setNewType] = useState<FormFieldDefinition['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newPlaceholderBn, setNewPlaceholderBn] = useState('');
  const [newPlaceholderEn, setNewPlaceholderEn] = useState('');
  const [newOptionsStr, setNewOptionsStr] = useState('');

  // Tab 4: Rules & Regulations
  const [rulesBn, setRulesBn] = useState(DEFAULT_CRICKET_RULES_BN);
  const [rulesEn, setRulesEn] = useState(DEFAULT_CRICKET_RULES_EN);
  const [rulesVersion, setRulesVersion] = useState('2026.1');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Quick category-based sensible presets
  const applyCategoryDefaults = (cat: VillageEvent['category']) => {
    if (cat === 'cricket' || cat === 'sports') {
      setFormPresets((prev) => ({
        ...prev,
        participationType: 'team',
        requireTeamName: true,
        requireCaptain: true,
        requirePhone: true,
        requireWhatsApp: true,
        requireEmail: true,
        requireAddress: true,
        requireSquad: true,
        requireJerseySize: true,
        requirePaymentProof: true,
      }));
      setMinPlayers(cat === 'cricket' ? 11 : 7);
      setMaxPlayers(cat === 'cricket' ? 15 : 12);
      setRegistrationFee(cat === 'cricket' ? 1500 : 800);
      setRulesBn(DEFAULT_CRICKET_RULES_BN);
      setRulesEn(DEFAULT_CRICKET_RULES_EN);
    } else if (cat === 'cultural' || cat === 'festival') {
      setFormPresets((prev) => ({
        ...prev,
        participationType: 'both',
        requireTeamName: true,
        requireCaptain: true,
        requirePhone: true,
        requireWhatsApp: true,
        requireEmail: true,
        requireAddress: true,
        requireSquad: false,
        requireJerseySize: false,
        requirePaymentProof: false,
      }));
      setMinPlayers(1);
      setMaxPlayers(10);
      setRegistrationFee(0);
      setRulesBn('১. সকল প্রতিযোগী ও শিল্পীদের অনুষ্ঠানের দিন নির্ধারিত সময়ের পূর্বে মঞ্চে উপস্থিত থাকতে হবে।\n২. শৃঙ্খলা বজায় রাখা ও অনুষ্ঠান কর্তৃপক্ষের নির্দেশনা মেনে চলা বাধ্যতামূলক।');
      setRulesEn('1. All participants and artists must report to the backstage coordinator prior to scheduled time.\n2. Maintaining decorum and honoring stage guidelines is strictly mandatory.');
    } else {
      setFormPresets((prev) => ({
        ...prev,
        participationType: 'individual',
        requireTeamName: false,
        requireCaptain: true,
        requirePhone: true,
        requireWhatsApp: false,
        requireEmail: true,
        requireAddress: true,
        requireSquad: false,
        requireJerseySize: false,
        requirePaymentProof: false,
      }));
      setMinPlayers(1);
      setMaxPlayers(1);
      setRegistrationFee(0);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setActiveTab('basic');
    setTitleBn('');
    setTitleEn('');
    setSlug(`event-${Date.now().toString().slice(-6)}`);
    setStatus('published');
    setShortDescBn('');
    setShortDescEn('');
    setFullDescBn('');
    setFullDescEn('');
    setCategory('cricket');
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
    setVenueBn('ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ');
    setVenueEn('Iswampur Central Sports Ground');
    setCoverImage('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80');
    setShowInHero(false);
    setPublished(true);

    setRegistrationEnabled(true);
    setRegistrationStartDate(today);
    setRegistrationDeadline('2026-12-15T23:59:59.000Z');
    setRegistrationFee(1500);
    setMaxTeams(16);

    setFormPresets({ ...DEFAULT_FORM_PRESETS });
    setMinPlayers(11);
    setMaxPlayers(15);
    setCustomFields([]);

    setRulesBn(DEFAULT_CRICKET_RULES_BN);
    setRulesEn(DEFAULT_CRICKET_RULES_EN);
    setRulesVersion('2026.1');

    setIsModalOpen(true);
  };

  const openEditModal = (ev: VillageEvent) => {
    setEditingEvent(ev);
    setActiveTab('basic');
    setTitleBn(ev.title?.bn || '');
    setTitleEn(ev.title?.en || '');
    setSlug(ev.slug || `event-${Date.now().toString().slice(-6)}`);
    setStatus(ev.status === 'draft' || ev.published === false ? 'draft' : 'published');
    setShortDescBn(ev.shortDescription?.bn || '');
    setShortDescEn(ev.shortDescription?.en || '');
    setFullDescBn(ev.fullDescription?.bn || '');
    setFullDescEn(ev.fullDescription?.en || '');
    setCategory(ev.category || 'sports');
    setStartDate(ev.startDate || '');
    setEndDate(ev.endDate || ev.startDate || '');
    setVenueBn(ev.venue?.bn || '');
    setVenueEn(ev.venue?.en || '');
    setCoverImage(ev.coverImage || '');
    setShowInHero(Boolean(ev.showInHero));
    setPublished(ev.published !== false && ev.status !== 'draft');

    setRegistrationEnabled(Boolean(ev.registrationEnabled));
    setRegistrationStartDate(ev.registrationStartDate ? ev.registrationStartDate.slice(0, 10) : '');
    setRegistrationDeadline(ev.registrationDeadline || '');
    setRegistrationFee(ev.registrationFee ?? 0);
    setMaxTeams(ev.maxTeams || 16);

    setFormPresets({
      ...DEFAULT_FORM_PRESETS,
      ...(ev.formPresets || {}),
    });
    setMinPlayers(ev.minPlayers || 11);
    setMaxPlayers(ev.maxPlayers || 15);
    setCustomFields(Array.isArray(ev.customFields) ? ev.customFields : []);

    setRulesBn(ev.rules?.bn || DEFAULT_CRICKET_RULES_BN);
    setRulesEn(ev.rules?.en || DEFAULT_CRICKET_RULES_EN);
    setRulesVersion(ev.rulesVersion || '2026.1');

    setIsModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning(lang === 'bn' ? 'ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট হতে হবে' : 'File must be under 10MB');
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'iswampur_events');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        toast.success(lang === 'bn' ? 'কভার ছবি সফলভাবে আপলোড হয়েছে' : 'Cover image uploaded successfully');
      } else {
        toast.error(data.error || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'));
      }
    } catch (err: any) {
      toast.error('Upload error: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Custom Field Builder Operations
  const handleAddCustomField = () => {
    if (!newLabelBn.trim() && !newLabelEn.trim()) {
      toast.warning(lang === 'bn' ? 'ফিল্ডের শিরোনাম লিখুন' : 'Please provide a field title/label');
      return;
    }

    const fieldId = `cf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const optionsArray =
      newType === 'select' && newOptionsStr.trim()
        ? newOptionsStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: FormFieldDefinition = {
      id: fieldId,
      name: fieldId,
      label: {
        bn: newLabelBn.trim() || newLabelEn.trim(),
        en: newLabelEn.trim() || newLabelBn.trim(),
      },
      type: newType,
      required: newRequired,
      placeholder: {
        bn: newPlaceholderBn.trim() || '',
        en: newPlaceholderEn.trim() || '',
      },
      options: optionsArray,
      order: customFields.length + 1,
    };

    setCustomFields([...customFields, newField]);
    setNewLabelBn('');
    setNewLabelEn('');
    setNewType('text');
    setNewRequired(false);
    setNewPlaceholderBn('');
    setNewPlaceholderEn('');
    setNewOptionsStr('');
    toast.success(lang === 'bn' ? 'কাস্টম ফিল্ড যোগ করা হয়েছে' : 'Custom field added');
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleMoveCustomField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= customFields.length) return;
    const updated = [...customFields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setCustomFields(updated);
  };

  const togglePresetField = (key: keyof EventFormPresets) => {
    setFormPresets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent, forceStatus?: 'published' | 'draft') => {
    e.preventDefault();

    if (!titleBn.trim() && !titleEn.trim()) {
      toast.warning(lang === 'bn' ? 'অনুষ্ঠানের নাম দেওয়া আবশ্যক' : 'Event title is required');
      setActiveTab('basic');
      return;
    }

    if (!startDate.trim()) {
      toast.warning(lang === 'bn' ? 'অনুষ্ঠানের তারিখ দেওয়া আবশ্যক' : 'Event date is required');
      setActiveTab('basic');
      return;
    }

    const finalStatus = forceStatus || status;
    const isPublished = finalStatus === 'published';
    const finalSlug = slug.trim() || generateSlug(titleEn || titleBn) || `event-${Date.now().toString().slice(-6)}`;

    const payload = {
      title: { bn: titleBn.trim(), en: titleEn.trim() || titleBn.trim() },
      slug: finalSlug,
      status: finalStatus,
      shortDescription: { bn: shortDescBn.trim(), en: shortDescEn.trim() },
      fullDescription: { bn: fullDescBn.trim(), en: fullDescEn.trim() },
      category,
      startDate: startDate.trim(),
      endDate: endDate.trim() || startDate.trim(),
      venue: { bn: venueBn.trim(), en: venueEn.trim() || venueBn.trim() },
      coverImage: coverImage.trim(),
      showInHero,
      published: isPublished,
      registrationEnabled,
      registrationStartDate: registrationStartDate.trim() || undefined,
      registrationDeadline: registrationDeadline.trim() || undefined,
      registrationFee: Number(registrationFee) || 0,
      maxTeams: Number(maxTeams) || 16,
      minPlayers: formPresets.requireSquad ? Number(minPlayers) || 1 : 1,
      maxPlayers: formPresets.requireSquad ? Number(maxPlayers) || 1 : 1,
      formPresets,
      customFields,
      rules: { bn: rulesBn.trim(), en: rulesEn.trim() },
      rulesVersion: rulesVersion.trim() || '1.0',
    };

    setIsSaving(true);
    try {
      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update event');
        toast.success(
          finalStatus === 'draft'
            ? (lang === 'bn' ? 'ইভেন্ট খসড়া (Draft) হিসেবে সংরক্ষিত হয়েছে' : 'Event saved as draft')
            : (lang === 'bn' ? 'অনুষ্ঠান সফলভাবে আপডেট করা হয়েছে' : 'Event updated successfully')
        );
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create event');
        toast.success(
          finalStatus === 'draft'
            ? (lang === 'bn' ? 'নতুন ইভেন্ট খসড়া (Draft) হিসেবে সংরক্ষিত হয়েছে' : 'New event saved as draft')
            : (lang === 'bn' ? 'নতুন অনুষ্ঠান ও ফর্ম সফলভাবে তৈরি হয়েছে' : 'New event and form created')
        );
      }

      setIsModalOpen(false);
      loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Error saving event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    if (!isSuperAdmin) {
      toast.error(
        lang === 'bn'
          ? 'অনুমতি নেই: শুধুমাত্র সুপারঅ্যাডমিন (skahidulla568@gmail.com) অনুষ্ঠান মুছে ফেলতে পারেন।'
          : 'Permission denied: Only Super Admin (skahidulla568@gmail.com) can delete events.'
      );
      setDeleteTargetId(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user?.email || '',
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      toast.success(
        lang === 'bn'
          ? 'অনুষ্ঠান এবং সংশ্লিষ্ট সমস্ত তথ্য (রেজিস্ট্রেশন, পাস, পোস্ট) সফলভাবে মুছে ফেলা হয়েছে'
          : 'Event and all associated data (registrations, passes, posts) deleted successfully'
      );
      setDeleteTargetId(null);
      loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting event');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to determine event lifecycle and status
  const getEventLifecycle = (ev: VillageEvent) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isExpired = Boolean(ev.endDate ? ev.endDate < todayStr : ev.startDate < todayStr);
    const isRegDeadlinePassed = ev.registrationDeadline
      ? new Date(ev.registrationDeadline).getTime() < Date.now()
      : false;
    const isDraft = ev.status === 'draft' || ev.published === false;
    const isActive = Boolean(ev.registrationEnabled && !isExpired && !isRegDeadlinePassed && !isDraft);

    return {
      isExpired,
      isRegDeadlinePassed,
      isDraft,
      isActive,
    };
  };

  // Filtering and ACTIVE FIRST Sorting
  const filteredEvents = events.filter((ev) => {
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ev.title?.bn?.toLowerCase().includes(q) ||
      ev.title?.en?.toLowerCase().includes(q) ||
      ev.venue?.bn?.toLowerCase().includes(q) ||
      ev.venue?.en?.toLowerCase().includes(q) ||
      ev.slug?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;

    const lifecycle = getEventLifecycle(ev);
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = lifecycle.isActive;
    else if (statusFilter === 'DRAFT') matchesStatus = lifecycle.isDraft;
    else if (statusFilter === 'EXPIRED') matchesStatus = lifecycle.isExpired || lifecycle.isRegDeadlinePassed;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // SORT ACTIVE EVENTS TO TOP
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aLife = getEventLifecycle(a);
    const bLife = getEventLifecycle(b);

    // 1. Active registration events always first
    if (aLife.isActive && !bLife.isActive) return -1;
    if (!aLife.isActive && bLife.isActive) return 1;

    // 2. Drafts can follow active but precede expired
    if (!aLife.isExpired && bLife.isExpired) return -1;
    if (aLife.isExpired && !bLife.isExpired) return 1;

    // 3. Chronological by start date descending
    return (b.startDate || '').localeCompare(a.startDate || '');
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অনুষ্ঠান ব্যবস্থাপনা' : 'Events Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'গ্রামের ক্রিকেট টুর্নামেন্ট, সাংস্কৃতিক উৎসব ও ডায়নামিক রেজিস্ট্রেশন ফর্ম কনফিগার করুন।'
                : 'Manage village festivals, tournaments, and tailor-made dynamic registration forms.'}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন অনুষ্ঠান যোগ করুন' : 'Create New Event'}</span>
          </button>
        </div>

        {/* Filter and Search Bar (Mobile-friendly) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'অনুষ্ঠানের নাম বা স্ল্যাগ দিয়ে খুঁজুন...' : 'Search event name or slug...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-slate-800 dark:text-white font-bold text-xs focus:border-[#F26522]"
            >
              <option value="ALL">{lang === 'bn' ? 'সকল স্ট্যাটাস (All Status)' : 'All Status'}</option>
              <option value="ACTIVE">{lang === 'bn' ? '🟢 সক্রিয় রেজিস্ট্রেশন (Active)' : '🟢 Active Only'}</option>
              <option value="DRAFT">{lang === 'bn' ? '📝 ড্রাফট (Draft)' : '📝 Drafts Only'}</option>
              <option value="EXPIRED">{lang === 'bn' ? '📁 সমাপ্ত / মেয়াদোত্তীর্ণ' : '📁 Expired / Closed'}</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-slate-800 dark:text-white font-bold text-xs focus:border-[#F26522]"
            >
              <option value="ALL">{lang === 'bn' ? 'সকল বিভাগ (All Categories)' : 'All Categories'}</option>
              <option value="cricket">{lang === 'bn' ? 'ক্রিকেট (Cricket)' : 'Cricket'}</option>
              <option value="sports">{lang === 'bn' ? 'খেলাধুলা (Sports)' : 'Sports'}</option>
              <option value="cultural">{lang === 'bn' ? 'সাংস্কৃতিক (Cultural)' : 'Cultural'}</option>
              <option value="festival">{lang === 'bn' ? 'উৎসব (Festival)' : 'Festival'}</option>
              <option value="national_day">{lang === 'bn' ? 'জাতীয় দিবস (National Day)' : 'National Day'}</option>
              <option value="community">{lang === 'bn' ? 'সামাজিক (Community)' : 'Community'}</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#F26522] animate-spin" />
            <p className="text-xs font-bold text-slate-500">
              {lang === 'bn' ? 'অনুষ্ঠানগুলো লোড হচ্ছে...' : 'Loading events...'}
            </p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-[#1d3575] text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {lang === 'bn' ? 'কোনো অনুষ্ঠান পাওয়া যায়নি' : 'No events found'}
            </p>
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'নতুন অনুষ্ঠান তৈরি করতে উপরের বাটনে ক্লিক করুন।' : 'Click the button above to create a new event.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0c1a40] text-slate-500 dark:text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-3.5">{lang === 'bn' ? 'শিরোনাম ও স্ল্যাগ' : 'Title & Slug'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'তারিখ ও মেয়াদ' : 'Dates / Duration'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'নিবন্ধন অবস্থা' : 'Registration Status'}</th>
                      <th className="p-3.5">{lang === 'bn' ? 'Hero ব্যানার' : 'Hero Banner'}</th>
                      <th className="p-3.5 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1d3575]/50">
                    {sortedEvents.map((ev) => {
                      const lifecycle = getEventLifecycle(ev);
                      const customCount = ev.customFields?.length || 0;
                      return (
                        <tr
                          key={ev.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-[#0c1a40]/50 transition-colors ${
                            lifecycle.isActive ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                          }`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {lifecycle.isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {resolveBilingual(ev.title)}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  /register/{ev.slug || ev.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 uppercase font-semibold text-slate-500 dark:text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#112766] text-[10px] font-bold">
                              {ev.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                              {ev.startDate}
                              {ev.endDate && ev.endDate !== ev.startDate ? ` ~ ${ev.endDate}` : ''}
                            </p>
                            {lifecycle.isExpired && (
                              <span className="text-[10px] font-bold text-slate-400">
                                {lang === 'bn' ? '📁 অনুষ্ঠান সম্পন্ন' : '📁 Event Concluded'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              {lifecycle.isDraft ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  📝 Draft
                                </span>
                              ) : lifecycle.isActive ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active (₹{ev.registrationFee ?? 0})
                                </span>
                              ) : lifecycle.isRegDeadlinePassed ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                                  ⏰ Reg Closed
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'}</span>
                              )}
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {ev.formPresets?.participationType === 'individual'
                                  ? '👤 Solo'
                                  : ev.formPresets?.participationType === 'both'
                                  ? '👥 Team & Solo'
                                  : '🏆 Team'}
                                {customCount > 0 ? ` • ${customCount} Custom Fields` : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {ev.showInHero ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F9A01B]/20 text-[#F9A01B] border border-[#F9A01B]/40">
                                {lang === 'bn' ? 'Featured in Hero' : 'Featured in Hero'}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          {/* ONLY Pencil Icon in Actions Column */}
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => openEditModal(ev)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#19398A] dark:text-cyan-400 hover:scale-105 transition-all inline-flex items-center justify-center shadow-xs"
                              title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Event & Form'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isSuperAdmin ? (
                              <button
                                onClick={() => setDeleteTargetId(ev.id)}
                                className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors inline-flex items-center justify-center cursor-pointer"
                                title={lang === 'bn' ? 'অনুষ্ঠান মুছুন (সুপারঅ্যাডমিন)' : 'Delete Event (Super Admin Only)'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                disabled
                                className="p-2 rounded-lg text-slate-300 dark:text-slate-600 cursor-not-allowed inline-flex items-center justify-center opacity-40"
                                title={
                                  lang === 'bn'
                                    ? 'অনুমতি নেই: শুধুমাত্র সুপারঅ্যাডমিন (skahidulla568@gmail.com) ইভেন্ট মুছতে পারেন'
                                    : 'Restricted: Only Super Admin (skahidulla568@gmail.com) can delete events'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (Visible on mobile screens) */}
            <div className="block md:hidden space-y-3">
              {sortedEvents.map((ev) => {
                const lifecycle = getEventLifecycle(ev);
                const customCount = ev.customFields?.length || 0;
                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border shadow-xs space-y-3 ${
                      lifecycle.isActive
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
                        : 'border-[#cbd9ec] dark:border-[#1d3575]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#112766] text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                            {ev.category}
                          </span>
                          {lifecycle.isDraft && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              Draft
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          {resolveBilingual(ev.title)}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">/register/{ev.slug || ev.id}</p>
                      </div>

                      {lifecycle.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active (₹{ev.registrationFee ?? 0})
                        </span>
                      ) : lifecycle.isRegDeadlinePassed ? (
                        <span className="text-[10px] font-bold text-rose-500 shrink-0">Reg Closed</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">Closed</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-[#1d3575]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {ev.startDate}
                          {ev.endDate && ev.endDate !== ev.startDate ? ` ~ ${ev.endDate}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {ev.formPresets?.participationType === 'individual'
                            ? 'Solo'
                            : ev.formPresets?.participationType === 'both'
                            ? 'Team & Solo'
                            : 'Team'}
                          {customCount > 0 ? ` (+${customCount})` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#1d3575]">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#e6eef8] dark:bg-[#112766] hover:bg-[#19398A] hover:text-white dark:hover:bg-[#19398A] text-[#19398A] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                      </button>

                      {isSuperAdmin ? (
                        <button
                          onClick={() => setDeleteTargetId(ev.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                          title={lang === 'bn' ? 'মুছুন (সুপারঅ্যাডমিন)' : 'Delete (Super Admin Only)'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-2 rounded-xl text-slate-400 border border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed"
                          title={
                            lang === 'bn'
                              ? 'অনুমতি নেই: শুধুমাত্র সুপারঅ্যাডমিন (skahidulla568@gmail.com) ইভেন্ট মুছতে পারেন'
                              : 'Restricted: Only Super Admin (skahidulla568@gmail.com) can delete events'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* =========================================================================
            CREATE / EDIT EVENT & REGISTRATION FORM BUILDER MODAL (100% Responsive)
           ========================================================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#071333] rounded-3xl border border-slate-200 dark:border-[#1d3575] shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              
              {/* Modal Sticky Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1d3575] flex items-center justify-between bg-slate-50/50 dark:bg-[#0c1a40]/60 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#19398A] to-[#F26522] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {editingEvent
                        ? lang === 'bn'
                          ? `ইভেন্ট সম্পাদনা: ${resolveBilingual(editingEvent.title)}`
                          : `Edit Event: ${resolveBilingual(editingEvent.title)}`
                        : lang === 'bn'
                        ? 'নতুন ইভেন্ট ও রেজিস্ট্রেশন ফর্ম তৈরি'
                        : 'Create New Event & Registration Form'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold truncate">
                      {lang === 'bn'
                        ? 'ইভেন্টের বিবরণ, ক্যালেন্ডার ডেট, কাস্টম স্ল্যাগ ও ফর্ম কনফিগার করুন।'
                        : 'Configure event specifics, calendar dates, registration slug, and form.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Horizontal Responsive Tab Navigator */}
              <div className="px-3 sm:px-5 border-b border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#071333] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === 'basic'
                      ? 'border-[#F26522] text-[#F26522] dark:text-[#F9A01B]'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>১. মৌলিক তথ্য ও স্ল্যাগ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('registration')}
                  className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === 'registration'
                      ? 'border-[#F26522] text-[#F26522] dark:text-[#F9A01B]'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>২. রেজিস্ট্রেশন ও ফি (Settings)</span>
                  {registrationEnabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('form_builder')}
                  className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === 'form_builder'
                      ? 'border-[#F26522] text-[#F26522] dark:text-[#F9A01B]'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>৩. ফর্ম ফিল্ডস (Checkboxes)</span>
                  {customFields.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#19398A] text-white">
                      +{customFields.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeTab === 'rules'
                      ? 'border-[#F26522] text-[#F26522] dark:text-[#F9A01B]'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>৪. নিয়মাবলী ও প্রিভিউ</span>
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
                
                {/* =========================================================================
                    TAB 1: BASIC INFORMATION & SLUG
                   ========================================================================= */}
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Event Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'অনুষ্ঠানের নাম (বাংলা) *' : 'Event Name (Bengali) *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাঃ ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬"
                          value={titleBn}
                          onChange={(e) => {
                            setTitleBn(e.target.value);
                            if (!editingEvent && !slug) setSlug(generateSlug(e.target.value));
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'Event Name (English)' : 'Event Name (English)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Iswampur Premier League 2026"
                          value={titleEn}
                          onChange={(e) => {
                            setTitleEn(e.target.value);
                            if (!editingEvent) setSlug(generateSlug(e.target.value));
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Slug Configuration */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-[#F26522]" />
                          <span>{lang === 'bn' ? 'রেজিস্ট্রেশন URL স্ল্যাগ (Event Slug) *' : 'Event Registration URL Slug *'}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const gen = generateSlug(titleEn || titleBn);
                            if (gen) setSlug(gen);
                          }}
                          className="text-[10px] text-[#19398A] dark:text-cyan-400 font-bold hover:underline"
                        >
                          {lang === 'bn' ? 'টাইটেল থেকে অটো জেনারেট' : 'Auto-generate from title'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-[#1d3575] shrink-0 select-none">
                          /register/
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="ipl-2026"
                          value={slug}
                          onChange={(e) => setSlug(generateSlug(e.target.value))}
                          className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {lang === 'bn'
                          ? `সাধারণ মানুষ এই লিঙ্কে গিয়ে ফর্ম পূরণ করবে: /register/${slug || 'your-slug'}`
                          : `Public registration link: /register/${slug || 'your-slug'}`}
                      </p>
                    </div>

                    {/* Category & Lifecycle Dates (With HTML5 Calendar Picker) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'বিভাগ (Category) *' : 'Category *'}
                        </label>
                        <select
                          value={category}
                          onChange={(e) => {
                            const newCat = e.target.value as any;
                            setCategory(newCat);
                            applyCategoryDefaults(newCat);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522]"
                        >
                          <option value="cricket">{lang === 'bn' ? '🏏 ক্রিকেট (Cricket)' : 'Cricket'}</option>
                          <option value="sports">{lang === 'bn' ? '⚽ অন্যান্য খেলাধুলা (Sports)' : 'Sports'}</option>
                          <option value="cultural">{lang === 'bn' ? '🎭 সাংস্কৃতিক / নাটক / গান (Cultural)' : 'Cultural'}</option>
                          <option value="festival">{lang === 'bn' ? '🪔 উৎসব ও পুজো (Festival)' : 'Festival'}</option>
                          <option value="national_day">{lang === 'bn' ? '🇮🇳 জাতীয় দিবস / মিট (National Day)' : 'National Day'}</option>
                          <option value="community">{lang === 'bn' ? '🤝 সামাজিক ও সমাজকল্যাণ (Community)' : 'Community'}</option>
                        </select>
                      </div>

                      {/* Calendar: Start Date */}
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'অনুষ্ঠান শুরুর তারিখ (Start Date) *' : 'Event Start Date *'}
                        </label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>

                      {/* Calendar: End Date (Event Expiry) */}
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'অনুষ্ঠান সমাপ্তির তারিখ (End Date)' : 'Event End Date (Expiry)'}
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {lang === 'bn' ? 'এই তারিখ পার হলে ইভেন্টটি স্বয়ংক্রিয়ভাবে সমাপ্ত হবে' : 'Event expires after this date'}
                        </p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'স্থান / মাঠ (বাংলা)' : 'Venue (Bengali)'}
                        </label>
                        <input
                          type="text"
                          placeholder="ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ"
                          value={venueBn}
                          onChange={(e) => setVenueBn(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'Venue (English)' : 'Venue (English)'}
                        </label>
                        <input
                          type="text"
                          placeholder="Iswampur Central Sports Ground"
                          value={venueEn}
                          onChange={(e) => setVenueEn(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Cover Image Upload & URL */}
                    <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575]">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                          {lang === 'bn' ? 'অনুষ্ঠানের কভার ছবি (Cover Image)' : 'Event Cover Image'}
                        </label>
                        {coverImage && (
                          <button
                            type="button"
                            onClick={() => setCoverImage('')}
                            className="text-[10px] text-rose-500 hover:underline font-bold"
                          >
                            {lang === 'bn' ? 'ছবি রিমুভ করুন' : 'Remove Image'}
                          </button>
                        )}
                      </div>

                      {/* Image Preview if available */}
                      {coverImage && (
                        <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-[#1d3575] bg-slate-100 dark:bg-slate-900 group">
                          <img
                            src={coverImage}
                            alt="Event Cover Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-[#F26522]" />
                              <span>{lang === 'bn' ? 'নতুন ছবি আপলোড' : 'Change Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                                disabled={uploadingCover}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setCoverImage('')}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow"
                            >
                              {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload Box & Direct URL Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* File Upload Box */}
                        <label
                          className={`p-3 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                            uploadingCover
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400'
                              : 'bg-white dark:bg-[#071333] border-slate-300 dark:border-[#1d3575] hover:border-[#F26522] hover:bg-orange-50/20'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                            disabled={uploadingCover}
                          />
                          {uploadingCover ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading image...'}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#F26522]" />
                              <span className="text-xs font-bold text-slate-800 dark:text-white">
                                {lang === 'bn' ? 'কম্পিউটার/মোবাইল থেকে আপলোড' : 'Upload Image File'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                JPG, PNG, WEBP (Max 10MB)
                              </span>
                            </>
                          )}
                        </label>

                        {/* Direct URL Input */}
                        <div className="flex flex-col justify-center">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
                            {lang === 'bn' ? 'অথবা ছবির ডিরেক্ট URL পেস্ট করুন:' : 'Or paste direct image URL:'}
                          </label>
                          <input
                            type="url"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-slate-900 dark:text-white font-semibold text-xs focus:border-[#F26522] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Short Description (Bengali)'}
                        </label>
                        <textarea
                          rows={2}
                          value={shortDescBn}
                          onChange={(e) => setShortDescBn(e.target.value)}
                          placeholder="অনুষ্ঠানের এক লাইনের পরিচিতি..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-medium text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'Short Description (English)' : 'Short Description (English)'}
                        </label>
                        <textarea
                          rows={2}
                          value={shortDescEn}
                          onChange={(e) => setShortDescEn(e.target.value)}
                          placeholder="One line summary for English readers..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-medium text-xs focus:border-[#F26522] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Status & Hero Toggles */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'ইভেন্ট স্ট্যাটাস (Status)' : 'Event Status'}
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStatus('published');
                              setPublished(true);
                            }}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                              status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                                : 'border-slate-300 dark:border-[#1d3575] text-slate-500'
                            }`}
                          >
                            ✓ {lang === 'bn' ? 'পাবলিশড (সবার জন্য দৃশ্যমান)' : 'Published (Public)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStatus('draft');
                              setPublished(false);
                            }}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                              status === 'draft'
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs'
                                : 'border-slate-300 dark:border-[#1d3575] text-slate-500'
                            }`}
                          >
                            📝 {lang === 'bn' ? 'খসড়া (Draft)' : 'Draft Mode'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center pt-2 sm:pt-4">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-white">
                          <input
                            type="checkbox"
                            checked={showInHero}
                            onChange={(e) => setShowInHero(e.target.checked)}
                            className="w-4 h-4 rounded text-[#F26522] accent-[#F26522]"
                          />
                          <span>{lang === 'bn' ? 'Homepage Hero ব্যানারে ফিচার করুন' : 'Feature in Homepage Hero'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    TAB 2: REGISTRATION SETTINGS (WITH CALENDAR PICKERS)
                   ========================================================================= */}
                {activeTab === 'registration' && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Master Registration Toggle */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[#F26522]" />
                          <span>{lang === 'bn' ? 'অনলাইন রেজিস্ট্রেশন সক্রিয় করুন' : 'Enable Online Registration'}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {lang === 'bn'
                            ? 'এটি অন থাকলে এবং সময়সীমা বৈধ থাকলে সাধারণ মানুষ ও দলগুলো আবেদন জমা দিতে পারবে।'
                            : 'When enabled and deadline is valid, users can register for this event.'}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={registrationEnabled}
                          onChange={(e) => setRegistrationEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {registrationEnabled && (
                      <div className="space-y-4 pt-2">
                        {/* Participation Type Selector */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] space-y-3">
                          <label className="block font-black text-slate-800 dark:text-white text-xs">
                            {lang === 'bn' ? 'অংশগ্রহণের ধরন (Participation Mode) *' : 'Participation Mode *'}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setFormPresets((prev) => ({
                                  ...prev,
                                  participationType: 'team',
                                  requireTeamName: true,
                                  requireCaptain: true,
                                  requireSquad: true,
                                }))
                              }
                              className={`p-3 rounded-xl border text-left transition-all ${
                                formPresets.participationType === 'team'
                                  ? 'border-[#19398A] dark:border-cyan-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                                  : 'border-slate-200 dark:border-[#1d3575] hover:bg-slate-50 dark:hover:bg-[#112766]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Users className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                {formPresets.participationType === 'team' && (
                                  <Check className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                )}
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {lang === 'bn' ? 'দলগত অংশগ্রহণ' : 'Team / Squad'}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {lang === 'bn' ? 'ক্রিকেট, ফুটবল, নাট্যদল ইত্যাদি' : 'Cricket, Football, Squad events'}
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormPresets((prev) => ({
                                  ...prev,
                                  participationType: 'individual',
                                  requireTeamName: false,
                                  requireCaptain: true,
                                  requireSquad: false,
                                }))
                              }
                              className={`p-3 rounded-xl border text-left transition-all ${
                                formPresets.participationType === 'individual'
                                  ? 'border-[#19398A] dark:border-cyan-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                                  : 'border-slate-200 dark:border-[#1d3575] hover:bg-slate-50 dark:hover:bg-[#112766]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <User className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                {formPresets.participationType === 'individual' && (
                                  <Check className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                )}
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {lang === 'bn' ? 'একক অংশগ্রহণ' : 'Solo / Individual'}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {lang === 'bn' ? 'ম্যারাথন, গান, অঙ্কন, কুইজ' : 'Marathon, Solo Art, Singing, Quiz'}
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormPresets((prev) => ({
                                  ...prev,
                                  participationType: 'both',
                                  requireCaptain: true,
                                }))
                              }
                              className={`p-3 rounded-xl border text-left transition-all ${
                                formPresets.participationType === 'both'
                                  ? 'border-[#19398A] dark:border-cyan-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                                  : 'border-slate-200 dark:border-[#1d3575] hover:bg-slate-50 dark:hover:bg-[#112766]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Layers className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                {formPresets.participationType === 'both' && (
                                  <Check className="w-4 h-4 text-[#19398A] dark:text-cyan-400" />
                                )}
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {lang === 'bn' ? 'উভয়ই প্রযোজ্য' : 'Both Allowed'}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {lang === 'bn' ? 'একক অথবা দল যেকোনোটি' : 'Participant can choose solo or group'}
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Calendar Pickers for Registration Opens & Deadline */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] space-y-3">
                          <label className="block font-black text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#F26522]" />
                            <span>{lang === 'bn' ? 'রেজিস্ট্রেশনের সময়কাল (ক্যালেন্ডার সিলেক্টর)' : 'Registration Timeline (Calendar Pickers)'}</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Registration Opens */}
                            <div>
                              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                                {lang === 'bn' ? 'রেজিস্ট্রেশন শুরু (Opens From) *' : 'Registration Opens Date *'}
                              </label>
                              <input
                                type="date"
                                required
                                value={registrationStartDate ? registrationStartDate.slice(0, 10) : ''}
                                onChange={(e) => setRegistrationStartDate(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522]"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                {lang === 'bn' ? 'এই দিন থেকে আবেদনকারীরা ফর্ম পূরণ করতে পারবে' : 'Registration starts from this date'}
                              </p>
                            </div>

                            {/* Registration Deadline */}
                            <div>
                              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                                {lang === 'bn' ? 'রেজিস্ট্রেশনের শেষ সময় (Deadline) *' : 'Registration Deadline *'}
                              </label>
                              <input
                                type="date"
                                required
                                value={registrationDeadline ? registrationDeadline.slice(0, 10) : ''}
                                onChange={(e) =>
                                  setRegistrationDeadline(e.target.value ? `${e.target.value}T23:59:59.000Z` : '')
                                }
                                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522]"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                {lang === 'bn'
                                  ? 'এই তারিখ অতিক্রান্ত হলে স্বয়ংক্রিয়ভাবে ফর্ম ও বাটন বন্ধ হয়ে যাবে'
                                  : 'Registration automatically closes after this date'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fee and Limits */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                              {lang === 'bn' ? 'নিবন্ধন ফি (₹) [০ হলে ফ্রি]' : 'Registration Fee (₹) [0 for free]'}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={registrationFee}
                              onChange={(e) => setRegistrationFee(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-black text-xs focus:border-[#F26522]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                              {lang === 'bn' ? 'সর্বোচ্চ দল / প্রতিযোগী সংখ্যা' : 'Max Teams / Limit'}
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={maxTeams}
                              onChange={(e) => setMaxTeams(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white font-bold text-xs focus:border-[#F26522]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =========================================================================
                    TAB 3: REGISTRATION FORM BUILDER (Presets Checkboxes & Custom Fields)
                   ========================================================================= */}
                {activeTab === 'form_builder' && (
                  <div className="space-y-6 animate-in fade-in">
                    
                    {/* SECTION A: Standard Preset Fields Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-[#1d3575]">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-[#F26522]" />
                            <span>{lang === 'bn' ? '১. স্ট্যান্ডার্ড ফিল্ড চেকবক্স (Standard Preset Fields)' : '1. Standard Field Presets (Checkboxes)'}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {lang === 'bn'
                              ? 'যে যে তথ্য এই ইভেন্টে প্রয়োজন, সেগুলোতে টিক দিন। অপ্রয়োজনীয় বক্স টিক তুলে দিন।'
                              : 'Check the boxes for information required for this specific event.'}
                          </p>
                        </div>
                      </div>

                      {/* Responsive Grid of Checkbox Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        
                        {/* 1. Team Name */}
                        <div
                          onClick={() => togglePresetField('requireTeamName')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireTeamName
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Users className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'দলের নাম (Team Name)' : 'Team Name'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">দলের অফিসিয়াল নাম</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireTeamName)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 2. Captain / Leader */}
                        <div
                          onClick={() => togglePresetField('requireCaptain')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireCaptain
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'দলনেতা / প্রতিনিধির নাম' : 'Captain / Representative'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">যোগাযোগকারীর নাম</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireCaptain)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 3. Phone */}
                        <div
                          onClick={() => togglePresetField('requirePhone')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requirePhone
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'মোবাইল নম্বর (Phone)' : 'Mobile Phone'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">১০ সংখ্যার মোবাইল</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requirePhone)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 4. WhatsApp */}
                        <div
                          onClick={() => togglePresetField('requireWhatsApp')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireWhatsApp
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Number'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">জরুরি আপডেট পাঠানোর জন্য</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireWhatsApp)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 5. Email */}
                        <div
                          onClick={() => togglePresetField('requireEmail')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireEmail
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'ইমেইল ঠিকানা (Email)' : 'Email Address'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">ডিজিটাল টিম পাস পাঠাতে</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireEmail)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 6. Address */}
                        <div
                          onClick={() => togglePresetField('requireAddress')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireAddress
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'ঠিকানা / গ্রাম / পাড়া' : 'Address / Village'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">দলের এলাকা বা বাসস্থান</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireAddress)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 7. Emergency Contact */}
                        <div
                          onClick={() => togglePresetField('requireEmergencyContact')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireEmergencyContact
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertCircle className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'জরুরি যোগাযোগ নম্বর' : 'Emergency Contact'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">বিকল্প ফোন নম্বর</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireEmergencyContact)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 8. Squad / Members List */}
                        <div
                          onClick={() => togglePresetField('requireSquad')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireSquad
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Trophy className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'খেলোয়াড় তালিকা (Squad)' : 'Player Roster (Squad)'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">সদস্যদের নাম ইনপুট</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireSquad)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 9. Jersey Size */}
                        <div
                          onClick={() => togglePresetField('requireJerseySize')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireJerseySize
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Shirt className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'জার্সি / টি-শার্ট সাইজ' : 'Jersey / T-Shirt Size'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">M, L, XL, XXL ইত্যাদি</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireJerseySize)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 10. Payment Proof */}
                        <div
                          onClick={() => togglePresetField('requirePaymentProof')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requirePaymentProof
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CreditCard className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'পেমেন্ট UTR ও স্ক্রিনশট' : 'Payment UTR & Screenshot'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">ব্যাংক রসিদ আপলোড</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requirePaymentProof)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 11. Age Group / DOB */}
                        <div
                          onClick={() => togglePresetField('requireAgeGroup')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireAgeGroup
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Calendar className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'বয়স / জন্মতারিখ' : 'Age Group / DOB'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">অনূর্ধ্ব-১৯ বা বয়স সীমা</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireAgeGroup)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>

                        {/* 12. Notes */}
                        <div
                          onClick={() => togglePresetField('requireNotes')}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                            formPresets.requireNotes
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-[#1d3575] bg-white dark:bg-[#0c1a40] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#19398A] dark:text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {lang === 'bn' ? 'বিশেষ মন্তব্য / রিমার্কস' : 'Special Notes / Remarks'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">অতিরিক্ত নির্দেশনা বা অনুরোধ</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(formPresets.requireNotes)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* If Squad is enabled, show Min & Max players limits */}
                      {formPresets.requireSquad && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                          <div>
                            <p className="font-extrabold text-amber-900 dark:text-amber-300 text-xs">
                              {lang === 'bn' ? 'দলগত খেলোয়াড় সংখ্যার সীমা (Squad Size Limits):' : 'Squad Player Count Configuration:'}
                            </p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                              {lang === 'bn'
                                ? 'প্রতিটি দল নূন্যতম ও সর্বোচ্চ কতজন খেলোয়াড়ের নাম নিবন্ধন করতে পারবে তা নির্ধারণ করুন।'
                                : 'Set the minimum and maximum players required in each squad roster.'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Min:</span>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={minPlayers}
                                onChange={(e) => setMinPlayers(Number(e.target.value))}
                                className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] font-bold text-center text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Max:</span>
                              <input
                                type="number"
                                min={minPlayers}
                                max={50}
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                                className="w-16 p-1.5 rounded-lg border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] font-bold text-center text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION B: Dynamic Custom Fields Builder */}
                    <div className="pt-4 border-t border-slate-200 dark:border-[#1d3575] space-y-4">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#F26522]" />
                          <span>{lang === 'bn' ? '২. অতিরিক্ত কাস্টম ফিল্ডস বিল্ডার (Dynamic Custom Fields)' : '2. Dynamic Custom Fields Builder'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'bn'
                            ? 'ইভেন্টের জন্য যে কোনো বিশেষ তথ্য (যেমন: অভিনয়ের বিষয়, ব্যবহৃত বাদ্যযন্ত্র, ট্র্যাক লিঙ্ক ইত্যাদি) যুক্ত করতে নিচের ফর্মটি ব্যবহার করুন।'
                            : 'Add special custom questions specific to this event (e.g., Performance Topic, Track Link, Props, etc.).'}
                        </p>
                      </div>

                      {/* Add Custom Field Form Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                              {lang === 'bn' ? 'ফিল্ডের নাম (বাংলা) *' : 'Field Label (Bengali) *'}
                            </label>
                            <input
                              type="text"
                              placeholder="উদাঃ অভিনয়ের বিষয় বা নাটকটির নাম"
                              value={newLabelBn}
                              onChange={(e) => setNewLabelBn(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-xs font-semibold focus:border-[#F26522]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                              {lang === 'bn' ? 'Field Label (English)' : 'Field Label (English)'}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Performance Topic or Drama Name"
                              value={newLabelEn}
                              onChange={(e) => setNewLabelEn(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-xs font-semibold focus:border-[#F26522]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                              {lang === 'bn' ? 'ফিল্ডের টাইপ (Type) *' : 'Field Type *'}
                            </label>
                            <select
                              value={newType}
                              onChange={(e) => setNewType(e.target.value as any)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-xs font-bold focus:border-[#F26522]"
                            >
                              <option value="text">টেক্সট ইনপুট (Text)</option>
                              <option value="number">সংখ্যা (Number)</option>
                              <option value="select">ড্রপডাউন তালিকা (Dropdown Select)</option>
                              <option value="textarea">বড় টেক্সট বিবরণ (Textarea)</option>
                              <option value="checkbox">চেকবক্স টিক (Checkbox / Agreement)</option>
                              <option value="phone">ফোন নম্বর (Phone)</option>
                              <option value="email">ইমেইল (Email)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                              {lang === 'bn' ? 'হিন্ট / প্লেসহোল্ডার (বাংলা)' : 'Placeholder (Bengali)'}
                            </label>
                            <input
                              type="text"
                              placeholder="ইনপুট বক্সে হালকা লেখা..."
                              value={newPlaceholderBn}
                              onChange={(e) => setNewPlaceholderBn(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-xs font-medium focus:border-[#F26522]"
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-4 sm:pt-5">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-white select-none">
                              <input
                                type="checkbox"
                                checked={newRequired}
                                onChange={(e) => setNewRequired(e.target.checked)}
                                className="w-4 h-4 rounded text-[#F26522] accent-[#F26522]"
                              />
                              <span>{lang === 'bn' ? 'বাধ্যতামূলক (Required)' : 'Mandatory'}</span>
                            </label>
                          </div>
                        </div>

                        {newType === 'select' && (
                          <div className="animate-in fade-in">
                            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-[11px]">
                              {lang === 'bn'
                                ? 'ড্রপডাউন অপশনসমূহ (কমা দিয়ে আলাদা করুন) *'
                                : 'Dropdown Options (Comma separated) *'}
                            </label>
                            <input
                              type="text"
                              placeholder="অপশন ১, অপশন ২, অপশন ৩..."
                              value={newOptionsStr}
                              onChange={(e) => setNewOptionsStr(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#071333] text-xs font-semibold focus:border-[#F26522]"
                            />
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddCustomField}
                            className="px-4 py-2 rounded-xl font-black text-xs bg-[#19398A] hover:bg-[#122b6a] text-white flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'কাস্টম ফিল্ড যুক্ত করুন' : 'Add Custom Field'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Display Added Custom Fields List */}
                      {customFields.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                            {lang === 'bn'
                              ? `যোগ করা কাস্টম ফিল্ডস (${customFields.length}):`
                              : `Configured Custom Fields (${customFields.length}):`}
                          </p>

                          <div className="space-y-1.5">
                            {customFields.map((field, idx) => (
                              <div
                                key={field.id}
                                className="p-3 rounded-xl bg-white dark:bg-[#0c1a40] border border-slate-200 dark:border-[#1d3575] flex items-center justify-between gap-3 shadow-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-5 text-center font-mono font-black text-slate-400 text-xs">
                                    {idx + 1}.
                                  </span>
                                  <div className="truncate">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                        {resolveBilingual(field.label)}
                                      </p>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-[#112766] text-slate-600 dark:text-slate-300">
                                        {field.type}
                                      </span>
                                      {field.required && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    {field.options && field.options.length > 0 && (
                                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                        Options: {field.options.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCustomField(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCustomField(idx, 'down')}
                                    disabled={idx === customFields.length - 1}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomField(field.id)}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    title="Remove Field"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    TAB 4: RULES, REGULATIONS & LIVE FORM SUMMARY
                   ========================================================================= */}
                {activeTab === 'rules' && (
                  <div className="space-y-5 animate-in fade-in">
                    
                    {/* Rules inputs */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#F26522]" />
                          <span>{lang === 'bn' ? 'ইভেন্টের নিয়মনীতি ও শর্তাবলী (Rules & Terms)' : 'Rules & Regulations'}</span>
                        </h4>
                        <input
                          type="text"
                          placeholder="Version: 2026.1"
                          value={rulesVersion}
                          onChange={(e) => setRulesVersion(e.target.value)}
                          className="w-28 p-1.5 rounded-lg border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-center font-mono text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                            {lang === 'bn' ? 'নিয়মাবলী (বাংলা)' : 'Rules & Guidelines (Bengali)'}
                          </label>
                          <textarea
                            rows={6}
                            value={rulesBn}
                            onChange={(e) => setRulesBn(e.target.value)}
                            placeholder="১. প্রতি দলের জন্য নিয়ম...\n২. সময়সীমা..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white text-xs font-mono leading-relaxed focus:border-[#F26522] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300 text-xs">
                            {lang === 'bn' ? 'Rules & Guidelines (English)' : 'Rules & Guidelines (English)'}
                          </label>
                          <textarea
                            rows={6}
                            value={rulesEn}
                            onChange={(e) => setRulesEn(e.target.value)}
                            placeholder="1. Each team must report...\n2. Umpires decision..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1d3575] bg-white dark:bg-[#0C1A40] text-slate-900 dark:text-white text-xs font-mono leading-relaxed focus:border-[#F26522] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* LIVE FORM STRUCTURE SUMMARY PREVIEW */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-[#0c1a40] dark:to-[#071333] border border-blue-200 dark:border-[#1d3575] space-y-3">
                      <div className="flex items-center gap-2 text-[#19398A] dark:text-cyan-400 font-extrabold text-xs">
                        <Eye className="w-4 h-4" />
                        <span>
                          {lang === 'bn'
                            ? 'লাইভ ফর্ম সারাংশ (Live Public Form Summary Preview)'
                            : 'Live Public Form Summary Preview'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white">
                              {titleBn || titleEn || 'ইভেন্টের নাম'}
                            </span>
                            <span className="ml-2 font-mono text-[11px] text-slate-400">
                              /register/{slug || 'slug'}
                            </span>
                          </div>
                          <span className="font-black text-[#F26522]">
                            {registrationFee > 0 ? `ফি: ₹${registrationFee}` : 'বিনামূল্যে (Free)'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formPresets.requireTeamName && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ দলের নাম
                            </span>
                          )}
                          {formPresets.requireCaptain && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ দলনেতার নাম
                            </span>
                          )}
                          {formPresets.requirePhone && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ ফোন নম্বর
                            </span>
                          )}
                          {formPresets.requireWhatsApp && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ হোয়াটসঅ্যাপ
                            </span>
                          )}
                          {formPresets.requireEmail && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ ইমেইল
                            </span>
                          )}
                          {formPresets.requireAddress && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              ✓ ঠিকানা
                            </span>
                          )}
                          {formPresets.requireSquad && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              ✓ খেলোয়াড় তালিকা ({minPlayers}–{maxPlayers} জন)
                            </span>
                          )}
                          {formPresets.requireJerseySize && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              ✓ জার্সি সাইজ
                            </span>
                          )}
                          {formPresets.requirePaymentProof && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              ✓ পেমেন্ট স্ক্রিনশট
                            </span>
                          )}
                          {customFields.map((cf) => (
                            <span
                              key={cf.id}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300"
                            >
                              + {resolveBilingual(cf.label)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Sticky Footer with Step Navigation and Save / Save as Draft */}
              <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-[#1d3575] bg-slate-50/70 dark:bg-[#0c1a40]/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {activeTab !== 'basic' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab === 'rules') setActiveTab('form_builder');
                          else if (activeTab === 'form_builder') setActiveTab('registration');
                          else if (activeTab === 'registration') setActiveTab('basic');
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-[#1d3575] font-bold text-xs hover:bg-white dark:hover:bg-[#071333] flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'আগের ট্যাব' : 'Back'}</span>
                      </button>
                    )}

                    {activeTab !== 'rules' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab === 'basic') setActiveTab('registration');
                          else if (activeTab === 'registration') setActiveTab('form_builder');
                          else if (activeTab === 'form_builder') setActiveTab('rules');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-[#112766] hover:bg-slate-300 font-bold text-xs flex items-center gap-1"
                      >
                        <span>{lang === 'bn' ? 'পরের ট্যাব' : 'Next'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Save and Save as Draft CTAs */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Save As Draft */}
                  <button
                    type="button"
                    onClick={(e) => handleSave(e, 'draft')}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-60 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'খসড়া সংরক্ষণ (Draft)' : 'Save as Draft'}</span>
                  </button>

                  {/* Publish & Save */}
                  <button
                    type="button"
                    onClick={(e) => handleSave(e, 'published')}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-60 shadow-md flex items-center justify-center gap-1.5 text-xs active:scale-98 transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'প্রকাশ ও সংরক্ষণ করুন' : 'Publish & Save'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTargetId)}
          title={lang === 'bn' ? 'অনুষ্ঠান এবং সংশ্লিষ্ট সমস্ত তথ্য মুছে ফেলা' : 'Delete Event & All Related Data'}
          message={
            lang === 'bn'
              ? 'সতর্কতা: এই অনুষ্ঠানটি মুছে ফেললে এর সাথে সম্পর্কিত সমস্ত তথ্য—সমস্ত দলীয় রেজিস্ট্রেশন, অফিসিয়াল টিম পাস, ম্যাচডে কিউআর চেক-ইন রেকর্ড এবং সম্পর্কিত সমস্ত পোস্ট—চিরতরে মুছে যাবে! আপনি কি নিশ্চিতভাবে মুছে ফেলতে চান?'
              : 'CRITICAL WARNING: Deleting this event will PERMANENTLY erase all related data—including all team registrations, official matchday passes, QR check-in records, and associated event posts! Are you sure you want to proceed?'
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, সমস্ত ডাটা সহ মুছে ফেলুন' : 'Yes, Delete Event & All Data'}
          cancelText={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => !isDeleting && setDeleteTargetId(null)}
        />
      </div>
    </AdminLayout>
  );
}
