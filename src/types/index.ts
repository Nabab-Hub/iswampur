// Core Data Types for Iswampur Village Events & IPL Management System

export type SupportedLanguage = 'bn' | 'en';

export interface BilingualText {
  bn: string;
  en: string;
}

export type UserRole = 'public' | 'team_user' | 'admin' | 'super_admin';

export type PermissionKey =
  | 'events.manage'
  | 'gallery.manage'
  | 'notices.manage'
  | 'content.manage'
  | 'registrations.view'
  | 'registrations.review'
  | 'registrations.export'
  | 'payments.verify'
  | 'passes.manage'
  | 'matchday.checkin'
  | 'admins.manage'
  | 'ipl.manage'
  | 'settings.manage';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: PermissionKey[];
  eventScope?: string[]; // e.g. ["ipl-2026"] or empty for all
  active: boolean;
  addedBy: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SiteSettings {
  siteName: BilingualText;
  logoUrl?: string;
  tagline: BilingualText;
  aboutText: BilingualText;
  aboutHistory?: BilingualText;
  contact: {
    email: string;
    phone: string;
    address: BilingualText;
  };
  socialLinks: {
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    instagram?: string;
  };
  footerCopyright: BilingualText;
  payment: {
    upiId: string;
    payeeName: string;
    qrCodeUrl: string;
    instructions: BilingualText;
  };
  reviewerAdmins: string[]; // List of admin emails who receive registration review emails
  iplRegistrationOpen: boolean;
  activeSeasonId: string;
}

export type EventCategory = 
  | 'cricket'
  | 'sports'
  | 'cultural'
  | 'festival'
  | 'national_day'
  | 'community'
  | 'social';

export interface EventPhoto {
  id: string;
  url: string;
  publicId?: string;
  caption: BilingualText;
  order: number;
}

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: BilingualText;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: BilingualText;
  options?: string[]; // For select dropdowns
  order: number;
}

export interface VillageEvent {
  id: string;
  slug: string;
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  category: EventCategory;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue: BilingualText;
  coverImage: string;
  gallery: EventPhoto[];
  featured: boolean;
  showInHero: boolean;
  published: boolean;
  registrationEnabled: boolean;
  registrationStartDate?: string;
  registrationDeadline?: string;
  registrationFee?: number;
  minPlayers?: number;
  maxPlayers?: number;
  maxTeams?: number;
  rules?: BilingualText;
  rulesVersion?: string;
  customFields?: FormFieldDefinition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PostAnnouncement {
  id: string;
  title: BilingualText;
  content: BilingualText;
  coverImage?: string;
  images?: string[]; // Multiple images for instagram-like gallery posts
  category: 'notice' | 'ipl' | 'event' | 'urgent' | 'result';
  published: boolean;
  featured: boolean;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
  authorEmail: string;
}

export interface IPLSeason {
  id: string;
  slug: string;
  name: BilingualText;
  year: number;
  registrationOpen: boolean;
  registrationDeadline: string;
  eventDate: string;
  venue: BilingualText;
  registrationFee: number;
  minPlayers: number;
  maxPlayers: number;
  maxTeams: number;
  rules: BilingualText;
  rulesVersion: string;
  paymentQrUrl?: string;
  upiId?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export type RegistrationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TeamMember {
  name: string;
  role?: 'captain' | 'vice_captain' | 'wicketkeeper' | 'batsman' | 'bowler' | 'allrounder' | 'player';
  phone?: string;
}

export interface TeamRegistration {
  id: string; // e.g. reg_xxxx
  seasonId?: string;
  eventId: string;
  eventSlug: string;
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName?: string;
  language: SupportedLanguage;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  termsVersion: string;
  team: {
    name: string;
    address: string;
    representativeName: string;
    email: string;
    phone: string;
    emergencyName?: string;
    emergencyPhone: string;
    members: TeamMember[];
  };
  customFieldValues?: Record<string, any>;
  payment: {
    amount: number;
    utr?: string;
    screenshotUrl: string;
    screenshotPublicId?: string;
    submittedAt: string;
  };
  status: RegistrationStatus;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  passId?: string;
  humanPassCode?: string; // e.g. ISW-IPL26-9X4K
  createdAt: string;
  updatedAt: string;
  history?: {
    action: string;
    performedBy: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface TeamPass {
  passId: string;
  humanPassCode: string; // e.g. ISW-IPL26-9X4K
  registrationId: string;
  eventId: string;
  eventTitle: BilingualText;
  teamName: string;
  representativeName: string;
  memberCount: number;
  issuedAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'CHECKED_IN';
  checkedInAt?: string;
  checkedInBy?: string;
  venue: BilingualText;
  eventDate: string;
  signature: string; // HMAC-SHA256
  qrDataUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}
