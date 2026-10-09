'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n/context';
import { PostAnnouncement } from '@/types';
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
} from 'lucide-react';
import ImageSlider from '@/components/common/ImageSlider';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminPostsPage() {
  const { lang, resolveBilingual } = useLanguage();
  const toast = useToast();
  const [posts, setPosts] = useState<PostAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostAnnouncement | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [category, setCategory] = useState<'notice' | 'ipl' | 'event' | 'urgent'>('notice');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setTitleBn('');
    setTitleEn('');
    setContentBn('');
    setContentEn('');
    setCategory('notice');
    setImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PostAnnouncement) => {
    setEditingPost(p);
    setTitleBn(p.title.bn);
    setTitleEn(p.title.en || '');
    setContentBn(p.content.bn);
    setContentEn(p.content.en || '');
    setCategory(p.category as any);
    setImages(p.images || (p.coverImage ? [p.coverImage] : []));
    setIsModalOpen(true);
  };

  // Upload multiple images to Cloudinary
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
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(lang === 'bn' ? 'ছবি সফলভাবে আপলোড হয়েছে' : 'Images uploaded successfully');
      }
    } catch (err: any) {
      toast.error('Upload error: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: { bn: titleBn, en: titleEn },
      content: { bn: contentBn, en: contentEn },
      category,
      coverImage: images[0] || '',
      images,
      published: true,
      featured: category === 'urgent',
    };

    try {
      if (editingPost) {
        await fetch(`/api/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'পোস্ট সফলভাবে আপডেট করা হয়েছে' : 'Post updated successfully');
      } else {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        toast.success(lang === 'bn' ? 'নতুন পোস্ট সফলভাবে তৈরি হয়েছে' : 'New post created successfully');
      }
      setIsModalOpen(false);
      loadPosts();
    } catch (err: any) {
      toast.error('Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(lang === 'bn' ? 'পোস্ট সফলভাবে মুছে ফেলা হয়েছে' : 'Post deleted successfully');
      setDeleteTargetId(null);
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting post');
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
              {lang === 'bn' ? 'বিজ্ঞপ্তি, আপডেট ও ইনস্টাগ্রাম পোস্ট' : 'Notices, Updates & Community Posts'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === 'bn'
                ? 'গ্রামের নোটিশ অথবা একাধিক ছবি ও ক্যাপশন সহ ইনস্টাগ্রাম-স্টাইল পোস্ট প্রকাশ করুন।'
                : 'Publish official notices or Instagram-style community posts with multiple photos & captions.'}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white flex items-center gap-2 shadow-md shrink-0 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post'}</span>
          </button>
        </div>

        {/* Post Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const postImages = post.images && post.images.length > 0 ? post.images : post.coverImage ? [post.coverImage] : [];
            return (
              <div
                key={post.id}
                className="rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Slider if photos exist */}
                {postImages.length > 0 && (
                  <div className="relative">
                    <ImageSlider images={postImages} alt={post.title.bn} aspectRatio="video" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          post.category === 'urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : post.category === 'ipl'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {post.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2">
                      {resolveBilingual(post.title)}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {resolveBilingual(post.content)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1d3575] text-xs">
                    <span className="text-[11px] text-slate-400">
                      {postImages.length > 0 ? `${postImages.length} images` : 'No images'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all hover:scale-110"
                        title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(post.id)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl transition-all hover:scale-110"
                        title={lang === 'bn' ? 'মুছুন' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white dark:bg-[#071333] rounded-3xl border border-slate-200 dark:border-[#1d3575] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#1d3575]">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#F26522]" />
                  <span>
                    {editingPost
                      ? lang === 'bn'
                        ? 'পোস্ট / বিজ্ঞপ্তি সম্পাদনা'
                        : 'Edit Post / Notice'
                      : lang === 'bn'
                      ? 'নতুন পোস্ট / বিজ্ঞপ্তি তৈরি'
                      : 'Create New Post / Notice'}
                  </span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'পোস্ট শিরোনাম (বাংলা) *' : 'Post Title (Bengali) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="উদাঃ আজকের ম্যাচ ফলাফল বা জরুরি নোটিশ"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                      {lang === 'bn' ? 'Title (English)' : 'Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Today's match results or announcement"
                    />
                  </div>
                </div>

                {/* Multiple Images Upload Box */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#040d21] border border-dashed border-slate-300 dark:border-[#1d3575]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span>
                        {lang === 'bn'
                          ? 'ছবি আপলোড করুন (একাধিক ছবি সমর্থিত)'
                          : 'Upload Photos (Multiple Supported)'}
                      </span>
                    </label>
                    <span className="text-[11px] font-bold text-slate-500">{images.length} selected</span>
                  </div>

                  {/* Thumbnail gallery preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                      {images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm">
                          <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md hover:scale-[1.01] transition-all">
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'bn' ? 'ছবি ক্লাউডিনারিতে আপলোড হচ্ছে...' : 'Uploading to Cloudinary...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{lang === 'bn' ? '+ গ্যালারি থেকে এক বা একাধিক ছবি সিলেক্ট করুন' : '+ Select One or Multiple Photos'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingImages}
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn'
                      ? 'ইনস্টাগ্রামের মতো একাধিক ছবি আপলোড করতে পারবেন। ব্যবহারকারীরা স্লাইড করে দেখতে পারবে।'
                      : 'Upload multiple pictures like Instagram carousel. Viewers can slide through them.'}
                  </p>
                </div>

                {/* Content / Caption */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'ক্যাপশন / বিবরণ (বাংলা) *' : 'Caption / Description (Bengali) *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contentBn}
                    onChange={(e) => setContentBn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="পোস্টের মূল বক্তব্য বা ছবির বিবরণ লিখুন..."
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'Caption (English)' : 'Caption (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="English description or caption..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'বিভাগ *' : 'Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    <option value="notice">সাধারণ নোটিশ (General Notice)</option>
                    <option value="ipl">আইপিএল ও খেলাধুলা (IPL & Sports)</option>
                    <option value="event">মহোৎসব ও অনুষ্ঠান (Event & Festival)</option>
                    <option value="urgent">জরুরি ঘোষণা (Urgent Alert)</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="px-6 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 disabled:opacity-50 shadow-md hover:scale-105 transition-all"
                  >
                    {saving
                      ? lang === 'bn'
                        ? 'সংরক্ষণ হচ্ছে...'
                        : 'Saving...'
                      : lang === 'bn'
                      ? 'পোস্ট প্রকাশ করুন'
                      : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Post Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTargetId)}
          title={lang === 'bn' ? 'পোস্ট মুছে ফেলা নিশ্চিতকরণ' : 'Confirm Post Deletion'}
          message={
            lang === 'bn'
              ? 'আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান? মুছে ফেলার পর এটি ওয়েবসাইট থেকে চিরতরে মুছে যাবে।'
              : 'Are you sure you want to delete this notice/post? This action cannot be undone.'
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete Post'}
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
