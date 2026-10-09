'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { PostAnnouncement } from '@/types';
import { Bell, Calendar, Sparkles } from 'lucide-react';
import ImageSlider from '@/components/common/ImageSlider';

export default function AnnouncementsPage() {
  const { lang, t, resolveBilingual } = useLanguage();
  const [posts, setPosts] = useState<PostAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19398A] text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <Bell className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>OFFICIAL NOTICES &amp; ANNOUNCEMENTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'জরুরি বিজ্ঞপ্তি ও ঘোষণা' : 'Village Notices & Announcements'}
            </h1>
            <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn'
                ? 'গ্রাম কমিটির অফিসিয়াল নোটিশ, টুর্নামেন্টের ফলাফল ও সাধারণ তথ্যাবলী।'
                : 'Official announcements from Iswampur village committee, cricket updates, and public notices.'}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#273656] dark:text-[#CBD5E1] font-bold">
              {lang === 'bn' ? 'বিজ্ঞপ্তি লোড হচ্ছে...' : 'Loading announcements...'}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-[#273656] dark:text-[#CBD5E1] font-bold">
              {lang === 'bn' ? 'বর্তমানে কোনো বিজ্ঞপ্তি নেই।' : 'No notices currently available.'}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const postImages =
                  post.images && post.images.length > 0
                    ? post.images
                    : post.coverImage
                    ? [post.coverImage]
                    : [];

                return (
                  <article
                    key={post.id}
                    className="rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] hover:border-[#F26522] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 space-y-4"
                  >
                    {/* Multi-Image Carousel Header if images present */}
                    {postImages.length > 0 && (
                      <div className="w-full">
                        <ImageSlider images={postImages} alt={post.title.bn} aspectRatio="video" />
                      </div>
                    )}

                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-[#cbd9ec] dark:border-[#1d3575]">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                            post.category === 'urgent'
                              ? 'bg-rose-600 text-white'
                              : post.category === 'ipl'
                              ? 'bg-gradient-to-r from-[#F26522] to-[#F9A01B] text-white'
                              : 'bg-[#19398A] text-white'
                          }`}
                        >
                          {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                          <Calendar className="w-3.5 h-3.5 text-[#F26522]" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-black text-[#08143A] dark:text-white">
                          {resolveBilingual(post.title)}
                        </h2>
                      </div>

                      <p className="text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-line font-medium">
                        {resolveBilingual(post.content)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
