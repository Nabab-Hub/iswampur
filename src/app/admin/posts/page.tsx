'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { PostAnnouncement, VillageEvent } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Bell,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Camera,
  FileDown,
  FileText,
  Calendar,
  Heart,
  ChevronRight,
  Eye,
  Award,
} from 'lucide-react';
import ImageSlider from '@/components/common/ImageSlider';
import SocialPhotoGrid from '@/components/common/SocialPhotoGrid';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

function AdminPostsContent() {
  const { lang, resolveBilingual } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'notices' | 'posts'>(
    tabParam === 'posts' ? 'posts' : 'notices'
  );

  useEffect(() => {
    if (tabParam === 'posts') {
      setActiveTab('posts');
    } else {
      setActiveTab('notices');
    }
  }, [tabParam]);

  const [posts, setPosts] = useState<PostAnnouncement[]>([]);
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Notice Form State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<PostAnnouncement | null>(null);
  const [noticeTitleBn, setNoticeTitleBn] = useState('');
  const [noticeTitleEn, setNoticeTitleEn] = useState('');
  const [noticeContentBn, setNoticeContentBn] = useState('');
  const [noticeContentEn, setNoticeContentEn] = useState('');
  const [noticeMemoNo, setNoticeMemoNo] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'notice' | 'ipl' | 'urgent' | 'event'>('notice');
  const [noticeSignatory, setNoticeSignatory] = useState('');

  // Post Form State (Instagram style)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostAnnouncement | null>(null);
  const [postTitleBn, setPostTitleBn] = useState('');
  const [postTitleEn, setPostTitleEn] = useState('');
  const [postContentBn, setPostContentBn] = useState('');
  const [postContentEn, setPostContentEn] = useState('');
  const [postEventId, setPostEventId] = useState('');
  const [postEventName, setPostEventName] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Common State
  const [saving, setSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resPosts, resEvents] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/events'),
      ]);
      if (resPosts.ok) {
        const data = await resPosts.json();
        setPosts(data);
      }
      if (resEvents.ok) {
        const dataEvents = await resEvents.json();
        setEvents(dataEvents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: 'notices' | 'posts') => {
    setActiveTab(tab);
    if (tab === 'posts') {
      router.push('/admin/posts?tab=posts');
    } else {
      router.push('/admin/posts');
    }
  };

  // Notice Handlers
  const openCreateNoticeModal = () => {
    setEditingNotice(null);
    setNoticeTitleBn('');
    setNoticeTitleEn('');
    setNoticeContentBn('');
    setNoticeContentEn('');
    setNoticeMemoNo(`ISW/NOT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
    setNoticeDate(new Date().toISOString().split('T')[0]);
    setNoticeCategory('notice');
    setNoticeSignatory('General Secretary / Village Committee');
    setIsNoticeModalOpen(true);
  };

  const openEditNoticeModal = (p: PostAnnouncement) => {
    setEditingNotice(p);
    setNoticeTitleBn(p.title.bn);
    setNoticeTitleEn(p.title.en || '');
    setNoticeContentBn(p.content.bn);
    setNoticeContentEn(p.content.en || '');
    setNoticeMemoNo(p.memoNo || '');
    setNoticeDate(p.date || p.createdAt?.split('T')[0] || '');
    setNoticeCategory((p.category as any) || 'notice');
    setNoticeSignatory(p.signatory || 'General Secretary / Village Committee');
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      type: 'notice',
      title: { bn: noticeTitleBn, en: noticeTitleEn },
      content: { bn: noticeContentBn, en: noticeContentEn },
      memoNo: noticeMemoNo,
      date: noticeDate,
      category: noticeCategory,
      signatory: noticeSignatory,
      images: [], // Notices are strictly text-only
      published: true,
      featured: noticeCategory === 'urgent',
    };

    try {
      if (editingNotice) {
        await fetch(`/api/posts/${editingNotice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'বিজ্ঞপ্তি আপডেট হয়েছে' : 'Notice updated successfully');
      } else {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'নতুন নোটিশ সফলভাবে তৈরি হয়েছে' : 'Official notice created successfully');
      }
      setIsNoticeModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Post Handlers (Instagram style)
  const openCreatePostModal = () => {
    setEditingPost(null);
    setPostTitleBn('');
    setPostTitleEn('');
    setPostContentBn('');
    setPostContentEn('');
    setPostEventId(events[0]?.id || '');
    setPostEventName(events[0] ? resolveBilingual(events[0].title) : '');
    setPostImages([]);
    setIsPostModalOpen(true);
  };

  const openEditPostModal = (p: PostAnnouncement) => {
    setEditingPost(p);
    setPostTitleBn(p.title.bn);
    setPostTitleEn(p.title.en || '');
    setPostContentBn(p.content.bn);
    setPostContentEn(p.content.en || '');
    setPostEventId(p.eventId || '');
    setPostEventName(p.eventName || '');
    setPostImages(p.images || (p.coverImage ? [p.coverImage] : []));
    setIsPostModalOpen(true);
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setPostImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(lang === 'bn' ? 'ছবি সফলভাবে যুক্ত হয়েছে' : 'Images uploaded successfully');
      }
    } catch (err: any) {
      toast.error('Upload error: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removePostImage = (idxToRemove: number) => {
    setPostImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postImages.length === 0) {
      toast.error(lang === 'bn' ? 'অন্তত একটি ছবি আপলোড করুন' : 'Please upload at least one image');
      return;
    }
    setSaving(true);
    const selectedEvent = events.find((ev) => ev.id === postEventId);

    const payload = {
      type: 'post',
      title: { bn: postTitleBn, en: postTitleEn },
      content: { bn: postContentBn, en: postContentEn },
      category: 'event',
      eventId: postEventId,
      eventName: selectedEvent ? resolveBilingual(selectedEvent.title) : postEventName || 'Village Celebration',
      images: postImages,
      coverImage: postImages[0] || '',
      published: true,
      featured: false,
    };

    try {
      if (editingPost) {
        await fetch(`/api/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'পোস্ট আপডেট হয়েছে' : 'Post updated successfully');
      } else {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'পোস্ট সফলভাবে প্রকাশিত হয়েছে' : 'Community post created successfully');
      }
      setIsPostModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async (postId: string, memoNo?: string) => {
    try {
      setDownloadingPdfId(postId);
      const res = await fetch(`/api/notices/${postId}/pdf`);
      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Notice-${memoNo ? memoNo.replace(/[^a-zA-Z0-9_-]/g, '_') : postId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(lang === 'bn' ? 'নোটিশ PDF ডাউনলোড সম্পন্ন' : 'Notice PDF downloaded successfully');
    } catch (err: any) {
      toast.error('PDF download error: ' + err.message);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(lang === 'bn' ? 'আইটেম মুছে ফেলা হয়েছে' : 'Item deleted successfully');
      setDeleteTargetId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Categorize lists
  const noticesList = posts.filter(
    (p) => p.type === 'notice' || (!p.type && (!p.images || p.images.length === 0))
  );
  const postsList = posts.filter(
    (p) => p.type === 'post' || (!p.type && p.images && p.images.length > 0)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1d3575] pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>{lang === 'bn' ? 'বিজ্ঞপ্তি, আপডেট ও পোস্ট হাব' : 'Notices, Updates & Posts Hub'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'অফিসিয়াল টেক্সট নোটিশ প্রকাশ ও পিডিএফ ডাউনলোড করুন, অথবা হোমপেজের জন্য ইনস্টাগ্রাম-স্টাইল ফটো পোস্ট তৈরি করুন।'
                : 'Publish text-only official notices with downloadable official PDFs, or create Instagram-style event photo posts for the homepage.'}
            </p>
          </div>

          {/* Action Button depending on active tab */}
          {activeTab === 'notices' ? (
            <button
              onClick={openCreateNoticeModal}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#19398A] to-[#00A3E0] hover:brightness-110 text-white flex items-center gap-2 shadow-md shrink-0 hover:scale-105 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন নোটিশ তৈরি করুন (Text Only)' : 'Create Official Notice (Text)'}</span>
            </button>
          ) : (
            <button
              onClick={openCreatePostModal}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white flex items-center gap-2 shadow-md shrink-0 hover:scale-105 transition-all self-start md:self-auto"
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন পোস্ট তৈরি করুন (Multi-Image)' : 'Create Event Post (Photos)'}</span>
            </button>
          )}
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] w-full sm:w-fit">
          <button
            onClick={() => handleTabChange('notices')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'notices'
                ? 'bg-[#19398A] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-[#F9A01B]" />
            <span>{lang === 'bn' ? 'অফিসিয়াল নোটিশ ও সার্কুলার' : 'Official Notices & Circulars'}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
              {noticesList.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('posts')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ইভেন্ট পোস্ট ও ছবি (Instagram Feed)' : 'Event Posts (Instagram Feed)'}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20">
              {postsList.length}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: NOTICES & UPDATES (TEXT ONLY WITH PDF DOWNLOAD)         */}
        {/* ============================================================== */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-extrabold text-blue-900 dark:text-blue-200">
                  {lang === 'bn'
                    ? 'অফিসিয়াল টেক্সট নোটিশ ও পিডিএফ ডাউনলোড সিস্টেম'
                    : 'Text-Only Official Notice System with PDF Download'}
                </p>
                <p className="text-blue-800 dark:text-blue-300">
                  {lang === 'bn'
                    ? 'নোটিশে ছবি আপলোড ছাড়াই সরাসরি টেক্সট প্রকাশ করা হয়। প্রতিটি নোটিশে অফিসিয়াল লোগো, মেমো নং ও স্ট্যাম্প যুক্ত পিডিএফ ডাউনলোড করা যাবে।'
                    : 'Notices are text-only with zero images required. Each notice includes an instant official PDF download featuring the village logo header, memo reference, and official seal.'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#19398A]" />
                <span>{lang === 'bn' ? 'বিজ্ঞপ্তি লোড হচ্ছে...' : 'Loading notices...'}</span>
              </div>
            ) : noticesList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071333] border border-dashed border-slate-300 dark:border-[#1d3575]">
                <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি।' : 'No official notices currently created.'}
                </p>
                <button
                  onClick={openCreateNoticeModal}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#19398A] text-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্রথম নোটিশ প্রকাশ করুন' : 'Create First Notice'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {noticesList.map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top Bar: Category & Date */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            notice.category === 'urgent'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : notice.category === 'ipl'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {notice.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span suppressHydrationWarning>{notice.date || new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Memo No */}
                      {notice.memoNo && (
                        <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#040d21] px-2 py-0.5 rounded w-fit">
                          REF: {notice.memoNo}
                        </p>
                      )}

                      {/* Title */}
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {resolveBilingual(notice.title)}
                      </h3>

                      {/* Content Body Preview */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-line bg-slate-50/60 dark:bg-[#030919] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {resolveBilingual(notice.content)}
                      </p>

                      {notice.signatory && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold italic">
                          By: {notice.signatory}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions: PDF Download + Edit + Delete */}
                    <div className="p-4 bg-slate-50/70 dark:bg-[#050e26] border-t border-slate-100 dark:border-[#1d3575] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleDownloadPdf(notice.id, notice.memoNo)}
                        disabled={downloadingPdfId === notice.id}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-[#19398A] hover:bg-[#00A3E0] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        title="Download official PDF notice"
                      >
                        {downloadingPdfId === notice.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileDown className="w-3.5 h-3.5 text-[#F9A01B]" />
                        )}
                        <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditNoticeModal(notice)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all hover:scale-110"
                          title={lang === 'bn' ? 'সম্পাদনা' : 'Edit Notice'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(notice.id)}
                          className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl transition-all hover:scale-110"
                          title={lang === 'bn' ? 'মুছুন' : 'Delete Notice'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: POSTS SECTION (INSTAGRAM STYLE MULTI-IMAGE FEED)        */}
        {/* ============================================================== */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3">
              <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-extrabold text-amber-900 dark:text-amber-200">
                  {lang === 'bn'
                    ? 'গ্রামের ইভেন্ট ও ফটো পোস্ট (Instagram Style Feed)'
                    : 'Village Event Highlights & Multi-Photo Posts (Instagram Feed)'}
                </p>
                <p className="text-amber-800 dark:text-amber-300">
                  {lang === 'bn'
                    ? 'এখানে যেকোনো অনুষ্ঠানের একাধিক ছবি ও ক্যাপশন আপলোড করুন। এই পোস্টগুলো সরাসরি হোমপেজের "Village Events & Celebrations" সেকশনে প্রদর্শিত হবে।'
                    : 'Upload multiple photos with rich captions for any village event. These posts will be automatically showcased under "Village Events & Celebrations" on the homepage.'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#F26522]" />
                <span>{lang === 'bn' ? 'পোস্ট লোড হচ্ছে...' : 'Loading posts...'}</span>
              </div>
            ) : postsList.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071333] border border-dashed border-slate-300 dark:border-[#1d3575]">
                <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {lang === 'bn' ? 'কোনো ফটো পোস্ট তৈরি করা হয়নি।' : 'No community photo posts created yet.'}
                </p>
                <button
                  onClick={openCreatePostModal}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্রথম পোস্ট তৈরি করুন' : 'Create First Post'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postsList.map((post) => {
                  const postImages =
                    post.images && post.images.length > 0
                      ? post.images
                      : post.coverImage
                      ? [post.coverImage]
                      : [];

                  return (
                    <div
                      key={post.id}
                      className="rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header with clean wrap */}
                        <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#1d3575]">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F26522] to-[#F9A01B] p-0.5 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 mt-0.5">
                              <Award className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug break-words">
                                {post.eventName || 'Village Event'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">@iswampur.celebration</p>
                            </div>
                          </div>

                          <span suppressHydrationWarning className="text-[11px] font-mono text-slate-400 shrink-0 mt-0.5">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Title & Caption (Facebook/LinkedIn style) */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {resolveBilingual(post.title)}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-medium">
                            {resolveBilingual(post.content)}
                          </p>
                        </div>

                        {/* Facebook / LinkedIn Multi-Photo Grid */}
                        {postImages.length > 0 && (
                          <div className="border-t border-b border-slate-100 dark:border-[#142654]">
                            <SocialPhotoGrid images={postImages} alt={post.title.bn} />
                          </div>
                        )}

                        {/* Likes & Stats */}
                        <div className="p-3.5 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 text-rose-500">
                            <Heart className="w-4 h-4 fill-rose-500" />
                            <span>{post.likesCount || 0} likes</span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {postImages.length} {postImages.length === 1 ? 'photo' : 'photos'} (Click to expand)
                          </span>
                        </div>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="p-3.5 bg-slate-50/70 dark:bg-[#050e26] border-t border-slate-100 dark:border-[#1d3575] flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Linked: {post.eventName || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditPostModal(post)}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all hover:scale-110"
                            title={lang === 'bn' ? 'সম্পাদনা' : 'Edit Post'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(post.id)}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl transition-all hover:scale-110"
                            title={lang === 'bn' ? 'মুছুন' : 'Delete Post'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: CREATE / EDIT NOTICE (STRICTLY TEXT ONLY)             */}
        {/* ============================================================== */}
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#071333] rounded-3xl border border-slate-200 dark:border-[#1d3575] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>
                    {editingNotice
                      ? lang === 'bn'
                        ? 'অফিসিয়াল নোটিশ সম্পাদনা (Text Only)'
                        : 'Edit Official Notice (Text Only)'
                      : lang === 'bn'
                      ? 'নতুন অফিসিয়াল নোটিশ তৈরি (Text Only)'
                      : 'Create Official Notice (Text Only)'}
                  </span>
                </h3>
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
                {/* Category & Memo No */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'ক্যাটাগরি *' : 'Category *'}
                    </label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-bold"
                    >
                      <option value="notice">NOTICE (সাধারণ নোটিশ)</option>
                      <option value="urgent">URGENT (জরুরি বিজ্ঞপ্তি)</option>
                      <option value="ipl">IPL (ক্রিকেট টুর্নামেন্ট)</option>
                      <option value="event">EVENT (অন্যান্য অনুষ্ঠান)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'মেমো / রেফারেন্স নং' : 'Memo / Ref No'}
                    </label>
                    <input
                      type="text"
                      value={noticeMemoNo}
                      onChange={(e) => setNoticeMemoNo(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-mono"
                      placeholder="e.g. ISW/NOT/2026/01"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'তারিখ' : 'Notice Date'}
                    </label>
                    <input
                      type="date"
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'নোটিশ শিরোনাম (বাংলা) *' : 'Notice Title (Bengali) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={noticeTitleBn}
                      onChange={(e) => setNoticeTitleBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="উদাঃ আইপিএল ২০২৬ এর অনলাইন দল নিবন্ধন সংক্রান্ত বিজ্ঞপ্তি"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Title (English) *' : 'Title (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={noticeTitleEn}
                      onChange={(e) => setNoticeTitleEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Official Notification on IPL 2026 Team Registration"
                    />
                  </div>
                </div>

                {/* Contents */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'নোটিশের বিস্তারিত বিবরণ (বাংলা) *' : 'Notice Content (Bengali) *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={noticeContentBn}
                    onChange={(e) => setNoticeContentBn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white leading-relaxed"
                    placeholder="নোটিশের বিস্তারিত বয়ান বাংলায় লিখুন..."
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'Notice Content (English - For Official PDF) *' : 'Notice Content (English - For Official PDF) *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={noticeContentEn}
                    onChange={(e) => setNoticeContentEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white leading-relaxed"
                    placeholder="Enter the official notice body in English. This text is formally formatted into the downloadable PDF with official logo and seal..."
                  />
                </div>

                {/* Signatory */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'আদেশক্রমে / স্বাক্ষরকারী পদবি' : 'Signatory Designation'}
                  </label>
                  <input
                    type="text"
                    value={noticeSignatory}
                    onChange={(e) => setNoticeSignatory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. General Secretary / Tournament Convener, Iswampur Committee"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#1d3575]">
                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-[#19398A] hover:bg-[#00A3E0] text-white font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingNotice ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Notice') : (lang === 'bn' ? 'নোটিশ প্রকাশ করুন' : 'Publish Notice')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: CREATE / EDIT POST (INSTAGRAM STYLE MULTI-IMAGE)      */}
        {/* ============================================================== */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#071333] rounded-3xl border border-slate-200 dark:border-[#1d3575] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#F26522]" />
                  <span>
                    {editingPost
                      ? lang === 'bn'
                        ? 'ইভেন্ট পোস্ট সম্পাদনা (Instagram Style)'
                        : 'Edit Event Post (Instagram Style)'
                      : lang === 'bn'
                      ? 'নতুন ইভেন্ট পোস্ট তৈরি (Instagram Style)'
                      : 'Create Event Post (Instagram Style)'}
                  </span>
                </h3>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-4 text-xs">
                {/* Event Selector Dropdown */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'কোন অনুষ্ঠানের পোস্ট? (Event Selector) *' : 'Select Associated Event *'}
                  </label>
                  <select
                    value={postEventId}
                    onChange={(e) => {
                      setPostEventId(e.target.value);
                      const ev = events.find((item) => item.id === e.target.value);
                      if (ev) setPostEventName(resolveBilingual(ev.title));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-bold"
                  >
                    <option value="">{lang === 'bn' ? 'সার্বজনীন অনুষ্ঠান / উৎসব (General Celebration)' : 'General Celebration'}</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {resolveBilingual(ev.title)} ({ev.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multiple Images Upload Box */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-dashed border-slate-300 dark:border-[#1d3575]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#F26522]" />
                      <span>
                        {lang === 'bn'
                          ? 'ছবি আপলোড করুন (একাধিক ছবি সমর্থিত - Instagram Post)'
                          : 'Upload Photos (Multiple Supported - Instagram Post)'}
                      </span>
                    </label>
                    <span className="text-[11px] font-bold text-slate-500">
                      {postImages.length} {lang === 'bn' ? 'টি ছবি নির্বাচিত' : 'photos'}
                    </span>
                  </div>

                  {/* Thumbnail gallery preview */}
                  {postImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                      {postImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`Upload ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePostImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload input */}
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer text-slate-700 dark:text-slate-200 font-bold transition-all mt-2">
                    {uploadingImages ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#F26522]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#F26522]" />
                    )}
                    <span>
                      {uploadingImages
                        ? lang === 'bn'
                          ? 'ছবি আপলোড হচ্ছে...'
                          : 'Uploading images...'
                        : lang === 'bn'
                        ? '+ আরও ছবি যুক্ত করুন (Select Multiple Files)'
                        : '+ Select Photos (Supports Multiple Files)'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleMultipleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                </div>

                {/* Post Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'পোস্ট শিরোনাম / ক্যাপশন (বাংলা) *' : 'Post Title / Highlight (Bengali) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={postTitleBn}
                      onChange={(e) => setPostTitleBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="উদাঃ আজকের ম্যাচ প্রস্তুতি ও নেট প্র্যাকটিস ঝলক 🔥"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Title / Highlight (English)' : 'Title / Highlight (English)'}
                    </label>
                    <input
                      type="text"
                      value={postTitleEn}
                      onChange={(e) => setPostTitleEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Pitch preparation & evening warmups highlights 🔥"
                    />
                  </div>
                </div>

                {/* Post Caption / Story Text */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'ক্যাপশন ও স্টোরি টেক্সট (বাংলা) *' : 'Post Caption & Description (Bengali) *'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={postContentBn}
                      onChange={(e) => setPostContentBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white leading-relaxed"
                      placeholder="ইনস্টাগ্রাম-স্টাইল স্টোরি বা ক্যাপশন লিখুন..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Caption (English)' : 'Caption (English)'}
                    </label>
                    <textarea
                      rows={2}
                      value={postContentEn}
                      onChange={(e) => setPostContentEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white leading-relaxed"
                      placeholder="English caption..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#1d3575]">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white font-bold flex items-center gap-2 shadow-md hover:brightness-110 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingPost ? (lang === 'bn' ? 'পোস্ট আপডেট করুন' : 'Update Post') : (lang === 'bn' ? 'পোস্ট প্রকাশ করুন' : 'Publish Post')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={!!deleteTargetId}
          title={lang === 'bn' ? 'মুছে ফেলতে চান?' : 'Confirm Deletion'}
          message={
            lang === 'bn'
              ? 'আপনি কি নিশ্চিত যে এই আইটেমটি স্থায়ীভাবে মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।'
              : 'Are you sure you want to permanently delete this item? This action cannot be undone.'
          }
          confirmText={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
          cancelText={lang === 'bn' ? 'বাতিল' : 'Cancel'}
          isDestructive={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </AdminLayout>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <div className="p-12 text-center text-slate-400 font-bold">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#19398A]" />
          </div>
        </AdminLayout>
      }
    >
      <AdminPostsContent />
    </Suspense>
  );
}
