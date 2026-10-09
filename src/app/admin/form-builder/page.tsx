'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { FormFieldDefinition } from '@/types';
import { Sliders, Plus, Trash2, CheckCircle2, ArrowUpDown } from 'lucide-react';

export default function FormBuilderPage() {
  const { lang, resolveBilingual } = useLanguage();
  const [fields, setFields] = useState<FormFieldDefinition[]>([
    {
      id: 'f_team_name',
      name: 'teamName',
      label: { bn: 'দলের নাম', en: 'Team Name' },
      type: 'text',
      required: true,
      placeholder: { bn: 'দলের নাম লিখুন', en: 'Enter Team Name' },
      order: 1,
    },
    {
      id: 'f_rep_name',
      name: 'repName',
      label: { bn: 'দল প্রতিনিধির নাম', en: 'Representative Name' },
      type: 'text',
      required: true,
      placeholder: { bn: 'প্রতিনিধির পুরো নাম', en: 'Full Name' },
      order: 2,
    },
    {
      id: 'f_phone',
      name: 'phone',
      label: { bn: 'মোবাইল নম্বর (হোয়াটসঅ্যাপ)', en: 'WhatsApp / Mobile' },
      type: 'phone',
      required: true,
      order: 3,
    },
    {
      id: 'f_blood_group',
      name: 'bloodGroup',
      label: { bn: 'রক্তের গ্রুপ (ঐচ্ছিক)', en: 'Blood Group (Optional)' },
      type: 'select',
      options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      required: false,
      order: 4,
    },
  ]);

  const [newLabelBn, setNewLabelBn] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newType, setNewType] = useState<FormFieldDefinition['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelBn.trim()) return;

    const newField: FormFieldDefinition = {
      id: `f_${Date.now()}`,
      name: `field_${Date.now()}`,
      label: { bn: newLabelBn.trim(), en: newLabelEn.trim() || newLabelBn.trim() },
      type: newType,
      required: newRequired,
      order: fields.length + 1,
    };

    setFields([...fields, newField]);
    setNewLabelBn('');
    setNewLabelEn('');
    setNewType('text');
    setNewRequired(false);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSaveSchema = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {lang === 'bn' ? 'ডাইনামিক ফর্ম বিল্ডার' : 'Dynamic Form Builder'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'bn'
              ? 'ভবিষ্যতের যেকোনো প্রতিযোগিতা বা সামাজিক ইভেন্টের জন্য কাস্টম নিবন্ধন ফর্ম তৈরি ও পরিচালনা করুন।'
              : 'Create and configure custom team registration form fields dynamically.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              {lang === 'bn'
                ? '✓ ফর্ম কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!'
                : '✓ Form configuration saved successfully!'}
            </span>
          </div>
        )}

        {/* Existing Fields List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-[#1d3575]">
            {lang === 'bn'
              ? `বর্তমান সক্রিয় ফর্ম ফিল্ডসমূহ (${fields.length} টি)`
              : `Active Form Fields (${fields.length})`}
          </h3>

          <div className="space-y-2.5">
            {fields.map((f, idx) => (
              <div
                key={f.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-100 dark:border-[#1d3575]/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {resolveBilingual(f.label)}{' '}
                      <span className="text-slate-400 font-normal">
                        ({lang === 'bn' ? f.label.en : f.label.bn})
                      </span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {lang === 'bn' ? 'টাইপ:' : 'Type:'}{' '}
                      <span className="font-mono text-[#F26522] uppercase">{f.type}</span> |{' '}
                      {f.required ? (
                        <span className="text-rose-500 font-bold">
                          {lang === 'bn' ? 'বাধ্যতামূলক (Required)' : 'Required'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveField(f.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Field Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-[#1d3575]">
            {lang === 'bn' ? 'নতুন ফিল্ড যোগ করুন' : 'Add Custom Form Field'}
          </h3>

          <form onSubmit={handleAddField} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'ফিল্ডের নাম (বাংলা লেবেল) *' : 'Field Label (Bengali) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'উদাঃ অধিনায়কের জার্সি সাইজ' : 'e.g. Captain Jersey Size'}
                  value={newLabelBn}
                  onChange={(e) => setNewLabelBn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'Field Label (English)' : 'Field Label (English)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Captain Jersey Size"
                  value={newLabelEn}
                  onChange={(e) => setNewLabelEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'ফিল্ডের টাইপ (Input Type)' : 'Field Input Type'}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                >
                  <option value="text">{lang === 'bn' ? 'Text (ছোট লেখা)' : 'Text (Short text)'}</option>
                  <option value="number">{lang === 'bn' ? 'Number (সংখ্যা)' : 'Number'}</option>
                  <option value="phone">{lang === 'bn' ? 'Phone (মোবাইল নম্বর)' : 'Phone (Mobile)'}</option>
                  <option value="email">{lang === 'bn' ? 'Email (ইমেইল)' : 'Email'}</option>
                  <option value="textarea">{lang === 'bn' ? 'Textarea (বড় বিবরণ)' : 'Textarea (Paragraph)'}</option>
                  <option value="select">{lang === 'bn' ? 'Dropdown (তালিকা নির্বাচন)' : 'Dropdown (Select)'}</option>
                  <option value="checkbox">{lang === 'bn' ? 'Checkbox (টিকবক্স)' : 'Checkbox'}</option>
                </select>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F26522]"
                  />
                  <span>
                    {lang === 'bn'
                      ? 'পূরণ করা বাধ্যতামূলক (Required Field)'
                      : 'Required field'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ফিল্ড যোগ করুন' : 'Add Field'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSchema}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#08143A] dark:bg-[#19398A] hover:bg-[#112766] shadow-md"
              >
                {lang === 'bn' ? 'ফর্ম স্কিমা সংরক্ষণ করুন' : 'Save Form Schema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
