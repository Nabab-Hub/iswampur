import {
  AdminUser,
  AppDirectoryUser,
  AuditLogEntry,
  ContactMessage,
  IPLSeason,
  PermissionKey,
  PostAnnouncement,
  SiteSettings,
  TeamContactInfo,
  TeamPass,
  TeamRegistration,
  TournamentBracketData,
  UserRole,
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
import { extractPassIdOrCode } from '@/lib/pass/utils';

function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

// Default Seed Data
const DEFAULT_SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com';
const INITIAL_ADMIN_EMAIL = 'jonsknabab@gmail.com';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: {
    bn: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম',
    en: 'Iswampur Village Digital Platform',
  },
  logoUrl: '/images/iswampur-logo.svg',
  tagline: {
    bn: 'ঐতিহ্য, সম্প্রীতি, ক্রীড়া ও ডিজিটাল অগ্রযাত্রার প্রতীক',
    en: 'Heritage, Harmony, Sports and Digital Progress',
  },
  aboutText: {
    bn: 'ঈশ্বমপুর একটি ঐতিহ্যবাহী ও ভ্রাতৃত্বপূর্ণ গ্রাম। প্রতি বছর এখানে আয়োজিত হয় বিখ্যাত ঈশ্বমপুর প্রিমিয়ার লীগ (IPL), জাতীয় দিবস পালন এবং নানান সাংস্কৃতিক ও সামাজিক মহোৎসব। এই ডিজিটাল প্ল্যাটফর্মের মাধ্যমে সকল তথ্য, ছবি এবং অনলাইন দল নিবন্ধন পরিচালনা করা হয়।',
    en: 'Iswampur is a vibrant and close-knit community. Every year we host the prestigious Iswampur Premier League (IPL) cricket tournament, national celebrations, and various cultural festivals. This platform serves as our central hub for events, memories, and registrations.',
  },
  aboutHistory: {
    bn: 'সবুজ শ্যামল প্রান্তর ও ভ্রাতৃত্ববোধের ঐতিহ্য নিয়ে আমাদের ঈশ্বমপুর গ্রাম যুগে যুগে সামাজিক সংহতি এবং ক্রীড়ামোদী তারুণ্যের এক অনন্য নিদর্শন স্থাপন করেছে।',
    en: 'Nestled amidst lush landscapes, Iswampur stands as a beacon of unity, rich cultural heritage, and passionate athletic spirit.',
  },
  contact: {
    email: 'contact@iswampur.org',
    phone: '+91 98765 43210',
    address: {
      bn: 'ঈশ্বমপুর গ্রাম, পোস্ট: ঈশ্বমপুর, থানা: পঞ্চায়েত এলাকা, পশ্চিমবঙ্গ, ভারত',
      en: 'Iswampur Village, PO: Iswampur, West Bengal, India',
    },
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    whatsapp: 'https://whatsapp.com',
  },
  footerCopyright: {
    bn: '© ২০২৬ ঈশ্বমপুর গ্রাম ডিজিটাল কমিটি। সর্বস্বত্ব সংরক্ষিত।',
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
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ (IPL-10)',
      en: 'Iswampur Premier League 2026 (IPL Season 10)',
    },
    year: 2026,
    registrationOpen: true,
    registrationDeadline: '2026-11-15T23:59:59.000Z',
    eventDate: '২০-২৫ ডিসেম্বর, ২০২৬',
    venue: {
      bn: 'ঈশ্বমপুর হাইস্কুল সংলগ্ন কেন্দ্রীয় খেলার মাঠ',
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
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ (দশম বর্ষ)',
      en: 'Iswampur Premier League 2026 (10th Edition)',
    },
    shortDescription: {
      bn: 'গ্রামের সর্ববৃহৎ বার্ষিক ক্রিকেট টুর্নামেন্ট। ১৬টি দলের জমজমাট লড়াই ও আকর্ষণীয় ট্রফি!',
      en: 'The biggest annual cricket extravaganza featuring 16 champion village teams!',
    },
    fullDescription: {
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ এবার পা রাখছে তার গৌরবময় দশম বর্ষে। গ্রামের উদীয়মান তরুণ ও অভিজ্ঞ ক্রিকেট তারকাদের মেলবন্ধনে আয়োজিত হতে চলেছে এক অভূতপূর্ব ক্রিকেট মহোৎসব। অনলাইনে দল নিবন্ধনের মাধ্যমে অংশ নিন।',
      en: 'The prestigious Iswampur Premier League enters its landmark 10th edition. Bringing together village sports heroes in an electrifying atmosphere.',
    },
    category: 'cricket',
    startDate: '2026-12-20',
    endDate: '2026-12-25',
    venue: {
      bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ',
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
      bn: 'ঈশ্বমপুর প্রাইমারি স্কুল প্রাঙ্গণে সকাল ৮টায় জাতীয় পতাকা উত্তোলনের মাধ্যমে অনুষ্ঠান শুরু হবে। এরপর অনুষ্ঠিত হবে শিশুদের চিত্রাঙ্কন ও ম্যারাথন।',
      en: 'The celebration starts with national flag hoisting at 8:00 AM followed by cultural recitals and community athletics.',
    },
    category: 'national_day',
    startDate: '2026-08-15',
    venue: {
      bn: 'ঈশ্বমপুর স্কুল প্রাঙ্গণ ও ক্লাব ঘর',
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
      bn: 'ঈশ্বমপুর সার্বজনীন নাটমন্দির মঞ্চ',
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
    type: 'notice',
    memoNo: 'ISW/NOT/2026/01',
    date: '10 Oct 2026',
    signatory: 'General Secretary / Executive Convener',
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
    type: 'notice',
    memoNo: 'ISW/NOT/2026/02',
    date: '12 Oct 2026',
    signatory: 'Grounds & Pitch Committee In-Charge',
    title: {
      bn: 'মাঠ সংস্কার ও পিচ প্রস্তুতকরণ কাজ সম্পন্ন',
      en: 'Central ground maintenance and turf pitch preparation completed',
    },
    content: {
      bn: 'ঈশ্বমপুর হাইস্কুল মাঠের কিউরেটর দল পিচ ও আউটফিল্ডের সার্বিক উন্নয়ন কাজ সফলভাবে শেষ করেছেন।',
      en: 'The grounds committee has successfully prepared the tournament pitch and outfield.',
    },
    category: 'notice',
    published: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorEmail: INITIAL_ADMIN_EMAIL,
  },
  {
    id: 'post-1',
    type: 'post',
    eventId: 'ipl-2026',
    eventName: 'Iswampur Premier League 2026',
    likesCount: 48,
    title: {
      bn: 'মাঠের পিচ প্রস্তুতি ও নেট প্র্যাকটিস ঝলক 🏏🔥',
      en: 'Match turf pitch prep & team net practice highlights 🏏🔥',
    },
    content: {
      bn: 'ঈশ্বমপুর হাইস্কুল কেন্দ্রীয় মাঠে আইপিএল ২০২৬ এর জন্য বিশেষ টার্ফ পিচ রোলিং এবং প্রস্তুতি সম্পন্ন হয়েছে। গ্রামের তরুণদের অনুশীলন দারুণ জমে উঠেছে!',
      en: 'Turf pitch preparation and boundary line marking completed at Iswampur central grounds. Catch the electrifying energy as village teams begin their warm-up sessions!',
    },
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    category: 'event',
    published: true,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorEmail: DEFAULT_SUPER_ADMIN_EMAIL,
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
  users: AppDirectoryUser[] = [];
  brackets: TournamentBracketData[] = [];

  constructor() {
    // Initial seeded users
    this.users.push(
      {
        uid: 'uid_super_admin',
        email: DEFAULT_SUPER_ADMIN_EMAIL.toLowerCase(),
        displayName: 'Super Administrator',
        role: 'super_admin',
        firstLoginAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 12,
      },
      {
        uid: 'uid_admin_1',
        email: INITIAL_ADMIN_EMAIL.toLowerCase(),
        displayName: 'System Admin',
        role: 'admin',
        firstLoginAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        loginCount: 7,
      },
      {
        uid: 'sample_user_uid_123',
        email: 'team.warriors@gmail.com',
        displayName: 'Rahul Mondal (Team Rep)',
        role: 'team_user',
        firstLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        loginCount: 3,
      }
    );

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
        name: 'ঈশ্বমপুর ওয়ারিয়র্স (Iswampur Warriors)',
        address: 'পশ্চিম পাড়া, ঈশ্বমপুর',
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
        bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ (IPL-10)',
        en: 'Iswampur Premier League 2026 (IPL Season 10)',
      },
      teamName: 'ঈশ্বমপুর ওয়ারিয়র্স (Iswampur Warriors)',
      representativeName: 'রাহুল মন্ডল',
      memberCount: 11,
      issuedAt: new Date().toISOString(),
      status: 'ACTIVE',
      venue: {
        bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ',
        en: 'Iswampur Central Sports Ground',
      },
      eventDate: '২০-২৫ ডিসেম্বর, ২০২৬',
      signature: require('crypto')
        .createHmac('sha256', process.env.PASS_SIGNING_SECRET || 'iswampur_secret_default_signing_key_2026')
        .update(`${samplePassId}:${sampleRegId}:ঈশ্বমপুর ওয়ারিয়র্স (Iswampur Warriors):event-ipl-2026`)
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
    const targetEvent = globalStore.events.find((e) => e.id === id || e.slug === id);
    const targetId = targetEvent ? targetEvent.id : id;
    const targetSlug = targetEvent ? targetEvent.slug : id;

    // 1. Remove event from memory
    globalStore.events = globalStore.events.filter((e) => e.id !== targetId && e.slug !== targetSlug);

    // 2. Cascading delete: Registrations associated with this event
    const registrationsToDelete = globalStore.registrations.filter(
      (r) => r.eventId === targetId || r.eventId === targetSlug
    );
    const deletedRegIds = new Set(registrationsToDelete.map((r) => r.id));
    globalStore.registrations = globalStore.registrations.filter((r) => !deletedRegIds.has(r.id));

    // 3. Cascading delete: Passes associated with this event or deleted registrations
    const passesToDelete = globalStore.passes.filter(
      (p) => p.eventId === targetId || p.eventId === targetSlug || deletedRegIds.has(p.registrationId)
    );
    const deletedPassIds = new Set(passesToDelete.map((p) => p.passId));
    globalStore.passes = globalStore.passes.filter((p) => !deletedPassIds.has(p.passId));

    // 4. Cascading delete: Posts / Announcements / Event Feed Posts linked to this event
    const postsToDelete = globalStore.posts.filter(
      (p) => p.eventId === targetId || p.eventId === targetSlug
    );
    const deletedPostIds = new Set(postsToDelete.map((p) => p.id));
    globalStore.posts = globalStore.posts.filter((p) => !deletedPostIds.has(p.id));

    // 5. Site settings cleanup if this was the active season or linked event
    if (globalStore.settings) {
      if (
        globalStore.settings.activeSeasonId === targetId ||
        globalStore.settings.activeSeasonId === targetSlug
      ) {
        globalStore.settings.activeSeasonId = '';
      }
    }

    // 6. Firestore synchronization across all related collections
    if (db) {
      try {
        await deleteDoc(doc(db, 'events', targetId));
      } catch (err) {
        console.warn('Firestore deleteEvent error:', err);
      }

      for (const regId of deletedRegIds) {
        try {
          await deleteDoc(doc(db, 'registrations', regId));
        } catch (err) {
          console.warn('Firestore delete registration cascade error:', err);
        }
      }

      for (const passId of deletedPassIds) {
        try {
          await deleteDoc(doc(db, 'passes', passId));
        } catch (err) {
          console.warn('Firestore delete pass cascade error:', err);
        }
      }

      for (const postId of deletedPostIds) {
        try {
          await deleteDoc(doc(db, 'posts', postId));
        } catch (err) {
          console.warn('Firestore delete post cascade error:', err);
        }
      }

      try {
        await deleteDoc(doc(db, 'brackets', targetId));
      } catch (err) {
        console.warn('Firestore delete bracket cascade error:', err);
      }
    }

    globalStore.brackets = globalStore.brackets.filter((b) => b.eventId !== targetId && b.eventId !== targetSlug);

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
        let items: AdminUser[] = [];
        if (!snap.empty) {
          items = snap.docs.map((doc: any) => doc.data() as AdminUser);
        }

        // Ensure default admins (super_admin & initial admin) are always included
        for (const defAdm of DEFAULT_ADMINS) {
          const exists = items.some(
            (a) => a.email.toLowerCase() === defAdm.email.toLowerCase()
          );
          if (!exists) {
            items.push(defAdm);
            try {
              const docId = defAdm.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
              await setDoc(doc(db, 'admins', docId), cleanForFirestore(defAdm));
            } catch {}
          }
        }

        // Check if settings.reviewerAdmins has any emails that should also be recognized
        try {
          const settings = await this.getSettings();
          if (settings && Array.isArray(settings.reviewerAdmins)) {
            for (const email of settings.reviewerAdmins) {
              const norm = email.toLowerCase().trim();
              if (norm && !items.some((a) => a.email.toLowerCase() === norm)) {
                const syncdAdmin: AdminUser = {
                  id: `admin_${norm.replace(/[^a-zA-Z0-9]/g, '_')}`,
                  email: norm,
                  name: norm.split('@')[0],
                  role: norm === DEFAULT_SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'admin',
                  permissions: [
                    'events.manage',
                    'gallery.manage',
                    'notices.manage',
                    'registrations.view',
                    'registrations.review',
                    'payments.verify',
                  ],
                  active: true,
                  addedBy: 'SETTINGS_REVIEWER',
                  createdAt: new Date().toISOString(),
                };
                items.push(syncdAdmin);
                const docId = norm.replace(/[^a-zA-Z0-9]/g, '_');
                await setDoc(doc(db, 'admins', docId), cleanForFirestore(syncdAdmin));
              }
            }
          }
        } catch {}

        globalStore.admins = items;
        return items;
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
  async getPass(rawIdentifier: string): Promise<TeamPass | null> {
    if (!rawIdentifier) return null;
    const cleanId = extractPassIdOrCode(rawIdentifier);
    const cleanUpper = cleanId.toUpperCase();
    const rawUpper = rawIdentifier.trim().toUpperCase();

    const matchesPass = (p: TeamPass) => {
      const pId = p.passId || '';
      const pCode = (p.humanPassCode || '').toUpperCase();
      return (
        pId === cleanId ||
        pId === rawIdentifier ||
        pCode === cleanUpper ||
        pCode === rawUpper ||
        (cleanId && pId.includes(cleanId)) ||
        (rawIdentifier && rawIdentifier.includes(pId)) ||
        (pCode && rawUpper.includes(pCode))
      );
    };

    if (db) {
      try {
        const snap = await getDoc(doc(db, 'passes', cleanId || rawIdentifier));
        if (snap.exists()) {
          return snap.data() as TeamPass;
        }
        const allPasses = await getDocs(collection(db, 'passes'));
        if (!allPasses.empty) {
          const found = allPasses.docs.map((d) => d.data() as TeamPass).find(matchesPass);
          if (found) return found;
        }
      } catch (err) {
        console.warn('Firestore getPass error, falling back:', err);
      }
    }
    const foundLocal = globalStore.passes.find(matchesPass);
    if (foundLocal) return foundLocal;

    // Fallback: check if rawIdentifier matches an approved registration whose pass record wasn't persisted
    try {
      const allRegs = await this.getRegistrations();
      const matchedReg = allRegs.find(
        (r) =>
          r.status === 'APPROVED' &&
          (r.passId === cleanId ||
            r.passId === rawIdentifier ||
            r.humanPassCode?.toUpperCase() === cleanUpper ||
            r.humanPassCode?.toUpperCase() === rawUpper ||
            r.id === cleanId)
      );
      if (matchedReg) {
        const events = await this.getEvents();
        const ev = events.find((e) => e.id === matchedReg.eventId);
        const passId = matchedReg.passId || `pass_${matchedReg.id.replace('reg_', '')}`;
        const humanPassCode = matchedReg.humanPassCode || cleanUpper;
        const { computePassSignature } = await import('@/lib/pass/generator');
        const signature = computePassSignature({
          passId,
          registrationId: matchedReg.id,
          teamName: matchedReg.team.name,
          eventId: matchedReg.eventId,
        });

        const synthesizedPass: TeamPass = {
          passId,
          humanPassCode,
          registrationId: matchedReg.id,
          eventId: matchedReg.eventId,
          eventTitle: ev?.title || { bn: matchedReg.team.name, en: matchedReg.team.name },
          teamName: matchedReg.team.name,
          representativeName: matchedReg.team.representativeName,
          memberCount: matchedReg.team.members?.length || 1,
          issuedAt: matchedReg.reviewedAt || matchedReg.updatedAt || new Date().toISOString(),
          status: 'ACTIVE',
          venue: ev?.venue || { bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ', en: 'Iswampur Central Sports Ground' },
          eventDate: ev?.startDate || '২০২৬',
          signature,
        };
        await this.savePass(synthesizedPass);
        return synthesizedPass;
      }
    } catch (fallbackErr) {
      console.warn('Fallback getPass error:', fallbackErr);
    }

    return null;
  },

  async getAllPasses(): Promise<TeamPass[]> {
    let items: TeamPass[] = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'passes'));
        if (!snap.empty) {
          items = snap.docs.map((d) => d.data() as TeamPass);
          globalStore.passes = items;
        } else if (globalStore.passes.length > 0) {
          items = [...globalStore.passes];
          for (const p of globalStore.passes) {
            await setDoc(doc(db, 'passes', p.passId), cleanForFirestore(p));
          }
        }
      } catch (err) {
        console.warn('Firestore getAllPasses error:', err);
        items = [...globalStore.passes];
      }
    } else {
      items = [...globalStore.passes];
    }

    // Auto-reconcile: ensure all APPROVED registrations have a valid TeamPass
    try {
      const registrations = await this.getRegistrations();
      const existingPassIds = new Set(items.map((p) => p.passId));
      const existingRegIds = new Set(items.map((p) => p.registrationId));
      const events = await this.getEvents();
      const { computePassSignature } = await import('@/lib/pass/generator');

      for (const reg of registrations) {
        if (
          reg.status === 'APPROVED' &&
          (!existingRegIds.has(reg.id) || (reg.passId && !existingPassIds.has(reg.passId)))
        ) {
          const passId = reg.passId || `pass_${reg.id.replace('reg_', '')}`;
          const humanPassCode =
            reg.humanPassCode || `ISW-PASS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const ev = events.find((e) => e.id === reg.eventId);

          const newPass: TeamPass = {
            passId,
            humanPassCode,
            registrationId: reg.id,
            eventId: reg.eventId,
            eventTitle: ev?.title || { bn: reg.team.name, en: reg.team.name },
            teamName: reg.team.name,
            representativeName: reg.team.representativeName,
            memberCount: reg.team.members?.length || 1,
            issuedAt: reg.reviewedAt || reg.updatedAt || new Date().toISOString(),
            status: 'ACTIVE',
            venue: ev?.venue || { bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ', en: 'Iswampur Central Sports Ground' },
            eventDate: ev?.startDate || '২০২৬',
            signature: computePassSignature({
              passId,
              registrationId: reg.id,
              teamName: reg.team.name,
              eventId: reg.eventId,
            }),
          };

          await this.savePass(newPass);
          items.push(newPass);
          existingPassIds.add(passId);
          existingRegIds.add(reg.id);
        }
      }
    } catch (reconcileErr) {
      console.warn('Pass reconciliation error:', reconcileErr);
    }

    return items;
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

  // Users Directory (Track all logged-in users)
  async getUsers(): Promise<AppDirectoryUser[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as AppDirectoryUser);
          globalStore.users = items;
          return items;
        } else if (globalStore.users.length > 0) {
          for (const u of globalStore.users) {
            const docId = u.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
            await setDoc(doc(db, 'users', docId), cleanForFirestore(u));
          }
        }
      } catch (err) {
        console.warn('Firestore getUsers error, using local fallback:', err);
      }
    }
    return globalStore.users;
  },

  async recordUserLogin(userData: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
  }): Promise<AppDirectoryUser> {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const existingIndex = globalStore.users.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    const now = new Date().toISOString();

    let updatedUser: AppDirectoryUser;
    if (existingIndex >= 0) {
      const existing = globalStore.users[existingIndex];
      updatedUser = {
        ...existing,
        uid: userData.uid || existing.uid,
        displayName: userData.displayName || existing.displayName,
        photoURL: userData.photoURL || existing.photoURL,
        role: userData.role || existing.role,
        lastLoginAt: now,
        loginCount: (existing.loginCount || 1) + 1,
      };
      globalStore.users[existingIndex] = updatedUser;
    } else {
      updatedUser = {
        uid: userData.uid || `uid_${Date.now()}`,
        email: normalizedEmail,
        displayName: userData.displayName || normalizedEmail.split('@')[0],
        photoURL: userData.photoURL,
        role: userData.role || 'team_user',
        firstLoginAt: now,
        lastLoginAt: now,
        loginCount: 1,
      };
      globalStore.users.unshift(updatedUser);
    }

    if (db) {
      try {
        const docId = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'users', docId), cleanForFirestore(updatedUser), { merge: true });
      } catch (err) {
        console.warn('Firestore recordUserLogin error:', err);
      }
    }

    return updatedUser;
  },

  // Team Contacts & Emails
  async getTeamContacts(): Promise<TeamContactInfo[]> {
    const registrations = await this.getRegistrations();
    return registrations.map((r) => ({
      teamName: r.team.name,
      representativeName: r.team.representativeName,
      email: r.team.email,
      phone: r.team.phone,
      eventId: r.eventId,
      status: r.status,
      registrationId: r.id,
      memberCount: (r.team.members || (r.team as any).players || []).length,
      submittedAt: r.createdAt,
    }));
  },

  // Tournament Fixtures & Live Bracket Draw
  async getTournamentBracket(eventId: string): Promise<TournamentBracketData | null> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'brackets', eventId));
        if (snap.exists()) {
          const data = snap.data() as TournamentBracketData;
          const idx = globalStore.brackets.findIndex((b) => b.eventId === eventId);
          if (idx >= 0) globalStore.brackets[idx] = data;
          else globalStore.brackets.push(data);
          return data;
        }
      } catch (err) {
        console.warn('Firestore getTournamentBracket error:', err);
      }
    }
    return globalStore.brackets.find((b) => b.eventId === eventId) || null;
  },

  async saveTournamentBracket(bracket: TournamentBracketData): Promise<TournamentBracketData> {
    bracket.updatedAt = new Date().toISOString();
    const idx = globalStore.brackets.findIndex((b) => b.eventId === bracket.eventId);
    if (idx >= 0) {
      globalStore.brackets[idx] = bracket;
    } else {
      globalStore.brackets.push(bracket);
    }

    if (db) {
      try {
        await setDoc(doc(db, 'brackets', bracket.eventId), cleanForFirestore(bracket));
      } catch (err) {
        console.warn('Firestore saveTournamentBracket error:', err);
      }
    }

    return bracket;
  },

  async deleteTournamentBracket(eventId: string): Promise<boolean> {
    globalStore.brackets = globalStore.brackets.filter((b) => b.eventId !== eventId);
    if (db) {
      try {
        await deleteDoc(doc(db, 'brackets', eventId));
      } catch (err) {
        console.warn('Firestore deleteTournamentBracket error:', err);
      }
    }
    return true;
  },
};
// Exported Repository Singleton

