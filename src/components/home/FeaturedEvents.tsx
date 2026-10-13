'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { VillageEvent, PostAnnouncement } from '@/types';
import EventCard from '@/components/events/EventCard';
import {
  Calendar,
  ArrowRight,
  Camera,
  Heart,
  Share2,
  Award,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import SocialPhotoGrid from '@/components/common/SocialPhotoGrid';

interface FeaturedEventsProps {
  events: VillageEvent[];
  posts?: PostAnnouncement[];
}

function SocialPostCard({ post }: { post: PostAnnouncement }) {
  const { lang, resolveBilingual } = useLanguage();
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const postImages =
    post.images && post.images.length > 0
      ? post.images
      : post.coverImage
      ? [post.coverImage]
      : [];

  const handleToggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nextState }),
      });
    } catch (err) {
      console.warn('Failed to update like status', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#post-${post.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: resolveBilingual(post.title),
          text: resolveBilingual(post.content),
          url: shareUrl,
        });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-3xl bg-white dark:bg-[#071333] border border-slate-200 dark:border-[#1d3575] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header with Clean Word Wrapping for Long Event Names */}
        <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#142654]">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F26522] via-[#F9A01B] to-[#00A3E0] p-0.5 shadow-sm shrink-0 mt-0.5">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#071333] flex items-center justify-center text-[#F26522]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-[#08143A] dark:text-white leading-snug break-words">
                <span>{post.eventName || (lang === 'bn' ? 'ঈশ্বমপুর উৎসব' : 'Iswampur Celebrations')}</span>
                <CheckCircle className="w-3.5 h-3.5 text-[#00A3E0] fill-[#00A3E0] text-white inline-block ml-1.5 align-middle shrink-0" />
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-[#F26522] dark:text-[#F9A01B] border border-orange-200 dark:border-orange-900/60 shrink-0 mt-0.5">
            {post.category || 'EVENT'}
          </span>
        </div>

        {/* Post Text & Story Description (Placed on top like Facebook & LinkedIn) */}
        <div className="p-4 space-y-1.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
            {resolveBilingual(post.title)}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3 font-medium">
            {resolveBilingual(post.content)}
          </p>
        </div>

        {/* Facebook/LinkedIn Multi-Photo Grid with Click-to-Enlarge Lightbox */}
        {postImages.length > 0 && (
          <SocialPhotoGrid
            images={postImages}
            alt={post.title.bn}
            className="w-full border-t border-b border-slate-100 dark:border-[#142654]"
          />
        )}
      </div>

      {/* Action Footer Bar (Like, Share & Linked Event) */}
      <div className="divide-y divide-slate-100 dark:divide-[#142654]">
        {/* Likes Count & Stats */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-xs">
              ❤️
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {likes} {likes === 1 ? 'like' : 'likes'}
            </span>
          </div>

          <span className="text-[11px] font-bold">
            {postImages.length} {postImages.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>

        {/* Interactive Action Buttons (Like & Share) */}
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                isLiked
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Like post"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-rose-600 scale-110' : ''
                }`}
              />
              <span>{isLiked ? (lang === 'bn' ? 'লাইকড' : 'Liked') : (lang === 'bn' ? 'লাইক' : 'Like')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share post"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4 text-[#00A3E0]" />
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'শেয়ার' : 'Share')}</span>
            </button>
          </div>

          {/* Linked Event Details Link */}
          {post.eventId && (
            <Link
              href={`/register/${post.eventId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#19398A] dark:text-[#00A3E0] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <span>{lang === 'bn' ? 'ইভেন্ট বিবরণ' : 'Event Info'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FeaturedEvents({ events, posts = [] }: FeaturedEventsProps) {
  const { lang, t } = useLanguage();

  const eventPosts = posts.filter(
    (p) => p.type === 'post' || (p.images && p.images.length > 0)
  );

  if ((!events || events.length === 0) && eventPosts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section 1: Upcoming Events Grid */}
        {events && events.length > 0 && (
          <div className="space-y-8 sm:space-y-10">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F26522] dark:text-[#F9A01B]">
                  <Calendar className="w-4 h-4" />
                  <span>{t.events.upcoming}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#08143A] dark:text-white">
                  {t.events.title}
                </h2>
                <p className="text-sm text-[#273656] dark:text-[#CBD5E1] max-w-xl font-medium">
                  {t.events.subtitle}
                </p>
              </div>

              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors group"
              >
                <span>{t.hero.exploreEvents}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Facebook / LinkedIn Style Community & Event Posts Feed */}
        {eventPosts.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-slate-200/80 dark:border-[#1d3575]/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00A3E0]">
                  <Camera className="w-4 h-4 text-[#F26522]" />
                  <span>
                    {lang === 'bn'
                      ? 'লাইভ পোস্ট ও মুহূর্ত'
                      : 'EVENT HIGHLIGHTS & COMMUNITY FEED'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#08143A] dark:text-white">
                  {lang === 'bn'
                    ? 'গ্রামের উৎসব ও টুর্নামেন্টের ফটো পোস্ট'
                    : 'Village Moments & Celebration Highlights'}
                </h3>
                <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] max-w-xl font-medium">
                  {lang === 'bn'
                    ? 'ফেসবুক ও লিঙ্কডইন স্টাইলে একাধিক ছবির পোস্ট—যেকোনো ছবিতে ক্লিক করে বড় করে দেখুন।'
                    : 'Facebook & LinkedIn style multi-photo updates from village tournaments & cultural programs. Click any photo to expand.'}
                </p>
              </div>

              <Link
                href="/announcements"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#19398A] dark:text-[#00A3E0] hover:text-[#F26522] dark:hover:text-[#F9A01B] transition-colors group"
              >
                <span>{lang === 'bn' ? 'সকল পোস্ট ও নোটিশ দেখুন' : 'View All Notices & Feed'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Standard Compact 3-Column Grid matching event cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {eventPosts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
