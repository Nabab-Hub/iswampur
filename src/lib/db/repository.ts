import {
  AdminUser,
  AuditLogEntry,
  ContactMessage,
  IPLSeason,
  PermissionKey,
  PostAnnouncement,
  SiteSettings,
  TeamPass,
  TeamRegistration,
  VillageEvent,
} from '@/types';
import { adminFirestore } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

// Default Seed Data
const DEFAULT_SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com';
const INITIAL_ADMIN_EMAIL = 'jonsknabab@gmail.com';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: {
    bn: 'ইস্বামপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম',
    en: 'Iswampur Village Digital Platform',
  },
  logoUrl: '/images/iswampur-logo.svg',
  tagline: {
    bn: 'ঐতিহ্য, সম্প্রীতি, ক্রীড়া ও ডিজিটাল অগ্রযাত্রার প্রতীক',
    en: 'Heritage, Harmony, Sports and Digital Progress',
  },
  aboutText: {
    bn: 'ইস্বামপুর একটি ঐতিহ্যবাহী ও ভ্রাতৃত্বপূর্ণ গ্রাম। প্রতি বছর এখানে আয়োজিত হয় বিখ্যাত ইস্বামপুর প্রিমিয়ার লীগ (IPL), জাতীয় দিবস পালন এবং নানান সাংস্কৃতিক ও সামাজিক মহোৎসব। এই ডিজিটাল প্ল্যাটফর্মের মাধ্যমে সকল তথ্য, ছবি এবং অনলাইন দল নিবন্ধন পরিচালনা করা হয়।',
    en: 'Iswampur is a vibrant and close-knit community. Every year we host the prestigious Iswampur Premier League (IPL) cricket tournament, national celebrations, and various cultural festivals. This platform serves as our central hub for events, memories, and registrations.',
  },
  aboutHistory: {
    bn: 'সবুজ শ্যামল প্রান্তর ও ভ্রাতৃত্ববোধের ঐতিহ্য নিয়ে আমাদের ইস্বামপুর গ্রাম যুগে যুগে সামাজিক সংহতি এবং ক্রীড়ামোদী তারুণ্যের এক অনন্য নিদর্শন স্থাপন করেছে।',
    en: 'Nestled amidst lush landscapes, Iswampur stands as a beacon of unity, rich cultural heritage, and passionate athletic spirit.',
  },
  contact: {
    email: 'contact@iswampur.org',
    phone: '+91 98765 43210',
    address: {
      bn: 'ইস্বামপুর গ্রাম, পোস্ট: ইস্বামপুর, থানা: পঞ্চায়েত এলাকা, পশ্চিমবঙ্গ, ভারত',
      en: 'Iswampur Village, PO: Iswampur, West Bengal, India',
    },
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    whatsapp: 'https://whatsapp.com',
  },
  footerCopyright: {
    bn: '© ২০২৬ ইস্বামপুর গ্রাম ডিজিটাল কমিটি। সর্বস্বত্ব সংরক্ষিত।',
    en: '© 2026 Iswampur Village Digital Committee. All rights reserved.',
  },
  payment: {
    upiId: 'iswampur.cricket@upi',
    payeeName: 'Iswampur Sports Committee',
    qrCodeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    instructions: {
      bn: 'যেকোনো UPI অ্যাপ (Google Pay, PhonePe, Paytm) দিয়ে উপরের কিউআর কোড স্ক্যান করে সঠিক ফি জমা দিন এবং স্ক্রিনশট ও UTR সংগ্রহ করুন।',
      en: 'Scan the QR code using any UPI app (GPay, PhonePe, Paytm), pay the exact fee, and upload the screenshot with UTR number.',
    },
  },
  reviewerAdmins: [INITIAL_ADMIN_EMAIL, DEFAULT_SUPER_ADMIN_EMAIL],
  iplRegistrationOpen: true,
  activeSeasonId: 'ipl-2026',
};

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin_super_1',
    email: DEFAULT_SUPER_ADMIN_EMAIL.toLowerCase(),
    name: 'Super Administrator',
    role: 'super_admin',
    permissions: [
      'events.manage',
      'gallery.manage',
      'notices.manage',
      'content.manage',
      'registrations.view',
      'registrations.review',
      'registrations.export',
      'payments.verify',
      'passes.manage',
      'matchday.checkin',
      'admins.manage',
      'ipl.manage',
      'settings.manage',
    ],
    active: true,
    addedBy: 'SYSTEM_ENV',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin_initial_2',
    email: INITIAL_ADMIN_EMAIL.toLowerCase(),
    name: 'Jonsknabab Admin',
    role: 'admin',
    permissions: [
      'events.manage',
      'gallery.manage',
      'notices.manage',
      'registrations.view',
      'registrations.review',
      'payments.verify',
      'passes.manage',
      'matchday.checkin',
      'ipl.manage',
    ],
    eventScope: ['ipl-2026'],
    active: true,
    addedBy: DEFAULT_SUPER_ADMIN_EMAIL,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SEASONS: IPLSeason[] = [
  {
    id: 'ipl-2026',
    slug: 'iswampur-premier-league-2026',
    name: {
      bn: 'ইস্বামপুর প্রিমিয়ার লীগ ২০২৬ (IPL-10)',
      en: 'Iswampur Premier League 2026 (IPL Season 10)',
    },
    year: 2026,
    registrationOpen: true,
    registrationDeadline: '2026-11-15T23:59:59.000Z',
    eventDate: '২০-২৫ ডিসেম্বর, ২০২৬',
    venue: {
      bn: 'ইস্বামপুর হাইস্কুল সংলগ্ন কেন্দ্রীয় খেলার মাঠ',
      en: 'Iswampur High School Central Sports Ground',
    },
    registrationFee: 1500,
    minPlayers: 11,
    maxPlayers: 15,
    maxTeams: 16,
    rules: {
      bn: `১. প্রতিটি দলে নূন্যতম ১১ জন এবং সর্বোচ্চ ১৫ জন খেলোয়াড় থাকতে হবে।\n২. সকল খেলোয়াড়কে নির্ধারিত সময়ের ৩০ মিনিট পূর্বে মাঠে উপস্থিত থাকতে হবে।\n৩. টুর্নামেন্টটি আইসিসি ও গ্রাম্য কমিটির অনুমোদিত টেনিস বল ক্রিকেট নিয়মে পরিচালিত হবে।\n৪. প্রতিটি ম্যাচ ১০ ওভারের হবে, ফাইনাল ম্যাচ ১২ ওভার।\n৫. আম্পায়ারের সিদ্ধান্তই চূড়ান্ত, কোনো অসদাচরণ বরদাস্ত করা হবে না।\n৬. নিবন্ধনের সময় বৈধ পেমেন্ট স্ক্রিনশট ও সঠিক মোবাইল নম্বর প্রদান বাধ্যতামূলক।\n৭. চূড়ান্ত অনুমোদনের পর প্রাপ্ত টিম পাস প্রিন্ট করে মাঠে নিয়ে আসতে হবে।`,
      en: `1. Each squad must have a minimum of 11 and maximum of 15 registered players.\n2. All players must report to the ground 30 minutes before the scheduled match time.\n3. The tournament will be played with heavy tennis balls under official local rules.\n4. Standard matches will be 10 overs each, and the final match will be 12 overs.\n5. The umpire's decision is final and binding on all matters on field.\n6. A valid payment screenshot with transaction reference must be provided.\n7. Teams must print and present their official digitally-signed Team Pass on match day.`,
    },
    rulesVersion: '2026.1',
    status: 'upcoming',
  },
];

const DEFAULT_EVENTS: VillageEvent[] = [
  {
    id: 'event-ipl-2026',
    slug: 'iswampur-premier-league-2026',
    title: {
      bn: 'ইস্বামপুর প্রিমিয়ার লীগ ২০২৬ (দশম বর্ষ)',
      en: 'Iswampur Premier League 2026 (10th Edition)',
    },
    shortDescription: {
      bn: 'গ্রামের সর্ববৃহৎ বার্ষিক ক্রিকেট টুর্নামেন্ট। ১৬টি দলের জমজমাট লড়াই ও আকর্ষণীয় ট্রফি!',
      en: 'The biggest annual cricket extravaganza featuring 16 champion village teams!',
    },
    fullDescription: {
      bn: 'ইস্বামপুর প্রিমিয়ার লীগ এবার পা রাখছে তার গৌরবময় দশম বর্ষে। গ্রামের উদীয়মান তরুণ ও অভিজ্ঞ ক্রিকেট তারকাদের মেলবন্ধনে আয়োজিত হতে চলেছে এক অভূতপূর্ব ক্রিকেট মহোৎসব। অনলাইনে দল নিবন্ধনের মাধ্যমে অংশ নিন।',
      en: 'The prestigious Iswampur Premier League enters its landmark 10th edition. Bringing together village sports heroes in an electrifying atmosphere.',
    },
    category: 'cricket',
    startDate: '2026-12-20',
    endDate: '2026-12-25',
    venue: {
      bn: 'ইস্বামপুর কেন্দ্রীয় খেলার মাঠ',
      en: 'Iswampur Central Sports Ground',
    },
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80',
        caption: {
          bn: 'গত আসরের চ্যাম্পিয়ন দলের শিরোপা উল্লাস',
          en: 'Champions trophy celebration from previous edition',
        },
        order: 1,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
        caption: {
          bn: 'মাঠে দর্শকের উপচে পড়া ভিড়',
          en: 'Spectators cheering from the stands',
        },
        order: 2,
      },
    ],
    featured: true,
    showInHero: true,
    published: true,
    registrationEnabled: true,
    registrationDeadline: '2026-11-15T23:59:59.000Z',
    registrationFee: 1500,
    minPlayers: 11,
    maxPlayers: 15,
    maxTeams: 16,
    rules: DEFAULT_SEASONS[0].rules,
    rulesVersion: '2026.1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: DEFAULT_SUPER_ADMIN_EMAIL,
  },
  {
    id: 'event-15-aug',
    slug: 'independence-day-celebration-2026',
    title: {
      bn: 'স্বাধীনতা দিবস উদযাপন ও বার্ষিক দৌড় প্রতিযোগিতা',
      en: 'Independence Day 15th August & Athletic Meet',
    },
    shortDescription: {
      bn: '১৫ই আগস্ট জাতীয় পতাকা উত্তোলন, শিশুদের চিত্রাঙ্কন ও যুবকদের ম্যারাথন দৌড়।',
      en: 'Flag hoisting ceremony, youth marathon, and cultural programs honoring 15 August.',
    },
    fullDescription: {
      bn: 'ইস্বামপুর প্রাইমারি স্কুল প্রাঙ্গণে সকাল ৮টায় জাতীয় পতাকা উত্তোলনের মাধ্যমে অনুষ্ঠান শুরু হবে। এরপর অনুষ্ঠিত হবে শিশুদের চিত্রাঙ্কন ও ম্যারাথন।',
      en: 'The celebration starts with national flag hoisting at 8:00 AM followed by cultural recitals and community athletics.',
    },
    category: 'national_day',
    startDate: '2026-08-15',
    venue: {
      bn: 'ইস্বামপুর স্কুল প্রাঙ্গণ ও ক্লাব ঘর',
      en: 'Iswampur Primary School Grounds',
    },
    coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    showInHero: false,
    published: true,
    registrationEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: DEFAULT_SUPER_ADMIN_EMAIL,
  },
  {
    id: 'event-puja-2026',
    slug: 'sharodotsav-cultural-night-2026',
    title: {
      bn: 'শারদোৎসব ও গ্রামীণ সাংস্কৃতিক সন্ধ্যা',
      en: 'Sharodotsav & Folk Cultural Evening',
    },
    shortDescription: {
      bn: 'বাউল গান, নাটক, এবং স্থানীয় শিল্পীদের সঙ্গীত পরিবেশনা।',
      en: 'Traditional Baul songs, community drama, and local music performances.',
    },
    fullDescription: {
      bn: 'শারদীয় উৎসব উপলক্ষে গ্রামের প্রবীণ ও নবীন শিল্পীদের অংশগ্রহণে এক মোহময় সাংস্কৃতিক সন্ধ্যা অনুষ্ঠিত হবে।',
      en: 'A joyous evening of classical folklore and performances during the festival season.',
    },
    category: 'cultural',
    startDate: '2026-10-22',
    venue: {
      bn: 'ইস্বামপুর সার্বজনীন নাটমন্দির মঞ্চ',
      en: 'Iswampur Community Stage',
    },
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    showInHero: false,
    published: true,
    registrationEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: DEFAULT_SUPER_ADMIN_EMAIL,
  },
];

const DEFAULT_POSTS: PostAnnouncement[] = [
  {
    id: 'notice-1',
    title: {
      bn: 'আইপিএল ২০২৬ এর অনলাইন দল নিবন্ধন শুরু হয়েছে!',
      en: 'IPL 2026 Online Team Registration is officially open!',
    },
    content: {
      bn: 'সকল ক্রিকেট দলপতিদের অবগতির জন্য জানানো যাচ্ছে যে, এ বছর সমস্ত নিবন্ধন শুধুমাত্র এই অফিসিয়াল ওয়েবসাইটের মাধ্যমে সম্পন্ন হবে। আসন সংখ্যা সীমিত (১৬টি দল)।',
      en: 'Attention team managers: Team registrations are exclusively processed through this portal on a first-approved basis. Total slot cap is 16 teams.',
    },
    category: 'urgent',
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorEmail: DEFAULT_SUPER_ADMIN_EMAIL,
  },
  {
    id: 'notice-2',
    title: {
      bn: 'মাঠ সংস্কার ও পিচ প্রস্তুতকরণ কাজ সম্পন্ন',
      en: 'Central ground maintenance and turf pitch preparation completed',
    },
    content: {
      bn: 'ইস্বামপুর হাইস্কুল মাঠের কিউরেটর দল পিচ ও আউটফিল্ডের সার্বিক উন্নয়ন কাজ সফলভাবে শেষ করেছেন।',
      en: 'The grounds committee has successfully prepared the tournament pitch and outfield.',
    },
    category: 'notice',
    published: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorEmail: INITIAL_ADMIN_EMAIL,
  },
];

// In-Memory resilient fallback store
class DataStore {
  settings: SiteSettings = { ...DEFAULT_SETTINGS };
  admins: AdminUser[] = [...DEFAULT_ADMINS];
  seasons: IPLSeason[] = [...DEFAULT_SEASONS];
  events: VillageEvent[] = [...DEFAULT_EVENTS];
  posts: PostAnnouncement[] = [...DEFAULT_POSTS];
  registrations: TeamRegistration[] = [];
  passes: TeamPass[] = [];
  auditLogs: AuditLogEntry[] = [];
  contactMessages: ContactMessage[] = [];

  constructor() {
    // Add an initial sample registration to showcase the dashboard & approval immediately
    const sampleRegId = 'reg_sample_warriors_01';
    const samplePassId = 'pass_isw_sample_789';
    this.registrations.push({
      id: sampleRegId,
      seasonId: 'ipl-2026',
      eventId: 'event-ipl-2026',
      eventSlug: 'iswampur-premier-league-2026',
      ownerUid: 'sample_user_uid_123',
      ownerEmail: 'team.warriors@gmail.com',
      ownerDisplayName: 'Rahul Mondal',
      language: 'bn',
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: '2026.1',
      team: {
        name: 'ইস্বামপুর ওয়ারিয়র্স (Iswampur Warriors)',
        address: 'পশ্চিম পাড়া, ইস্বামপুর',
        representativeName: 'রাহুল মন্ডল',
        email: 'team.warriors@gmail.com',
        phone: '9876543210',
        emergencyName: 'বিকাশ মন্ডল',
        emergencyPhone: '9876543211',
        members: [
          { name: 'রাহুল মন্ডল (অধিনায়ক)', role: 'captain', phone: '9876543210' },
          { name: 'সৌরভ দাস (সহ-অধিনায়ক)', role: 'vice_captain' },
          { name: 'অমিত সরকার', role: 'wicketkeeper' },
          { name: 'শুভঙ্কর সেন', role: 'batsman' },
          { name: 'অনুপ বিশ্বাস', role: 'batsman' },
          { name: 'প্রসেনজিৎ রায়', role: 'allrounder' },
          { name: 'সন্দীপ ঘোষ', role: 'allrounder' },
          { name: 'রাজেশ কর্মকার', role: 'bowler' },
          { name: 'অভিজিৎ পাল', role: 'bowler' },
          { name: 'দীপক হালদার', role: 'bowler' },
          { name: 'মনোজ অধিকারী', role: 'player' },
        ],
      },
      payment: {
        amount: 1500,
        utr: 'UPI20269871654',
        screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        submittedAt: new Date().toISOString(),
      },
      status: 'APPROVED',
      passId: samplePassId,
      humanPassCode: 'ISW-IPL26-W9K2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.passes.push({
      passId: samplePassId,
      humanPassCode: 'ISW-IPL26-W9K2',
      registrationId: sampleRegId,
      eventId: 'event-ipl-2026',
      eventTitle: {
        bn: 'ইস্বামপুর প্রিমিয়ার লীগ ২০২৬ (IPL-10)',
        en: 'Iswampur Premier League 2026 (IPL Season 10)',
      },
      teamName: 'ইস্বামপুর ওয়ারিয়র্স (Iswampur Warriors)',
      representativeName: 'রাহুল মন্ডল',
      memberCount: 11,
      issuedAt: new Date().toISOString(),
      status: 'ACTIVE',
      venue: {
        bn: 'ইস্বামপুর কেন্দ্রীয় খেলার মাঠ',
        en: 'Iswampur Central Sports Ground',
      },
      eventDate: '২০-২৫ ডিসেম্বর, ২০২৬',
      signature: require('crypto')
        .createHmac('sha256', process.env.PASS_SIGNING_SECRET || 'iswampur_secret_default_signing_key_2026')
        .update(`${samplePassId}:${sampleRegId}:ইস্বামপুর ওয়ারিয়র্স (Iswampur Warriors):event-ipl-2026`)
        .digest('hex'),
    });
  }
}

// Global singleton instance
const globalStore = new DataStore();

export const repository = {
  // Settings
  async getSettings(): Promise<SiteSettings> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          globalStore.settings = { ...globalStore.settings, ...data };
          return globalStore.settings;
        } else {
          await setDoc(doc(db, 'settings', 'site'), cleanForFirestore(globalStore.settings));
        }
      } catch (err) {
        console.warn('Firestore getSettings error, falling back to local store:', err);
      }
    }
    return globalStore.settings;
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const updated = { ...globalStore.settings, ...settings };
    globalStore.settings = updated;
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'site'), cleanForFirestore(updated), { merge: true });
      } catch (err) {
        console.warn('Firestore updateSettings error:', err);
      }
    }
    return updated;
  },

  // Events
  async getEvents(publishedOnly = false): Promise<VillageEvent[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'events'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as VillageEvent);
          globalStore.events = items;
          return publishedOnly ? items.filter((e) => e.published) : items;
        } else {
          for (const ev of globalStore.events) {
            await setDoc(doc(db, 'events', ev.id), cleanForFirestore(ev));
          }
        }
      } catch (err) {
        console.warn('Firestore getEvents error, falling back:', err);
      }
    }
    return publishedOnly
      ? globalStore.events.filter((e) => e.published)
      : globalStore.events;
  },

  async getEventBySlug(slug: string): Promise<VillageEvent | null> {
    const events = await this.getEvents();
    return events.find((e) => e.slug === slug || e.id === slug) || null;
  },

  async saveEvent(event: VillageEvent): Promise<VillageEvent> {
    const index = globalStore.events.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      globalStore.events[index] = event;
    } else {
      globalStore.events.unshift(event);
    }
    if (db) {
      try {
        await setDoc(doc(db, 'events', event.id), cleanForFirestore(event));
      } catch (err) {
        console.warn('Firestore saveEvent error:', err);
      }
    }
    return event;
  },

  async deleteEvent(id: string): Promise<boolean> {
    globalStore.events = globalStore.events.filter((e) => e.id !== id);
    if (db) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        console.warn('Firestore deleteEvent error:', err);
      }
    }
    return true;
  },

  // Announcements / Posts
  async getPosts(publishedOnly = false): Promise<PostAnnouncement[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'posts'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as PostAnnouncement);
          globalStore.posts = items;
          return publishedOnly ? items.filter((p) => p.published) : items;
        } else {
          for (const p of globalStore.posts) {
            await setDoc(doc(db, 'posts', p.id), cleanForFirestore(p));
          }
        }
      } catch (err) {
        console.warn('Firestore getPosts error:', err);
      }
    }
    return publishedOnly
      ? globalStore.posts.filter((p) => p.published)
      : globalStore.posts;
  },

  async savePost(post: PostAnnouncement): Promise<PostAnnouncement> {
    const index = globalStore.posts.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      globalStore.posts[index] = post;
    } else {
      globalStore.posts.unshift(post);
    }
    if (db) {
      try {
        await setDoc(doc(db, 'posts', post.id), cleanForFirestore(post));
      } catch (err) {
        console.warn('Firestore savePost error:', err);
      }
    }
    return post;
  },

  async deletePost(id: string): Promise<boolean> {
    globalStore.posts = globalStore.posts.filter((p) => p.id !== id);
    if (db) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (err) {
        console.warn('Firestore deletePost error:', err);
      }
    }
    return true;
  },

  // IPL Seasons
  async getSeasons(): Promise<IPLSeason[]> {
    return globalStore.seasons;
  },

  async getSeasonById(id: string): Promise<IPLSeason | null> {
    return globalStore.seasons.find((s) => s.id === id || s.slug === id) || null;
  },

  // Admins & Permissions
  async getAdmins(): Promise<AdminUser[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'admins'));
        if (!snap.empty) {
          const items = snap.docs.map((doc: any) => doc.data() as AdminUser);
          globalStore.admins = items;
          return items;
        } else {
          for (const adm of globalStore.admins) {
            const docId = adm.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
            await setDoc(doc(db, 'admins', docId), cleanForFirestore(adm));
          }
        }
      } catch (err) {
        console.warn('Firestore getAdmins error:', err);
      }
    }
    return globalStore.admins;
  },

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const admins = await this.getAdmins();
    const normalized = email.toLowerCase().trim();
    return admins.find((a) => a.email.toLowerCase() === normalized) || null;
  },

  async saveAdmin(adminUser: AdminUser): Promise<AdminUser> {
    const index = globalStore.admins.findIndex(
      (a) => a.email.toLowerCase() === adminUser.email.toLowerCase()
    );
    if (index >= 0) {
      globalStore.admins[index] = adminUser;
    } else {
      globalStore.admins.push(adminUser);
    }
    if (db) {
      try {
        const docId = adminUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'admins', docId), cleanForFirestore(adminUser));
      } catch (err) {
        console.warn('Firestore saveAdmin error:', err);
      }
    }
    return adminUser;
  },

  async deleteAdmin(email: string): Promise<boolean> {
    const normalized = email.toLowerCase();
    if (normalized === DEFAULT_SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Super admin can never be deleted.');
    }
    globalStore.admins = globalStore.admins.filter(
      (a) => a.email.toLowerCase() !== normalized
    );
    if (db) {
      try {
        const docId = normalized.replace(/[^a-zA-Z0-9]/g, '_');
        await deleteDoc(doc(db, 'admins', docId));
      } catch (err) {
        console.warn('Firestore deleteAdmin error:', err);
      }
    }
    return true;
  },

  // Registrations
  async getRegistrations(filters?: {
    status?: string;
    eventId?: string;
    ownerUid?: string;
    ownerEmail?: string;
  }): Promise<TeamRegistration[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'registrations'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as TeamRegistration);
          globalStore.registrations = items;
        } else if (globalStore.registrations.length > 0) {
          for (const r of globalStore.registrations) {
            await setDoc(doc(db, 'registrations', r.id), cleanForFirestore(r));
          }
        }
      } catch (err) {
        console.warn('Firestore getRegistrations error, falling back:', err);
      }
    }
    let list = [...globalStore.registrations];
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.eventId) {
      list = list.filter((r) => r.eventId === filters.eventId);
    }
    if (filters?.ownerUid) {
      list = list.filter((r) => r.ownerUid === filters.ownerUid);
    }
    if (filters?.ownerEmail) {
      list = list.filter((r) => r.ownerEmail.toLowerCase() === filters.ownerEmail?.toLowerCase());
    }
    return list;
  },

  async getRegistrationById(id: string): Promise<TeamRegistration | null> {
    const all = await this.getRegistrations();
    return all.find((r) => r.id === id) || null;
  },

  async saveRegistration(reg: TeamRegistration): Promise<TeamRegistration> {
    const index = globalStore.registrations.findIndex((r) => r.id === reg.id);
    if (index >= 0) {
      globalStore.registrations[index] = reg;
    } else {
      globalStore.registrations.unshift(reg);
    }
    if (db) {
      try {
        await setDoc(doc(db, 'registrations', reg.id), cleanForFirestore(reg));
      } catch (err) {
        console.warn('Firestore saveRegistration error:', err);
      }
    }
    return reg;
  },

  // Passes
  async getPass(passId: string): Promise<TeamPass | null> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'passes', passId));
        if (snap.exists()) {
          return snap.data() as TeamPass;
        }
        const allPasses = await getDocs(collection(db, 'passes'));
        if (!allPasses.empty) {
          const found = allPasses.docs.map((d) => d.data() as TeamPass).find(
            (p) => p.passId === passId || p.humanPassCode.toUpperCase() === passId.toUpperCase()
          );
          if (found) return found;
        }
      } catch (err) {
        console.warn('Firestore getPass error, falling back:', err);
      }
    }
    return (
      globalStore.passes.find(
        (p) => p.passId === passId || p.humanPassCode.toUpperCase() === passId.toUpperCase()
      ) || null
    );
  },

  async getAllPasses(): Promise<TeamPass[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'passes'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as TeamPass);
          globalStore.passes = items;
          return items;
        } else if (globalStore.passes.length > 0) {
          for (const p of globalStore.passes) {
            await setDoc(doc(db, 'passes', p.passId), cleanForFirestore(p));
          }
        }
      } catch (err) {
        console.warn('Firestore getAllPasses error:', err);
      }
    }
    return globalStore.passes;
  },

  async savePass(pass: TeamPass): Promise<TeamPass> {
    const index = globalStore.passes.findIndex((p) => p.passId === pass.passId);
    if (index >= 0) {
      globalStore.passes[index] = pass;
    } else {
      globalStore.passes.push(pass);
    }
    if (db) {
      try {
        await setDoc(doc(db, 'passes', pass.passId), cleanForFirestore(pass));
      } catch (err) {
        console.warn('Firestore savePass error:', err);
      }
    }
    return pass;
  },

  // Audit Logs
  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const log: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    globalStore.auditLogs.unshift(log);
    if (db) {
      try {
        await setDoc(doc(db, 'auditLogs', log.id), cleanForFirestore(log));
      } catch (err) {
        console.warn('Firestore logAction error:', err);
      }
    }
    return log;
  },

  async getAuditLogs(limitCount = 100): Promise<AuditLogEntry[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'auditLogs'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as AuditLogEntry);
          globalStore.auditLogs = items;
          return items.slice(0, limitCount);
        }
      } catch (err) {
        console.warn('Firestore getAuditLogs error:', err);
      }
    }
    return globalStore.auditLogs.slice(0, limitCount);
  },

  // Contact Messages
  async saveContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<ContactMessage> {
    const contact: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'unread',
      ...msg,
    };
    globalStore.contactMessages.unshift(contact);
    if (db) {
      try {
        await setDoc(doc(db, 'contactMessages', contact.id), cleanForFirestore(contact));
      } catch (err) {
        console.warn('Firestore saveContactMessage error:', err);
      }
    }
    return contact;
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'contactMessages'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as ContactMessage);
          globalStore.contactMessages = items;
          return items;
        }
      } catch (err) {
        console.warn('Firestore getContactMessages error:', err);
      }
    }
    return globalStore.contactMessages;
  },
};
