import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { repository } from '@/lib/db/repository';
import { VillageEvent, TeamRegistration, TeamPass } from '@/types';
import { computePassSignature } from '@/lib/pass/generator';

function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

export const DUMMY_EVENTS: VillageEvent[] = [
  // 1. January 2026 - Cricket Match (Completed)
  {
    id: 'event-cricket-winter-2026',
    slug: 'iswampur-winter-cricket-cup-2026',
    title: {
      bn: 'ঈশ্বমপুর শীতকালীন ক্রিকেট কাপ ২০২৬',
      en: 'Iswampur Winter Cricket Cup 2026',
    },
    shortDescription: {
      bn: 'বছরের শুরুতে গ্রাম ও পার্শ্ববর্তী অঞ্চলের ৮টি সেরা দলের মধ্যে অনুষ্ঠিত টানটান ক্রিকেট যুদ্ধ।',
      en: 'Thrilling winter tournament featuring 8 champion local squads in January 2026.',
    },
    fullDescription: {
      bn: '২০২৬ সালের ১০ থেকে ১৫ জানুয়ারি ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠে শীতকালীন ক্রিকেট কাপ সফলভাবে অনুষ্ঠিত হয়েছিল। ৮টি দল অংশগ্রহণ করে এবং টুর্নামেন্টটি সফলভাবে সম্পন্ন হয়।',
      en: 'Successfully organized from 10-15 January 2026 at Iswampur Central Grounds with 8 participating squads.',
    },
    category: 'cricket',
    startDate: '2026-01-10',
    endDate: '2026-01-15',
    venue: {
      bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ',
      en: 'Iswampur Central Sports Ground',
    },
    coverImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    showInHero: false,
    published: true,
    registrationEnabled: false, // Completed
    registrationDeadline: '2026-01-05T23:59:59.000Z',
    registrationFee: 1000,
    minPlayers: 11,
    maxPlayers: 15,
    maxTeams: 8,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-16T18:00:00.000Z',
    createdBy: 'skahidulla568@gmail.com',
  },

  // 2. June 2026 - Cultural Fest & Football Match (Completed)
  {
    id: 'event-summer-fest-football-2026',
    slug: 'iswampur-monsoon-fest-football-2026',
    title: {
      bn: 'ঈশ্বমপুর বর্ষাবরণ উৎসব ও ফুটবল টুর্নামেন্ট ২০২৬',
      en: 'Iswampur Monsoon Fest & Football Cup 2026',
    },
    shortDescription: {
      bn: 'গ্রামীণ সাংস্কৃতিক প্রদর্শনী, লোকনৃত্য এবং ১২টি ক্লাবের সমন্বয়ে আয়োজিত জমজমাট ফুটবল কাপ।',
      en: 'Cultural folk carnival and knockout football tournament held in June 2026.',
    },
    fullDescription: {
      bn: '২০২৬ সালের ১২ থেকে ১৮ জুন ঈশ্বমপুর হাইস্কুল স্টেডিয়াম প্রাঙ্গণে অনুষ্ঠিত হয়েছিল এই মিলনমেলা। বাউল সঙ্গীত, নাটক এবং যুব সমাজের প্রাণবন্ত ফুটবল লড়াই উপভোগ করেন হাজারো দর্শক।',
      en: 'Grand community festival held in June 2026 uniting folklore, theater, and intense knockout football clashes.',
    },
    category: 'sports',
    startDate: '2026-06-12',
    endDate: '2026-06-18',
    venue: {
      bn: 'ঈশ্বমপুর হাইস্কুল স্টেডিয়াম প্রাঙ্গণ',
      en: 'Iswampur High School Stadium Ground',
    },
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    showInHero: false,
    published: true,
    registrationEnabled: false, // Completed
    registrationDeadline: '2026-06-08T23:59:59.000Z',
    registrationFee: 800,
    minPlayers: 7,
    maxPlayers: 11,
    maxTeams: 12,
    createdAt: '2026-05-15T10:00:00.000Z',
    updatedAt: '2026-06-19T18:00:00.000Z',
    createdBy: 'skahidulla568@gmail.com',
  },

  // 3. November 2026 - Cultural Drama & Music Evening (Registration Open / Live)
  {
    id: 'event-cultural-natok-2026',
    slug: 'iswampur-drama-cultural-festival-2026',
    title: {
      bn: 'রবীন্দ্র-নজরুল সন্ধ্যা ও গ্রামীণ নাট্যোৎসব ২০২৬',
      en: 'Rabindra-Nazrul Sandhya & Folk Drama Festival 2026',
    },
    shortDescription: {
      bn: 'ঐতিহ্যবাহী লোকনাটক, সঙ্গীত ও আবৃত্তি প্রতিযোগিতা। বিভিন্ন যুব ও সাংস্কৃতিক দলের জন্য নিবন্ধন চলছে।',
      en: 'Traditional folk theatre recitals, drama troupes competition, and classical performances.',
    },
    fullDescription: {
      bn: 'আগামী ২০ থেকে ২২ নভেম্বর ২০২৬ ঈশ্বমপুর সার্বজনীন মুক্তমঞ্চে অনুষ্ঠিত হতে চলেছে বার্ষিক নাট্যোৎসব। নাট্যদল ও সাংস্কৃতিক দলগুলোর জন্য অনলাইন রেজিস্ট্রেশন উন্মুক্ত।',
      en: 'Annual drama and cultural festival taking place from 20-22 November 2026. Online registration open for cultural troupes.',
    },
    category: 'cultural',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    venue: {
      bn: 'ঈশ্বমপুর সার্বজনীন নাটমন্দির ও মুক্তমঞ্চ',
      en: 'Iswampur Community Amphitheatre',
    },
    coverImage: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    featured: false,
    showInHero: false,
    published: true,
    registrationEnabled: true, // LIVE REGISTRATION
    registrationDeadline: '2026-11-15T23:59:59.000Z',
    registrationFee: 500,
    minPlayers: 5,
    maxPlayers: 12,
    maxTeams: 10,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
    createdBy: 'skahidulla568@gmail.com',
  },

  // 4. December 2026 - Iswampur Premier League 2026 (10th Edition) - REGISTRATION OPEN / LIVE
  {
    id: 'event-ipl-2026',
    slug: 'iswampur-premier-league-2026',
    title: {
      bn: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ (দশম বর্ষ - IPL 2026)',
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
    gallery: [],
    featured: true,
    showInHero: true,
    published: true,
    registrationEnabled: true, // LIVE REGISTRATION
    registrationDeadline: '2026-12-15T23:59:59.000Z',
    registrationFee: 1500,
    minPlayers: 11,
    maxPlayers: 15,
    maxTeams: 16,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
    createdBy: 'skahidulla568@gmail.com',
  },
];

export const DUMMY_REGISTRATIONS: TeamRegistration[] = [
  // Jan 2026 - Cricket Cup (All Approved)
  {
    id: 'reg_winter_01',
    eventId: 'event-cricket-winter-2026',
    eventSlug: 'iswampur-winter-cricket-cup-2026',
    ownerUid: 'user_winter_01',
    ownerEmail: 'subhasish.das@gmail.com',
    ownerDisplayName: 'Subhasish Das',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-01-02T10:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'সোনালী স্পোর্টিং ক্লাব (Sonali Sporting)',
      address: 'পূর্ব পাড়া, ঈশ্বমপুর',
      representativeName: 'শুভাশিস দাস',
      email: 'subhasish.das@gmail.com',
      phone: '9832104521',
      emergencyPhone: '9832104522',
      members: [
        { name: 'শুভাশিস দাস (অধিনায়ক)', role: 'captain', phone: '9832104521' },
        { name: 'রমেন সাহা (সহ-অধিনায়ক)', role: 'vice_captain' },
        { name: 'সুজয় মন্ডল', role: 'wicketkeeper' },
        { name: 'আকাশ দত্ত', role: 'batsman' },
        { name: 'সুমন দে', role: 'bowler' },
        { name: 'অভিষেক পাল', role: 'allrounder' },
        { name: 'রোহিত দাস', role: 'player' },
        { name: 'প্রীতম রায়', role: 'player' },
        { name: 'সন্দীপ বিশ্বাস', role: 'player' },
        { name: 'দেবজ্যোতি কর', role: 'player' },
        { name: 'বিজয় ঘোষ', role: 'player' },
      ],
    },
    payment: {
      amount: 1000,
      utr: 'UPI20260102001',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-01-02T10:15:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_winter_01',
    humanPassCode: 'ISW-WCC26-001',
    createdAt: '2026-01-02T10:15:00.000Z',
    updatedAt: '2026-01-03T11:00:00.000Z',
  },
  {
    id: 'reg_winter_02',
    eventId: 'event-cricket-winter-2026',
    eventSlug: 'iswampur-winter-cricket-cup-2026',
    ownerUid: 'user_winter_02',
    ownerEmail: 'soumen.roy@gmail.com',
    ownerDisplayName: 'Soumen Roy',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-01-03T11:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'নবগ্রাম একাদশ (Nabagram XI)',
      address: 'নবগ্রাম রোড, ঈশ্বমপুর',
      representativeName: 'সৌমেন রায়',
      email: 'soumen.roy@gmail.com',
      phone: '9734561289',
      emergencyPhone: '9734561290',
      members: [
        { name: 'সৌমেন রায় (অধিনায়ক)', role: 'captain', phone: '9734561289' },
        { name: 'কৌশিক পাত্র', role: 'vice_captain' },
        { name: 'দীপ্তেশ সেন', role: 'batsman' },
        { name: 'রাকেশ ব্যানার্জী', role: 'bowler' },
        { name: 'সজল দাস', role: 'allrounder' },
        { name: 'মিথুন মল্লিক', role: 'wicketkeeper' },
        { name: 'অনিল মাহাতো', role: 'player' },
        { name: 'সাগর কর্মকার', role: 'player' },
        { name: 'বিপ্লব বিশ্বাস', role: 'player' },
        { name: 'অরুণভ ঘোষ', role: 'player' },
        { name: 'তাপস মণ্ডল', role: 'player' },
      ],
    },
    payment: {
      amount: 1000,
      utr: 'UPI20260103002',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-01-03T11:15:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_winter_02',
    humanPassCode: 'ISW-WCC26-002',
    createdAt: '2026-01-03T11:15:00.000Z',
    updatedAt: '2026-01-04T12:00:00.000Z',
  },
  {
    id: 'reg_winter_03',
    eventId: 'event-cricket-winter-2026',
    eventSlug: 'iswampur-winter-cricket-cup-2026',
    ownerUid: 'user_winter_03',
    ownerEmail: 'tanmay.ghosh@gmail.com',
    ownerDisplayName: 'Tanmay Ghosh',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-01-04T09:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'ঈশ্বমপুর ইয়ং স্টারস (Iswampur Young Stars)',
      address: 'কলেজ মোড়, ঈশ্বমপুর',
      representativeName: 'তন্ময় ঘোষ',
      email: 'tanmay.ghosh@gmail.com',
      phone: '9475123984',
      emergencyPhone: '9475123985',
      members: [
        { name: 'তন্ময় ঘোষ (অধিনায়ক)', role: 'captain', phone: '9475123984' },
        { name: 'অঙ্কিত মণ্ডল', role: 'vice_captain' },
        { name: 'শুভ্র নাগ', role: 'allrounder' },
        { name: 'সৌরভ অধিকারী', role: 'batsman' },
        { name: 'পিন্টু দাস', role: 'bowler' },
        { name: 'সোমনাথ পোদ্দার', role: 'wicketkeeper' },
        { name: 'রাজু রায়', role: 'player' },
        { name: 'গৌরব চক্রবর্তী', role: 'player' },
        { name: 'বিশাল হালদার', role: 'player' },
        { name: 'অর্ণব সেন', role: 'player' },
        { name: 'শুভ মণ্ডল', role: 'player' },
      ],
    },
    payment: {
      amount: 1000,
      utr: 'UPI20260104003',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-01-04T09:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_winter_03',
    humanPassCode: 'ISW-WCC26-003',
    createdAt: '2026-01-04T09:30:00.000Z',
    updatedAt: '2026-01-04T16:00:00.000Z',
  },

  // June 2026 - Football & Cultural Cup (All Approved)
  {
    id: 'reg_football_01',
    eventId: 'event-summer-fest-football-2026',
    eventSlug: 'iswampur-monsoon-fest-football-2026',
    ownerUid: 'user_football_01',
    ownerEmail: 'anirban.sen@gmail.com',
    ownerDisplayName: 'Anirban Sen',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-06-02T10:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'ফ্রেন্ডস ক্লাব ফুটবল একাদশ (Friends Club XI)',
      address: 'বাজারপাড়া, ঈশ্বমপুর',
      representativeName: 'অনির্বাণ সেন',
      email: 'anirban.sen@gmail.com',
      phone: '9874112233',
      emergencyPhone: '9874112234',
      members: [
        { name: 'অনির্বাণ সেন (অধিনায়ক)', role: 'captain', phone: '9874112233' },
        { name: 'সন্দীপন জানা', role: 'player' },
        { name: 'অরিন্দম সাহা', role: 'player' },
        { name: 'অর্ক বসু', role: 'player' },
        { name: 'প্রতীক গুহ', role: 'player' },
        { name: 'সুদীপ্ত নন্দী', role: 'player' },
        { name: 'বিপুল মণ্ডল', role: 'player' },
      ],
    },
    payment: {
      amount: 800,
      utr: 'UPI20260602001',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-06-02T10:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_foot_01',
    humanPassCode: 'ISW-FC26-001',
    createdAt: '2026-06-02T10:30:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
  },
  {
    id: 'reg_football_02',
    eventId: 'event-summer-fest-football-2026',
    eventSlug: 'iswampur-monsoon-fest-football-2026',
    ownerUid: 'user_football_02',
    ownerEmail: 'pritam.das@gmail.com',
    ownerDisplayName: 'Pritam Das',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-06-04T11:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'ঈশ্বমপুর রাইজিং ফুটবলারস (Rising Footballers)',
      address: 'উত্তর মাঠ, ঈশ্বমপুর',
      representativeName: 'প্রীতম দাস',
      email: 'pritam.das@gmail.com',
      phone: '9832001144',
      emergencyPhone: '9832001145',
      members: [
        { name: 'প্রীতম দাস (অধিনায়ক)', role: 'captain', phone: '9832001144' },
        { name: 'রাজেশ সর্দার', role: 'player' },
        { name: 'সুকুমার দে', role: 'player' },
        { name: 'অসীম সরকার', role: 'player' },
        { name: 'কমলেশ মণ্ডল', role: 'player' },
        { name: 'নয়ন ভৌমিক', role: 'player' },
        { name: 'সায়ন মাঝি', role: 'player' },
      ],
    },
    payment: {
      amount: 800,
      utr: 'UPI20260604002',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-06-04T11:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_foot_02',
    humanPassCode: 'ISW-FC26-002',
    createdAt: '2026-06-04T11:30:00.000Z',
    updatedAt: '2026-06-05T14:00:00.000Z',
  },
  {
    id: 'reg_football_03',
    eventId: 'event-summer-fest-football-2026',
    eventSlug: 'iswampur-monsoon-fest-football-2026',
    ownerUid: 'user_football_03',
    ownerEmail: 'rakesh.mondal@gmail.com',
    ownerDisplayName: 'Rakesh Mondal',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-06-05T14:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'জাগ্রতি সংঘ ফুটবল দল (Jagriti Sangha)',
      address: 'দক্ষিণপাড়া, ঈশ্বমপুর',
      representativeName: 'রাকেশ মণ্ডল',
      email: 'rakesh.mondal@gmail.com',
      phone: '9475889922',
      emergencyPhone: '9475889923',
      members: [
        { name: 'রাকেশ মণ্ডল (অধিনায়ক)', role: 'captain', phone: '9475889922' },
        { name: 'অমিত পাল', role: 'player' },
        { name: 'সুজিত অধিকারী', role: 'player' },
        { name: 'বিশ্বজিৎ কর', role: 'player' },
        { name: 'পার্থ সেন', role: 'player' },
        { name: 'রণজিৎ ভৌমিক', role: 'player' },
        { name: 'সঞ্জয় রায়', role: 'player' },
      ],
    },
    payment: {
      amount: 800,
      utr: 'UPI20260605003',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-06-05T14:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_foot_03',
    humanPassCode: 'ISW-FC26-003',
    createdAt: '2026-06-05T14:30:00.000Z',
    updatedAt: '2026-06-06T15:00:00.000Z',
  },

  // November 2026 - Cultural Drama & Music Evening (1 Approved, 1 Pending)
  {
    id: 'reg_natok_01',
    eventId: 'event-cultural-natok-2026',
    eventSlug: 'iswampur-drama-cultural-festival-2026',
    ownerUid: 'user_natok_01',
    ownerEmail: 'sharmila.mukherjee@gmail.com',
    ownerDisplayName: 'Sharmila Mukherjee',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-10-05T10:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: "নাট্যদল ঈশ্বমপুর - 'রক্তকরবী' নাট্যদল",
      address: 'নাট্যমঞ্চ লেন, ঈশ্বমপুর',
      representativeName: 'শর্মিলা মুখার্জী',
      email: 'sharmila.mukherjee@gmail.com',
      phone: '9830554411',
      emergencyPhone: '9830554412',
      members: [
        { name: 'শর্মিলা মুখার্জী (দলনেত্রী)', role: 'captain', phone: '9830554411' },
        { name: 'শুভম ভট্টাচার্য (মুখ্য চরিত্র)', role: 'player' },
        { name: 'অনন্যা ঘোষ', role: 'player' },
        { name: 'পার্থ প্রতিম দাস', role: 'player' },
        { name: 'সায়ন্তনী সেন', role: 'player' },
      ],
    },
    payment: {
      amount: 500,
      utr: 'UPI20261005001',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-10-05T10:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_natok_01',
    humanPassCode: 'ISW-DRA26-001',
    createdAt: '2026-10-05T10:30:00.000Z',
    updatedAt: '2026-10-06T11:00:00.000Z',
  },
  {
    id: 'reg_natok_02',
    eventId: 'event-cultural-natok-2026',
    eventSlug: 'iswampur-drama-cultural-festival-2026',
    ownerUid: 'user_natok_02',
    ownerEmail: 'poulami.dey@gmail.com',
    ownerDisplayName: 'Poulami Dey',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-10-08T12:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'সৃজন নৃত্যাঙ্গন নৃত্য একাডেমি (Srijan Nritangam)',
      address: 'কালীবাড়ি রোড, ঈশ্বমপুর',
      representativeName: 'পৌলমী দে',
      email: 'poulami.dey@gmail.com',
      phone: '9874332211',
      emergencyPhone: '9874332212',
      members: [
        { name: 'পৌলমী দে (নৃত্য পরিচালিকা)', role: 'captain', phone: '9874332211' },
        { name: 'ত্রিশা বিশ্বাস', role: 'player' },
        { name: 'মধুমিতা দত্ত', role: 'player' },
        { name: 'স্নেহা সাহা', role: 'player' },
        { name: 'অঙ্কিতা পাল', role: 'player' },
      ],
    },
    payment: {
      amount: 500,
      utr: 'UPI20261008002',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-10-08T12:30:00.000Z',
    },
    status: 'PENDING_REVIEW', // In review queue!
    createdAt: '2026-10-08T12:30:00.000Z',
    updatedAt: '2026-10-08T12:30:00.000Z',
  },

  // December 2026 - IPL 2026 (10th Edition) - 2 Approved, 1 Pending
  {
    id: 'reg_ipl_01',
    seasonId: 'ipl-2026',
    eventId: 'event-ipl-2026',
    eventSlug: 'iswampur-premier-league-2026',
    ownerUid: 'user_ipl_01',
    ownerEmail: 'team.warriors@gmail.com',
    ownerDisplayName: 'Rahul Mondal',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-10-09T14:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'ঈশ্বমপুর ওয়ারিয়র্স (Iswampur Warriors)',
      address: 'পশ্চিম পাড়া, ঈশ্বমপুর',
      representativeName: 'রাহুল মন্ডল',
      email: 'team.warriors@gmail.com',
      phone: '9876543210',
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
      utr: 'UPI20261009001',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-10-09T14:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_ipl_01',
    humanPassCode: 'ISW-IPL26-W9K2',
    createdAt: '2026-10-09T14:30:00.000Z',
    updatedAt: '2026-10-10T11:00:00.000Z',
  },
  {
    id: 'reg_ipl_02',
    seasonId: 'ipl-2026',
    eventId: 'event-ipl-2026',
    eventSlug: 'iswampur-premier-league-2026',
    ownerUid: 'user_ipl_02',
    ownerEmail: 'ahidulla.strikers@gmail.com',
    ownerDisplayName: 'Sk Ahidulla',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-10-10T09:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'ঈশ্বমপুর স্ট্রাইকার্স (Iswampur Strikers)',
      address: 'সেন্ট্রাল মোড়, ঈশ্বমপুর',
      representativeName: 'সেখ আহিদুল্লা',
      email: 'ahidulla.strikers@gmail.com',
      phone: '9876540001',
      emergencyPhone: '9876540002',
      members: [
        { name: 'সেখ আহিদুল্লা (অধিনায়ক)', role: 'captain', phone: '9876540001' },
        { name: 'ফারহান আহমেদ', role: 'vice_captain' },
        { name: 'ইমরান খান', role: 'wicketkeeper' },
        { name: 'শামীম মল্লিক', role: 'batsman' },
        { name: 'আরিফ হোসেন', role: 'allrounder' },
        { name: 'সাজিদ মণ্ডল', role: 'bowler' },
        { name: 'তানভীর আলম', role: 'player' },
        { name: 'মেহবুব সেখ', role: 'player' },
        { name: 'রফিক কাজি', role: 'player' },
        { name: 'নাসিম হক', role: 'player' },
        { name: 'শাহজাহান আলি', role: 'player' },
      ],
    },
    payment: {
      amount: 1500,
      utr: 'UPI20261010002',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-10-10T09:30:00.000Z',
    },
    status: 'APPROVED',
    passId: 'pass_ipl_02',
    humanPassCode: 'ISW-IPL26-ST8X',
    createdAt: '2026-10-10T09:30:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'reg_ipl_03',
    seasonId: 'ipl-2026',
    eventId: 'event-ipl-2026',
    eventSlug: 'iswampur-premier-league-2026',
    ownerUid: 'user_ipl_03',
    ownerEmail: 'milan.majumder@gmail.com',
    ownerDisplayName: 'Milan Majumder',
    language: 'bn',
    termsAccepted: true,
    termsAcceptedAt: '2026-10-11T16:00:00.000Z',
    termsVersion: '2026.1',
    team: {
      name: 'রয়্যাল চ্যালেঞ্জার্স ঈশ্বমপুর (Royal Challengers)',
      address: 'স্টেশন রোড, ঈশ্বমপুর',
      representativeName: 'মিলন মজুমদার',
      email: 'milan.majumder@gmail.com',
      phone: '9876540003',
      emergencyPhone: '9876540004',
      members: [
        { name: 'মিলন মজুমদার (অধিনায়ক)', role: 'captain', phone: '9876540003' },
        { name: 'সুকান্ত হালদার', role: 'vice_captain' },
        { name: 'অর্ণব ঘোষ', role: 'wicketkeeper' },
        { name: 'দীপেন সাহা', role: 'batsman' },
        { name: 'আকাশ রায়', role: 'allrounder' },
        { name: 'শুভঙ্কর দাস', role: 'bowler' },
        { name: 'সোমনাথ কর', role: 'player' },
        { name: 'সুশান্ত মল্লিক', role: 'player' },
        { name: 'অভিষেক সরকার', role: 'player' },
        { name: 'দেবব্রত বিশ্বাস', role: 'player' },
        { name: 'সায়ন্তন ভৌমিক', role: 'player' },
      ],
    },
    payment: {
      amount: 1500,
      utr: 'UPI20261011003',
      screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-10-11T16:15:00.000Z',
    },
    status: 'PENDING_REVIEW', // In review queue!
    createdAt: '2026-10-11T16:15:00.000Z',
    updatedAt: '2026-10-11T16:15:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    let seededEvents = 0;
    let seededRegistrations = 0;

    // 1. Seed Events
    for (const ev of DUMMY_EVENTS) {
      await repository.saveEvent(ev);
      if (db) {
        try {
          await setDoc(doc(db, 'events', ev.id), cleanForFirestore(ev), { merge: true });
        } catch (e) {
          console.warn(`Firestore event seed error for ${ev.id}:`, e);
        }
      }
      seededEvents++;
    }

    // 2. Seed Registrations & Passes
    for (const reg of DUMMY_REGISTRATIONS) {
      await repository.saveRegistration(reg);
      if (db) {
        try {
          await setDoc(doc(db, 'registrations', reg.id), cleanForFirestore(reg), { merge: true });
        } catch (e) {
          console.warn(`Firestore registration seed error for ${reg.id}:`, e);
        }
      }

      // If approved, seed corresponding pass as well
      if (reg.status === 'APPROVED' && reg.passId) {
        const ev = DUMMY_EVENTS.find((e) => e.id === reg.eventId);
        const pass: TeamPass = {
          passId: reg.passId,
          humanPassCode: reg.humanPassCode || reg.passId,
          registrationId: reg.id,
          eventId: reg.eventId,
          eventTitle: ev?.title || { bn: reg.team.name, en: reg.team.name },
          teamName: reg.team.name,
          representativeName: reg.team.representativeName,
          memberCount: reg.team.members?.length || 1,
          issuedAt: reg.updatedAt || new Date().toISOString(),
          status: 'ACTIVE',
          venue: ev?.venue || { bn: 'ঈশ্বমপুর কেন্দ্রীয় খেলার মাঠ', en: 'Iswampur Central Sports Ground' },
          eventDate: ev?.startDate || '২০২৬',
          signature: computePassSignature({
            passId: reg.passId,
            registrationId: reg.id,
            teamName: reg.team.name,
            eventId: reg.eventId,
          }),
        };
        await repository.savePass(pass);
      }

      seededRegistrations++;
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy events and registrations successfully synced to Firebase and local memory!',
      seededEvents,
      seededRegistrations,
    });
  } catch (error: any) {
    console.error('Failed to seed dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data', details: error?.message },
      { status: 500 }
    );
  }
}
