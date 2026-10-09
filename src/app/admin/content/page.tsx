'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { SiteSettings } from '@/types';
import { Settings, Save, CheckCircle2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminContentPage() {
  const { lang } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch {
      alert(lang === 'bn' ? 'সেটিংস সংরক্ষণে ব্যর্থ হয়েছে' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                payment: { ...prev.payment, qrCodeUrl: data.url },
              }
            : null
        );
      } else {
        alert(data.error || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingQr(false);
    }
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-500">
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading settings...'}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {lang === 'bn'
              ? 'সাইট কন্টেন্ট ও পেমেন্ট কিউআর কনফিগারেশন'
              : 'Site Content & Payment QR Configuration'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'গ্রামের পরিচয়, যোগাযোগের তথ্য, এবং নিবন্ধন ফি গ্রহণের অফিসিয়াল কিউআর কোড পরিচালনা করুন।'
              : 'Manage village profile, contact details, and official registration fee payment QR code.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              {lang === 'bn'
                ? '✓ তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
                : '✓ Settings saved successfully!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Site Identity */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-[#1d3575]">
              {lang === 'bn'
                ? 'ওয়েবসাইট শিরোনাম ও ট্যাগলাইন (Bilingual)'
                : 'Website Title & Identity (Bilingual)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'সাইটের নাম (বাংলা) *' : 'Site Name (Bengali) *'}
                </label>
                <input
                  type="text"
                  required
                  value={settings.siteName.bn}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteName: { ...settings.siteName, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'Site Name (English)' : 'Site Name (English)'}
                </label>
                <input
                  type="text"
                  value={settings.siteName.en}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteName: { ...settings.siteName, en: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment QR Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-[#1d3575]">
              {lang === 'bn'
                ? 'পেমেন্ট কিউআর কোড ও ইউপিআই সেটিংস'
                : 'Payment QR Code & UPI Settings'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">UPI ID *</label>
                <input
                  type="text"
                  required
                  value={settings.payment.upiId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, upiId: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'প্রাপক / কমিটির নাম (Payee Name)' : 'Payee / Committee Name'}
                </label>
                <input
                  type="text"
                  value={settings.payment.payeeName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, payeeName: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'পেমেন্ট কিউআর কোড ছবি (Payment QR Code Image) *' : 'Payment QR Code Image *'}
                </label>

                {/* Upload Action Box */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-dashed border-slate-300 dark:border-[#1d3575]">
                  {settings.payment.qrCodeUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={settings.payment.qrCodeUrl}
                        alt="Payment QR"
                        className="w-28 h-28 object-contain rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-700 shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">No QR</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer transition-all hover:scale-[1.02]">
                      {uploadingQr ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading to Cloudinary...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'নতুন কিউআর ছবি আপলোড করুন' : 'Upload New QR Code Image'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingQr}
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'bn'
                        ? 'সরাসরি ডিভাইস থেকে UPI QR কোডের ছবি বা স্ক্রিনশট সিলেক্ট করুন (Cloudinary তে সেভ হবে)।'
                        : 'Choose UPI QR code image or screenshot directly from your device (stored in Cloudinary).'}
                    </p>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={settings.payment.qrCodeUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, qrCodeUrl: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Us */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-[#1d3575]">
              {lang === 'bn' ? 'গ্রামের বিবরণ (About Section)' : 'About Village Section'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'বিবরণ (বাংলা) *' : 'Description (Bengali) *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={settings.aboutText.bn}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aboutText: { ...settings.aboutText, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'About Text (English)' : 'Description (English)'}
                </label>
                <textarea
                  rows={4}
                  value={settings.aboutText.en}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aboutText: { ...settings.aboutText, en: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? lang === 'bn'
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : lang === 'bn'
                  ? 'সেটিংস সংরক্ষণ করুন'
                  : 'Save Settings'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
