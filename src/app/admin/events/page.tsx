'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent } from '@/types';
import { Plus, Edit2, Trash2, Calendar, MapPin, Trophy, X, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminEventsPage() {
  const { lang, resolveBilingual } = useLanguage();
  const toast = useToast();
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VillageEvent | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [shortDescBn, setShortDescBn] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [fullDescBn, setFullDescBn] = useState('');
  const [fullDescEn, setFullDescEn] = useState('');
  const [category, setCategory] = useState<'cricket' | 'sports' | 'cultural' | 'festival' | 'national_day' | 'community'>('sports');
  const [startDate, setStartDate] = useState('');
  const [venueBn, setVenueBn] = useState('');
  const [venueEn, setVenueEn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [minPlayers, setMinPlayers] = useState<number>(11);
  const [maxPlayers, setMaxPlayers] = useState<number>(15);
  const [showInHero, setShowInHero] = useState(false);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitleBn('');
    setTitleEn('');
    setShortDescBn('');
    setShortDescEn('');
    setFullDescBn('');
    setFullDescEn('');
    setCategory('cricket');
    setStartDate(new Date().toISOString().slice(0, 10));
    setVenueBn('ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ');
    setVenueEn('Iswampur Central Sports Ground');
    setCoverImage('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80');
    setRegistrationEnabled(true);
    setRegistrationDeadline('2026-11-15T23:59:59.000Z');
    setRegistrationFee(1500);
    setMinPlayers(11);
    setMaxPlayers(15);
    setShowInHero(false);
    setIsModalOpen(true);
  };

  const openEditModal = (ev: VillageEvent) => {
    setEditingEvent(ev);
    setTitleBn(ev.title.bn);
    setTitleEn(ev.title.en || '');
    setShortDescBn(ev.shortDescription?.bn || '');
    setShortDescEn(ev.shortDescription?.en || '');
    setFullDescBn(ev.fullDescription?.bn || '');
    setFullDescEn(ev.fullDescription?.en || '');
    setCategory(ev.category as any);
    setStartDate(ev.startDate);
    setVenueBn(ev.venue.bn);
    setVenueEn(ev.venue.en || '');
    setCoverImage(ev.coverImage);
    setRegistrationEnabled(ev.registrationEnabled);
    setRegistrationDeadline(ev.registrationDeadline || '');
    setRegistrationFee(ev.registrationFee || 0);
    setMinPlayers(ev.minPlayers || 11);
    setMaxPlayers(ev.maxPlayers || 15);
    setShowInHero(ev.showInHero);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: { bn: titleBn, en: titleEn },
      shortDescription: { bn: shortDescBn, en: shortDescEn },
      fullDescription: { bn: fullDescBn, en: fullDescEn },
      category,
      startDate,
      venue: { bn: venueBn, en: venueEn },
      coverImage,
      registrationEnabled,
      registrationDeadline,
      registrationFee,
      minPlayers,
      maxPlayers,
      showInHero,
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
        toast.success(lang === 'bn' ? 'অনুষ্ঠান সফলভাবে আপডেট করা হয়েছে' : 'Event updated successfully');
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create event');
        toast.success(lang === 'bn' ? 'নতুন অনুষ্ঠান সফলভাবে তৈরি হয়েছে' : 'New event created successfully');
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
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(lang === 'bn' ? 'অনুষ্ঠানটি সফলভাবে মুছে ফেলা হয়েছে' : 'Event deleted successfully');
      setDeleteTargetId(null);
      loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অনুষ্ঠান ব্যবস্থাপনা' : 'Events Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === 'bn'
                ? 'গ্রামের সকল উৎসব, ক্রিকেট প্রতিযোগিতা ও অনুষ্ঠানের দ্বিভাষিক বিবরণ।'
                : 'Manage village festivals, cricket tournaments, and community events.'}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন অনুষ্ঠান যোগ করুন' : 'Create New Event'}</span>
          </button>
        </div>

        {/* Events Table */}
        <div className="rounded-2xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0c1a40] text-slate-500 dark:text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3.5">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'নিবন্ধন অবস্থা' : 'Registration'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'Hero ব্যানার' : 'Hero Banner'}</th>
                  <th className="p-3.5 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d3575]/50">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0c1a40]/50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{resolveBilingual(ev.title)}</p>
                      {lang === 'bn' && ev.title.en && <p className="text-[11px] text-slate-400">{ev.title.en}</p>}
                    </td>
                    <td className="p-3.5 uppercase font-semibold text-slate-500 dark:text-slate-400">{ev.category}</td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{ev.startDate}</td>
                    <td className="p-3.5">
                      {ev.registrationEnabled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {lang === 'bn' ? `সক্রিয় (Fee: ₹${ev.registrationFee})` : `Active (Fee: ₹${ev.registrationFee})`}
                        </span>
                      ) : (
                        <span className="text-slate-400">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {ev.showInHero ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F9A01B]/20 text-[#F9A01B]">
                          {lang === 'bn' ? 'Hero তে প্রদর্শিত' : 'Featured in Hero'}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(ev.id)}
                        className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                        title={lang === 'bn' ? 'মুছুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#071333] rounded-3xl border border-slate-200 dark:border-[#1d3575] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-[#1d3575]">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingEvent
                    ? lang === 'bn'
                      ? 'অনুষ্ঠান সম্পাদনা করুন'
                      : 'Edit Event'
                    : lang === 'bn'
                    ? 'নতুন অনুষ্ঠান তৈরি করুন'
                    : 'Create New Event'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'অনুষ্ঠানের নাম (বাংলা) *' : 'Event Name (Bengali) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Event Name (English)' : 'Event Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'বিভাগ (Category)' : 'Category'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    >
                      <option value="cricket">{lang === 'bn' ? 'ক্রিকেট (Cricket)' : 'Cricket'}</option>
                      <option value="sports">{lang === 'bn' ? 'অন্যান্য খেলাধুলা (Sports)' : 'Sports'}</option>
                      <option value="national_day">{lang === 'bn' ? 'জাতীয় দিবস (National Day)' : 'National Day'}</option>
                      <option value="cultural">{lang === 'bn' ? 'সাংস্কৃতিক (Cultural)' : 'Cultural'}</option>
                      <option value="festival">{lang === 'bn' ? 'উৎসব (Festival)' : 'Festival'}</option>
                      <option value="community">{lang === 'bn' ? 'সামাজিক (Community)' : 'Community'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'তারিখ (Date) *' : 'Date *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2026-12-20"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'স্থান (বাংলা)' : 'Venue (Bengali)'}
                    </label>
                    <input
                      type="text"
                      value={venueBn}
                      onChange={(e) => setVenueBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'স্থান (English)' : 'Venue (English)'}
                    </label>
                    <input
                      type="text"
                      value={venueEn}
                      onChange={(e) => setVenueEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'কভার ছবির লিংক (Image URL)' : 'Cover Image URL'}
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Short Description (Bengali)'}
                    </label>
                    <textarea
                      rows={2}
                      value={shortDescBn}
                      onChange={(e) => setShortDescBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
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
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Registration options */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={registrationEnabled}
                        onChange={(e) => setRegistrationEnabled(e.target.checked)}
                        className="rounded text-[#F26522]"
                      />
                      <span>{lang === 'bn' ? 'অনলাইন দল নিবন্ধন চালু রাখুন' : 'Enable Online Team Registration'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={showInHero}
                        onChange={(e) => setShowInHero(e.target.checked)}
                        className="rounded text-[#F26522]"
                      />
                      <span>{lang === 'bn' ? 'Homepage Hero তে প্রদর্শন করুন' : 'Show in Homepage Hero'}</span>
                    </label>
                  </div>

                  {registrationEnabled && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'নিবন্ধন ফি (₹)' : 'Reg Fee (₹)'}
                        </label>
                        <input
                          type="number"
                          value={registrationFee}
                          onChange={(e) => setRegistrationFee(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'নূন্যতম খেলোয়াড়' : 'Min Players'}
                        </label>
                        <input
                          type="number"
                          value={minPlayers}
                          onChange={(e) => setMinPlayers(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'সর্বোচ্চ খেলোয়াড়' : 'Max Players'}
                        </label>
                        <input
                          type="number"
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#1d3575]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-60 shadow-md flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Event'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Event Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTargetId)}
          title={lang === 'bn' ? 'অনুষ্ঠান মুছে ফেলা নিশ্চিতকরণ' : 'Confirm Event Deletion'}
          message={
            lang === 'bn'
              ? 'আপনি কি নিশ্চিত যে এই অনুষ্ঠানটি মুছে ফেলতে চান? এটি মুছে ফেললে এর সাথে যুক্ত নিবন্ধন ও বিবরণ প্রদর্শিত হবে না।'
              : 'Are you sure you want to delete this event? This action will permanently remove it from the schedule.'
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete Event'}
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
