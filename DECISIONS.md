# Architectural Decisions & Implementation Notes

This document logs design decisions, architectural patterns, and clarifications implemented for the **Iswampur Village Events & IPL Management Platform**.

## 1. Unified Full-Stack Architecture: Next.js App Router
- **Context:** Prompt Part 1 specified Next.js App Router (TypeScript, Tailwind, deployed on Vercel at `iswampur.vercel.app`), while Part 2 mentioned React/Vite + Node/Express.
- **Decision:** Built on **Next.js App Router (TypeScript, Tailwind CSS, Turbopack)**.
- **Rationale:** Next.js App Router natively combines a modern React client with server-side Node.js route handlers (`/api/...`). This satisfies:
  1. Direct zero-config Vercel deployment (`iswampur.vercel.app`).
  2. Server-side secrets protection (Firebase Admin SDK, Cloudinary API secret, SMTP password, HMAC signing keys never leak to client).
  3. Server-side PDF generation (`pdf-lib`) and cryptographic QR generation.
  4. Unified codebase, eliminating multi-server deployment overhead while giving full API capabilities.

## 2. Bilingual Support (i18n) & Dynamic DB Schema
- **Default Language:** Bengali (`bn`). Toggle available in Navbar (`বাংলা` / `English`).
- **Persistence:** Stored in `localStorage` and `cookie`.
- **Dynamic Content:** Structured as `{ bn: string, en: string }` across all entities (Events, Posts, Rules, Settings, Captions). If `en` is empty, the UI automatically falls back to `bn`.
- **Static Translations:** Centralized dictionaries for standard UI strings.

## 3. Graceful Fallback / Dual Mode (Production Firebase + Resilient In-Memory/Storage Mock)
- **Context:** Initial deployment or local development might occur before Firebase credentials or Cloudinary keys are configured in `.env.local`.
- **Decision:** Built a dual-mode data layer:
  - If Firebase Admin credentials exist in `.env.local`, operations persist to Cloud Firestore and Firebase Auth.
  - If credentials are absent or placeholder, the system seamlessly uses an intelligent mock persistence layer with initial seeded data (Super Admin `skahidulla568@gmail.com`, Admin `jonsknabab@gmail.com`, IPL 2026 season, rules, sample events and posts).
  - This guarantees the application runs, builds, and demonstrates all features end-to-end immediately without blocking.

## 4. Cryptographic Pass ID & Tamper-Proof Signature
- **Pass ID Format:** High-entropy random alphanumeric token (e.g., `reg_7f9c2e...` internal, and formatted pass code like `ISW-IPL26-9X2KP4`).
- **Security:** HMAC-SHA256 signature generated with `PASS_SIGNING_SECRET`. Tampering with any pass parameter causes verification failure.
- **Verification Page (`/verify/[passId]`):** Publicly shows only team name, event name, status (Valid/Checked In/Revoked), and issuance date. Personal emails and phone numbers are strictly protected.

## 5. Granular RBAC & Super Admin Protection
- **Super Admin:** Immutable server-side guard checking `SUPER_ADMIN_EMAIL` (`skahidulla568@gmail.com`). Cannot be demoted or removed by any admin.
- **Granular Permissions:** Checkbox matrix covering `events.manage`, `gallery.manage`, `notices.manage`, `content.manage`, `registrations.view`, `registrations.review`, `registrations.export`, `payments.verify`, `passes.manage`, `matchday.checkin`, `admins.manage`, `ipl.manage`.
- **Reviewer Admin Routing:** Super Admin selects specific admin emails designated as IPL reviewers. Submissions trigger email notifications to those selected reviewers.
