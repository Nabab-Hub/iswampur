# Iswampur Village Events Website: Complete Build Plan (for Antigravity)

Build this as a production-ready full-stack web app. Follow every section. Where something is ambiguous, pick the safest, simplest option and note it in a `DECISIONS.md`.

## 1. Purpose
A bilingual (Bengali default / English) village website for **Iswampur**. Main use: online team registration for the yearly **Iswampur Premier League (IPL)** cricket tournament. Secondary use: a beautiful showcase of every village event (IPL, 26 January, 15 August, etc.) with photos and captions.

Site name: `SITE_NAME_BN` / `SITE_NAME_EN` are stored in site settings (editable from admin). Use a placeholder until the owner sets it.

## 2. Tech Stack
- **Framework:** Next.js (App Router) + TypeScript, deployed on Vercel (current URL: iswampur.vercel.app)
- **Styling:** Tailwind CSS, CSS variables for theming
- **DB:** Firebase Firestore
- **Auth:** Firebase Authentication, **Google sign-in only** (no email/password)
- **Images:** Cloudinary (server-signed uploads only)
- **Mail:** Nodemailer (SMTP / Gmail app password) from server routes only
- **PDF pass:** server-side generation (pdf-lib or @react-pdf/renderer) + QR code (`qrcode`)
- **Validation:** Zod on every API input
- **Fonts:** a good Bengali font (Noto Sans Bengali / Hind Siliguri) plus a Latin font
- **Secrets:** all in `.env.local`, never in client code. Provide `.env.example` with these keys:
  `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `SUPER_ADMIN_EMAIL`, `PASS_SIGNING_SECRET`, `NEXT_PUBLIC_SITE_URL`

## 3. Global Requirements
### 3.1 Bilingual (i18n)
- **Default language: Bengali (bn).** Navbar has a toggle button: shows `English` when in Bengali, `বাংলা` when in English. Choice saved in localStorage/cookie.
- All static UI text lives in `bn.json` / `en.json`.
- **All dynamic content is stored bilingually in the DB** as `{ bn: string, en: string }` (event titles, captions, rules, notices, hero text, about text, footer, etc.). Every admin form shows two fields per text (Bengali and English). If English is empty, fall back to Bengali.
- Dates formatted per language (Bengali numerals optional in bn).

### 3.2 Theme
- Light/Dark toggle in navbar (sun/moon icon). Respect system preference on first visit, then remember the choice. No flash on load.

### 3.3 Everything editable from admin
Nothing important is hard-coded. Editable via admin: site name, logo, hero text/images, about section, events, gallery, notices, IPL rules, payment QR, registration open/close, footer/contact info, social links.

### 3.4 Quality
Mobile-first and responsive (most villagers use phones), fast, accessible, SEO meta + Open Graph per language, loading skeletons, friendly error pages, image optimization (Cloudinary transformations, lazy loading).

## 4. Roles and Permissions (RBAC)
Three levels of access:

| Role | Who | Notes |
|---|---|---|
| **Public visitor** | anyone | view landing page only |
| **Team user** | any Google account | signs in only to register/track a team |
| **Admin** | emails added by super admin | access limited to assigned permissions |
| **Super admin** | `SUPER_ADMIN_EMAIL` (skahidulla568@gmail.com) | full control |

- Seed the first admin (jonsknabab@gmail.com) via the super admin panel or a seed script, not hard-coded in the client.
- Super admin email is read from env on the server; it can never be removed or demoted by anyone.
- Role is decided **server-side**: after Google sign-in, check the email against the `admins` collection / super admin env. Use Firebase **custom claims** (`role`, `permissions`) set via Admin SDK, and verify the ID token on every protected API route.

### 4.1 Permission keys (granular, assignable per admin by super admin)
- `events.manage` (create/edit/delete events, photos, captions)
- `gallery.manage`
- `notices.manage` (hero notifications / announcements)
- `content.manage` (site settings, about, footer, rules text, hero)
- `registrations.view`
- `registrations.review` (approve/reject)
- `registrations.export`
- `payments.verify`
- `passes.manage` (regenerate/revoke passes)
- `matchday.checkin` (verify/scan passes on ground)

Each admin can also be given scope per event (e.g., only "IPL 2026"). Super admin UI: a checkbox matrix of admins × permissions, add/remove/disable admin, and an audit log.

### 4.2 Registration review routing
Super admin selects **which admin(s) receive the registration/payment review mail** and who can approve (setting: `reviewerAdmins[]`). When a team submits, mail goes to those admins. Optionally allow "any one of reviewers can approve".

## 5. Public Landing Page
Sections, top to bottom:
1. **Navbar:** logo, site name, links (Home, Events, Gallery, IPL Registration, About, Contact), language toggle, theme toggle, Sign-in (only visible in registration/tracking context; admins reach the panel via a discreet link or `/admin`).
2. **Hero:** Iswampur village logo (owner will supply; use placeholder), big headline, and **latest event notification with date**. If the event has registration open, show a prominent **"Register Now" button** linking to the registration page. Support an auto-rotating banner of upcoming/recent events.
3. **Latest events (featured):** most recent events shown first, large, beautiful cards/carousel with cover image, title, date, short caption.
4. **Older events:** below, in reverse chronological order (grid with "load more").
5. **Event detail page** `/events/[slug]`: gallery (lightbox), caption per photo, description, date, location, registration link if any.
6. **Gallery** (optional separate page): all photos by event/year filter.
7. **About village / tournament**, **Contact**, **Footer**.

Only admins can add events, photos and captions. The public cannot upload anything.

## 6. IPL Registration Flow (critical)
Route: `/register/[eventSlug]`. Steps, shown as a progress stepper:

**Step 0: Gate:** If registration is closed (admin toggle or past deadline), show a closed message instead.

**Step 1: Rules and Regulations**
- Show rules in the user's chosen language (bn/en, editable from admin).
- Checkbox "I have read and accept" + Continue button (disabled until checked).
- Store acceptance with timestamp and rules version.

**Step 2: Team Sign-in**
- "Sign in with Google" (Firebase Auth). This Google account becomes the team owner, so they can track status.
- One team per Google account per event (enforced server-side).

**Step 3: Team Details Form**
Fields: team name, address, list of team members (dynamic rows; min/max players set by admin per event), team valid email (verify format; optionally send OTP), team valid phone (Indian format validation), emergency contact name + number. Next button. Save as **draft** automatically so users can resume.

**Step 4: Payment**
- Show the payment QR (uploaded by admin, editable) and the amount (admin-set).
- Collect UPI transaction/UTR number (optional but recommended) and **payment screenshot upload** (jpg/png/webp, max 5 MB; validate type and size server-side; upload via server-signed Cloudinary upload to a private/authenticated folder).
- Submit button.

**Step 5: Waiting message**
- Show "Your registration is submitted. Admin will verify within 24 hours. You will get an email." Show a Track Status page `/my-registration` for the signed-in team: Pending / Approved / Rejected (with reason) / Need correction.
- On submit: email the team a "received" confirmation and email the reviewer admins a "new registration to review" with a link to the admin panel.

**Step 6: Admin review** (see section 7). On **approve**:
- Status = approved. Generate the **Team Pass** (see section 8).
- Email the team a warm welcome message ("Welcome to Iswampur Premier League! Your entry is confirmed...") in the language the team registered with, plus the PDF pass (attachment and/or secure download link).
- The pass is also visible and downloadable on the team's `/my-registration` page.
On **reject/needs correction:** admin gives a reason; the team gets a mail and can edit and resubmit.

Additional rules: duplicate team name check per event, duplicate UTR/phone check, rate limiting on submit, and a registration deadline / max teams cap (admin-settable).

## 7. Admin Panel (`/admin`)
Visible menu items depend on permissions. Pages:
- **Dashboard:** counts (events, pending/approved/rejected registrations), recent activity.
- **Events:** create/edit/delete, bilingual title/description/caption, date, location, cover image, multiple photos each with bilingual caption, drag to reorder, publish/draft, "registration enabled" toggle + link + deadline, "show in hero" toggle.
- **Notices/Hero:** create announcements with date, optional registration link, expiry.
- **Site content:** logo, site name, about, contact, footer, social links, rules text, payment QR + amount.
- **Registrations:** table with search/filter (status, event), detail view with all fields and payment screenshot (zoomable), approve / reject / request correction with reason, internal notes, export CSV (if permitted).
- **Match-day check-in:** page to verify a pass by scanning the QR or typing the pass ID; shows team name and valid/used status; marks checked in.
- **My profile.**

All writes go through server API routes that re-check the role and permission. Never rely on hidden UI alone.

## 8. Team Pass (secure and unpredictable)
- On approval, generate `passId` using a **cryptographically secure random** value (e.g., `crypto.randomBytes` / nanoid with 16+ chars). Never sequential, never derived from team name, phone, or timestamp. Optional human-friendly short code (e.g., `ISW-7K2M-9QXD`) also random, stored with a uniqueness check.
- Store in Firestore `passes` collection: `passId`, `registrationId`, `teamName`, `eventId`, `issuedAt`, `status` (active/revoked/checked_in), `checkedInAt/By`, `signature`.
- `signature` = HMAC-SHA256 of the pass fields with `PASS_SIGNING_SECRET`, so tampering is detectable.
- The pass is a **printable PDF** (A4 or A5): logo, event name, team name, team members, pass ID, QR code that encodes a verification URL `/verify/[passId]` (public page showing only valid/invalid + team name, no private data), event date/venue, instruction line "Print and submit at the ground".
- Regenerating or revoking a pass is possible for `passes.manage`.
- Email the PDF and a secure download link. Download links must require the team's sign-in or a signed, expiring token.

## 9. Firestore Data Model
Use text/string fields for everything validatable; store all IDs as random strings.
- `settings/site`: `{ siteName{bn,en}, logoUrl, about{bn,en}, contact, social, footer{bn,en}, paymentQrUrl, ... }`
- `events/{id}`: `{ slug, title{bn,en}, description{bn,en}, date, location{bn,en}, coverImage, photos[{url, publicId, caption{bn,en}, order}], published, showInHero, registration{enabled, deadline, fee, minPlayers, maxPlayers, maxTeams, rules{bn,en}, rulesVersion}, createdBy, createdAt, updatedAt }`
- `notices/{id}`: `{ text{bn,en}, date, eventId?, registrationLink?, expiresAt, active }`
- `admins/{emailLower}`: `{ email, name, permissions[], eventScope[], active, addedBy, createdAt }`
- `registrations/{id}`: `{ eventId, ownerUid, ownerEmail, language, rulesAcceptedAt, rulesVersion, team{name, address, email, phone, emergencyName, emergencyPhone, members[{name, role?}]}, payment{amount, utr, screenshot{url, publicId}}, status(draft|submitted|approved|rejected|needs_correction), reviewNote, reviewedBy, reviewedAt, passId?, createdAt, updatedAt }`
- `passes/{passId}`: see section 8
- `auditLogs/{id}`: `{ actor, action, target, meta, at }` (admin changes, approvals, role changes)
- `mailLogs/{id}`: `{ to, type, status, error?, at }`

## 10. Firestore Security Rules and API Rules
- Default **deny all** client writes to sensitive collections. Prefer server API routes (Admin SDK) for registrations, passes, admins, settings.
- Public read allowed only for: published `events`, active `notices`, `settings/site` public fields.
- A team user may read only their own `registrations` (`ownerUid == request.auth.uid`) and cannot change `status`, `passId`, or review fields.
- `admins`, `passes`, `auditLogs`, `mailLogs` are never client-readable (except pass verification via a server route returning minimal data).
- Cloudinary: signed uploads from server; payment screenshots stored as **authenticated/private** assets, viewable only by reviewers.
- Rate limit sensitive routes (registration submit, pass verify, auth callbacks). Sanitize all text (prevent XSS). Use security headers (CSP, HSTS, X-Frame-Options). CSRF-safe patterns (same-site cookies / Authorization header with ID token).

## 11. Email Templates (bilingual, in `/emails`)
Nice HTML templates, language by `registration.language`:
1. Registration received (to team)
2. New registration to review (to reviewer admins, with deep link)
3. **Approved: Welcome to the Iswampur Premier League** (warm message + PDF pass + link)
4. Rejected / needs correction (with reason and link to edit)
5. Admin invited (to a newly added admin)
Log each send in `mailLogs`; retry on failure.

## 12. Folder Structure (suggested)
```
src/
  app/
    (public)/ page.tsx, events/, gallery/, about/, contact/
    register/[slug]/, my-registration/, verify/[passId]/
    admin/ (dashboard, events, notices, content, registrations, checkin)
    super-admin/ (admins, permissions, reviewers, settings, audit-log)
    api/ (events, registrations, passes, uploads/sign, admin/*, mail/*)
  components/  lib/ (firebaseClient, firebaseAdmin, auth, rbac, cloudinary, mailer, pass, i18n, validators)
  messages/ bn.json en.json
  emails/
```

## 13. Super Admin Panel (`/super-admin`)
- Everything admins can do, plus:
- Add/remove/disable admins by Google email; assign permissions and event scope with a checkbox matrix.
- Choose **reviewer admins** who receive registration mails and can approve.
- Global settings: registration open/close, default language, maintenance mode.
- View audit log and mail log; revoke any pass; export all data.
- Safety: cannot remove self; super admin email from env.

## 14. Build Order for Antigravity
1. Project setup, Tailwind, i18n (bn default), theme toggle, `.env.example`.
2. Firebase client/admin setup, Google auth, role/claims, RBAC middleware.
3. Super admin: admins and permissions management.
4. Site settings, events CRUD with bilingual fields, Cloudinary signed uploads.
5. Public landing page, event pages, gallery, hero with notices.
6. Registration flow (steps 0 to 5), drafts, status tracking.
7. Admin registration review, mail sending (Nodemailer), templates.
8. Pass generation, PDF, QR, verify page, match-day check-in.
9. Security rules, rate limiting, audit logs, validation pass.
10. Testing (role access, duplicate registration, file validation, pass tampering), README with setup and deploy steps for Vercel.

## 15. Acceptance Checklist
- [ ] Whole site Bengali by default, English toggle works everywhere, including admin-entered content
- [ ] Light/dark mode works without flash
- [ ] Only admins with permission can add events/photos/captions
- [ ] Hero shows latest event with date and registration link when enabled
- [ ] Registration flow works end to end with Google sign-in, QR payment, screenshot upload
- [ ] Reviewer admins chosen by super admin receive mail; approval sends welcome mail with PDF pass
- [ ] Pass IDs random, unique, signed; verify page works; tampered pass fails
- [ ] A normal user or non-permitted admin cannot reach protected API routes (tested)
- [ ] No secrets in client bundle; all keys from `.env`
- [ ] Mobile layout polished







তোর idea-টা আমি একটু restructure করলে এটা অনেক বেশি powerful হবে। **Website-এর core হবে “Iswampur Gram Digital Platform”**, আর তার মধ্যে **Iswampur Premier League (IPL)** হবে সবচেয়ে important event/module।

একটা জিনিস আগে ঠিক করে দিচ্ছি: **registration form, events, posts, gallery, notices, rules, payment QR, admin permissions—কোনোটাই hard-coded রাখা উচিত না।** এগুলো Firebase থেকে dynamic হবে এবং admin panel থেকে edit করা যাবে।

নিচেরটা সরাসরি **Antigravity-কে master development specification/prompt** হিসেবে দিতে পারিস।

---

# ISWAMPUR — Complete Website & Management System Specification

## 1. Project Overview

Build a modern, professional, responsive bilingual community website for **Iswampur Gram**, with the primary purpose of managing and promoting the annual **Iswampur Premier League (IPL)** cricket tournament.

However, the platform must NOT be limited to IPL.

It should be designed as a complete **Iswampur Events & Community Platform**, where administrators can create and manage:

* Iswampur Premier League
* 26 January celebrations
* 15 August celebrations
* Cultural programs
* Sports events
* Puja/festival events
* Community programs
* Social initiatives
* Announcements
* Other future events

The system must be highly dynamic and CMS-driven.

The public website should require almost no code changes when new content/events are added.

---

# 2. Website Identity

Website:

**Iswampur**

Main purpose:

> A digital platform for Iswampur village where residents and visitors can discover events, photographs, announcements, activities and participate in registrations.

Primary highlighted event:

**Iswampur Premier League**

The user will provide the official Iswampur logo separately.

Use that logo throughout the website where appropriate.

---

# 3. Core Architecture

The application should have three major areas:

### A. Public Website

Accessible to everyone.

### B. Admin Panel

For authorized administrators.

### C. Super Admin Panel

For complete system control.

Architecture:

```text
Public Website
      |
      |
      v
Firebase Authentication
      |
      +---- Admin Panel
      |
      +---- Super Admin Panel
      |
      v
Firebase Firestore
      |
      +---- Cloudinary
      |
      +---- Nodemailer
```

---

# 4. Technology Stack

Use:

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Modern component architecture
* Responsive design
* Mobile-first approach

Avoid unnecessary UI libraries if custom Tailwind components can provide the same result.

Icons:

* Lucide React

Do NOT create manual SVG/icon mappings when Lucide icons are available.

---

### Backend

Use:

* Node.js
* Express.js

Backend responsibilities:

* Admin-sensitive operations
* Registration processing
* Approval/rejection workflows
* Email sending
* Secure Cloudinary operations
* Server-side validation
* PDF generation
* Registration pass generation
* Payment verification workflow
* Permission validation

---

### Database

Firebase Firestore.

---

### Authentication

Only:

**Firebase Google Sign-In**

No username/password authentication.

Public users/team representatives can authenticate using Google when registration requires it.

Admins also authenticate through Google.

Admin access must be determined from the database/authorization system, NOT merely from the fact that someone successfully logged in with Google.

---

### Image Storage

Cloudinary.

Do NOT store large images directly inside Firestore.

Firestore should only store:

```text
cloudinary public ID
image URL
metadata
caption
event ID
upload information
```

---

### Email

Nodemailer.

All email credentials must be stored in `.env`.

---

# 5. Environment Variables

Never hard-code secrets.

Example:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

SUPER_ADMIN_EMAIL=skahidulla568@gmail.com
```

Never expose:

* Firebase Admin credentials
* Cloudinary API secret
* SMTP password
* private keys

to frontend JavaScript.

---

# 6. Language System

The entire public website must support:

### Bengali

Default language.

### English

Optional language.

Navbar should contain a language switcher:

```text
বাংলা | @ English
```

or a clean toggle such as:

```text
বাংলা / English
```

Default:

**Bengali**

When English is selected:

* Navbar
* Hero
* Buttons
* Event names
* Event descriptions
* Notices
* Registration instructions
* Rules
* Forms
* Validation messages
* Emails where applicable
* Registration pass
* Public content

should switch to English.

When Bengali is selected, everything returns to Bengali.

---

# 7. IMPORTANT — Admin Must Support Both Languages

Do NOT translate content automatically using Google Translate.

Every editable content field that appears publicly should support:

```text
title_bn
title_en

description_bn
description_en

caption_bn
caption_en
```

For example:

```json
{
  "title_bn": "ইস্বামপুর প্রিমিয়ার লীগ ২০২৬",
  "title_en": "Iswampur Premier League 2026"
}
```

Admin should be able to enter both versions manually.

If English content is not provided, the system should optionally fall back to Bengali rather than displaying an empty section.

---

# 8. Theme System

Navbar must contain:

* Light mode
* Dark mode
* Language switcher

Persist theme preference using localStorage.

The entire website must support dark mode properly.

Do not simply invert colors.

Create a proper design system for:

* backgrounds
* cards
* text
* borders
* buttons
* forms
* modals
* tables

---

# 9. Public Website Pages

Recommended structure:

```text
/
├── Home
├── Events
├── Event Details
├── Gallery
├── Announcements
├── IPL
│   ├── IPL Home
│   ├── Rules
│   ├── Registration
│   ├── Registered Teams
│   └── Team Pass Verification
├── About Iswampur
├── Contact
└── Verify Pass
```

---

# 10. Home Page

The homepage should immediately communicate:

> Welcome to Iswampur

and showcase the latest activities.

## Hero Section

Large attractive hero section.

Include:

* Iswampur logo
* Village name
* Short Bengali introduction
* English equivalent
* Current highlighted event
* Event date
* CTA

If a new event requires registration, show:

```text
Registration Open
```

with:

```text
Register Now
```

button.

Example:

```text
ইস্বামপুর প্রিমিয়ার লীগ ২০২৬

নিবন্ধন চলছে

[নিবন্ধন করুন]
```

Hero content must be controlled from Admin Panel.

---

# 11. Event Notification System

When an important new event is created, admin can mark:

```text
featured = true
```

and optionally:

```text
showInHero = true
```

Admin can also configure:

```text
registrationOpen
registrationClose
eventDate
registrationURL
```

If registration is open:

```text
Registration Open
```

appears.

If registration is closed:

```text
Registration Closed
```

appears.

---

# 12. Events Section

Homepage should show:

### Upcoming / Recent Events

First.

Then:

### Previous Events

below.

Sorting:

```text
Upcoming events
↓
Most recent events
↓
Older events
```

Each event card should contain:

* Cover image
* Bengali title
* English title
* Date
* Location
* Short description
* Event category
* View Details

---

# 13. Event Management

Admin should be able to create an event.

Fields:

```text
Event ID
Event Name Bengali
Event Name English
Short Description Bengali
Short Description English
Full Description Bengali
Full Description English
Event Category
Start Date
End Date
Start Time
End Time
Venue Bengali
Venue English
Cover Image
Gallery
Featured
Show on Homepage
Show in Hero
Registration Enabled
Registration URL
Status
Created At
Updated At
Created By
```

Event categories should themselves be manageable by admin.

Examples:

```text
Sports
Festival
National Day
Cultural
Community
Education
Other
```

---

# 14. Event Gallery

Each event can contain multiple photos.

Admin-only upload.

Every image should support:

```text
Image
Caption Bengali
Caption English
Event ID
Uploaded By
Uploaded At
Display Order
```

Admin can:

* Upload
* Delete
* Reorder
* Edit caption
* Set featured image

Visitors can only view.

---

# 15. Gallery UI

Use a beautiful responsive gallery.

Desktop:

```text
Masonry / grid
```

Mobile:

```text
2-column responsive grid
```

Clicking an image should open a lightbox.

Show:

* Image
* Caption
* Event name
* Date

Optional:

* Next/previous navigation
* Fullscreen

---

# 16. Posts / Announcements

Create a separate CMS for announcements.

Admin can publish:

* Important notices
* Registration announcements
* Event announcements
* Results
* Community notices

Fields:

```text
postId
title_bn
title_en
content_bn
content_en
coverImage
category
published
featured
publishAt
createdAt
updatedAt
authorId
```

---

# 17. IPL Module

The IPL module should be treated as a dedicated event-management system inside the main website.

Name:

**Iswampur Premier League**

It should have:

```text
IPL Home
Rules & Regulations
Registration
Teams
Announcements
Gallery
Results
```

Admin should be able to enable/disable modules.

---

# 18. IPL Registration Flow

This is extremely important.

Registration must NOT be a simple form.

Flow:

```text
Registration Landing
        ↓
Rules & Regulations
        ↓
Accept Terms
        ↓
Google Sign-In
        ↓
Team Registration Form
        ↓
Payment
        ↓
Payment Screenshot Upload
        ↓
Submit
        ↓
Pending Verification
        ↓
Admin Review
        ↓
Approved / Rejected
        ↓
Approved
        ↓
Generate Team Pass
        ↓
Generate PDF
        ↓
Send Email
```

---

# 19. Registration Landing Page

Before registration starts, display:

### Bengali rules

and

### English rules

depending on selected language.

Admin must be able to edit these rules.

Do not hard-code them.

Example:

```text
ইস্বামপুর প্রিমিয়ার লীগে অংশগ্রহণের পূর্বে সকল নিয়ম ও শর্ত মনোযোগ সহকারে পড়ুন।
```

At bottom:

```text
☐ আমি উপরোক্ত নিয়ম ও শর্তাবলী পড়েছি এবং সম্মত।

[Proceed to Registration]
```

The Proceed button remains disabled until checkbox is checked.

Store acceptance:

```text
termsAccepted: true
termsAcceptedAt
termsVersion
```

This is useful for future disputes.

---

# 20. Google Sign-In

After accepting rules:

```text
Continue with Google
```

The system authenticates the team representative.

Store:

```text
userId
googleEmail
displayName
photoURL
createdAt
lastLoginAt
```

One authenticated Google account should be trackable.

---

# 21. Team Registration Form

After successful authentication:

### Team Information

```text
Team Name *
Team Address *
Team Representative Name *
Valid Email *
Valid Phone *
Emergency Contact Number *
```

### Team Members

Admin should configure the number of players.

For example:

```text
Minimum Players: 11
Maximum Players: 15
```

These values must NOT be hard-coded.

Admin should be able to change them for every IPL season.

Form dynamically generates:

```text
Player 1 Name
Player 2 Name
...
Player N Name
```

Optional fields can include:

```text
Captain
Vice Captain
Player Phone
Player ID
```

depending on admin configuration.

---

# 22. Dynamic Registration Form Builder

This is one of the most important improvements.

Instead of hard-coding the registration form, create a **Registration Form Builder** inside Admin Panel.

Admin can create fields:

```text
Field Label Bengali
Field Label English
Field Type
Required
Placeholder Bengali
Placeholder English
Validation
Minimum Length
Maximum Length
Options
Display Order
```

Supported field types:

```text
Text
Email
Phone
Number
Textarea
Dropdown
Radio
Checkbox
Date
File Upload
```

Example:

```text
Field: Team Name
Type: Text
Required: Yes
```

This means future events can use the same registration engine.

So later:

```text
Blood Donation Camp
Football Tournament
Cultural Program
Quiz Competition
```

can have completely different forms.

---

# 23. Registration ID

Every registration must have a secure unique ID.

Do NOT use predictable IDs such as:

```text
TEAM001
TEAM002
TEAM003
```

Use a UUID / cryptographically secure random ID.

Example:

```text
reg_7f9c2e91-....
```

Public-facing pass numbers can also use a random human-readable identifier.

Example:

```text
ISW-IPL26-X7K9P2
```

Never expose Firestore document IDs unnecessarily.

---

# 24. Payment System

Admin should configure payment details from the dashboard.

Fields:

```text
Payment Amount
UPI ID
Payment Name
QR Code
Payment Instructions Bengali
Payment Instructions English
Payment Deadline
```

QR code should be uploaded to Cloudinary.

Registration page shows:

```text
Registration Fee: ₹XXXX

Scan QR Code

[Upload Payment Screenshot]
```

---

# 25. Payment Screenshot

Allowed file types:

```text
JPG
JPEG
PNG
WEBP
```

Maximum size configurable by admin.

Upload to Cloudinary.

Store:

```text
paymentScreenshotUrl
paymentScreenshotPublicId
uploadedAt
```

Do not trust the frontend filename.

Generate secure unique Cloudinary public IDs.

---

# 26. Registration Submission

After payment screenshot upload:

Show final review:

```text
Team Details
Player Details
Contact Details
Payment Details
```

Then:

```text
[Submit Registration]
```

Before submission, validate everything again server-side.

After successful submission:

```text
Registration submitted successfully.

Your registration is currently under verification.

Our team will review your payment and submitted information.

You will receive an email after verification.
```

Status:

```text
PENDING_REVIEW
```

---

# 27. Admin Notification

When registration is submitted:

Automatically send an email to the **admin assigned to IPL registration verification**.

Do NOT hard-code that admin email.

Super Admin should be able to select:

```text
IPL Registration Reviewer
```

from Admin Panel.

If there are multiple reviewers, allow multiple recipients.

---

# 28. Registration Review Panel

Admin sees:

```text
Registration ID
Team Name
Representative
Email
Phone
Submitted Date
Payment Status
Registration Status
```

Clicking a registration opens complete details.

Admin can see:

* Team information
* Players
* Contact information
* Payment screenshot
* Terms acceptance
* Submission timestamp
* Google account
* Registration history

---

# 29. Admin Review Actions

Admin can:

### Approve

### Reject

### Request Correction

### Put On Hold

For rejection/correction, admin MUST provide a reason.

Example:

```text
Payment screenshot is not readable.
```

The applicant receives an email.

---

# 30. Approval Workflow

When approved:

```text
status = APPROVED
```

System automatically:

1. Generate unique team pass
2. Generate PDF
3. Store PDF reference
4. Send approval email
5. Add team to approved teams list
6. Generate verification QR
7. Make pass verifiable online

---

# 31. Approval Email

Email should look professional.

Example concept:

> Congratulations! Your team has successfully been registered for the Iswampur Premier League 2026.

Include:

```text
Team Name
Registration ID
Pass ID
Event Name
Event Date
Venue
Important Instructions
PDF Pass Download
Online Verification Link
```

The exact Bengali/English email templates should also be editable from Admin Panel.

---

# 32. Team Pass

Generate a professional printable pass.

Include:

```text
Iswampur Logo

Iswampur Premier League 2026

TEAM PASS

Team Name
Team Address
Team Representative

Registration ID
Pass ID

Event Date
Venue

QR Code
```

QR code should point to:

```text
/verify/<secure-pass-token>
```

---

# 33. Pass Verification

Create public page:

```text
/verify-pass
```

Anyone can scan the QR code.

Show:

```text
✓ VERIFIED

Iswampur Premier League 2026

Team:
ABC Warriors

Registration:
XXXX

Status:
Approved

Valid for:
IPL 2026
```

Do NOT expose unnecessary personal information.

For example, don't publicly expose:

* phone number
* email
* full player details

unless specifically required.

---

# 34. PDF Pass

Generate PDF server-side.

PDF should be printable on:

```text
A4
```

and optionally contain a compact team-pass section.

Store PDF reference.

Email the PDF/download link to the team.

Admin can regenerate the PDF if necessary.

---

# 35. Registration Statuses

Use a proper state machine.

```text
DRAFT
SUBMITTED
PENDING_REVIEW
UNDER_REVIEW
CORRECTION_REQUIRED
RESUBMITTED
APPROVED
REJECTED
CANCELLED
```

Do not allow arbitrary status changes without checking valid transitions.

---

# 36. Registration History

Every important action should be logged.

Example:

```json
{
  "action": "APPROVED",
  "performedBy": "admin_uid",
  "performedAt": "...",
  "note": "Payment verified"
}
```

This creates an audit trail.

---

# 37. Admin System

There should NOT be only one admin.

There can be multiple admins.

But each admin has permissions.

Example administrators:

### Registration Admin

Can:

* View registrations
* Review payments
* Approve/reject registrations
* Send approval
* Generate passes

Cannot:

* Change website settings
* Manage admins
* Delete events

---

### Event Admin

Can:

* Create events
* Edit events
* Delete events
* Upload gallery
* Manage captions
* Publish announcements

Cannot manage users/admins.

---

### Content Admin

Can:

* Edit homepage
* Edit about section
* Edit notices
* Manage bilingual content

---

### Gallery Admin

Can:

* Upload photos
* Edit captions
* Delete photos

---

### IPL Admin

Can:

* Manage IPL
* Rules
* Teams
* Registrations
* IPL gallery
* Results

---

# 38. Permission System

Do NOT simply use:

```text
role = admin
```

Use granular permissions.

Example:

```text
events.create
events.read
events.update
events.delete

gallery.create
gallery.read
gallery.update
gallery.delete

registrations.read
registrations.review
registrations.approve
registrations.reject

posts.create
posts.update
posts.delete

ipl.manage

settings.manage

admins.manage
```

This gives Super Admin complete flexibility.

---

# 39. Super Admin

Initial Super Admin:

```text
skahidulla568@gmail.com
```

Initial admin:

```text
jonsknabab@gmail.com
```

Important:

**Do not rely only on email string in frontend code.**

Super Admin should exist as a database record.

Example:

```text
users
admins
roles
permissions
```

The initial Super Admin can be seeded securely through a server-side setup script/environment configuration.

---

# 40. Super Admin Capabilities

Super Admin has complete control.

Can:

* Create admin
* Remove admin
* Suspend admin
* Activate admin
* Assign roles
* Create custom roles
* Assign permissions
* Remove permissions
* Change registration reviewer
* Manage events
* Manage IPL
* Manage payment settings
* Manage homepage
* Manage navbar
* Manage footer
* Manage announcements
* Manage gallery
* Manage email templates
* Manage registration forms
* Manage rules
* Manage translations
* Manage site settings
* View audit logs

---

# 41. Custom Role Builder

This is better than fixed roles.

Super Admin should be able to create:

```text
Role Name:
IPL Payment Reviewer
```

and select:

```text
✓ View Registrations
✓ View Payment Screenshots
✓ Approve Registration
✓ Reject Registration

✗ Manage Events
✗ Manage Admins
✗ Manage Website Settings
```

Then assign that role to one or more admins.

---

# 42. Admin Assignment Per Event

Super Admin should optionally assign admins to specific events.

Example:

```text
IPL 2026

Registration Manager:
Admin A

Gallery Manager:
Admin B

Content Manager:
Admin C
```

This prevents every admin from seeing/managing everything.

---

# 43. Admin Dashboard

Dashboard should display useful statistics.

For example:

```text
Total Events
Upcoming Events
Published Posts
Total Gallery Images

IPL Registrations
Pending Reviews
Approved Teams
Rejected Teams
Payment Verification Pending
```

For IPL:

```text
Total Registered
Pending
Under Review
Correction Required
Approved
Rejected
```

Use charts where useful.

---

# 44. Audit Logs

Every sensitive admin action should be logged.

Examples:

```text
Admin created event
Admin edited event
Admin deleted image
Admin approved team
Admin rejected team
Admin changed payment amount
Admin changed registration form
Admin changed permissions
```

Store:

```text
actorId
action
targetType
targetId
timestamp
metadata
```

Audit logs should be visible to Super Admin.

Normal admins should not be able to delete audit logs.

---

# 45. Security

This is very important.

Never trust frontend permissions.

Frontend:

```text
Hide unauthorized buttons
```

BUT backend must ALSO check:

```text
Does this authenticated user have permission?
```

Every sensitive API endpoint must perform server-side authorization.

Examples:

```text
POST /api/events
PUT /api/events/:id
DELETE /api/events/:id

POST /api/registrations/:id/approve

POST /api/admins
PUT /api/admins/:id/permissions
```

must all check authorization.

---

# 46. Firestore Security

Design Firestore rules carefully.

Public users can read only publicly published content.

Example:

```text
Published events → public read
Published posts → public read
Approved teams → limited public read
Registrations → authenticated owner/admin only
Payment screenshots → authorized admin only
Admin records → authorized users only
Audit logs → Super Admin only
```

Do NOT make entire Firestore database publicly readable.

---

# 47. Suggested Firestore Collections

Use a structure similar to:

```text
users
admins
roles
permissions
auditLogs

events
eventCategories
eventGallery

posts
announcements

siteSettings
navigation
footer

iplSeasons
iplRules
iplTeams
iplRegistrations
iplPayments
iplPasses

registrationForms
registrationSubmissions

emailTemplates

notifications
```

Can be adjusted if a better normalized structure is required.

---

# 48. IPL Season System

Do NOT hard-code “IPL 2026”.

Create:

```text
iplSeasons
```

Example:

```text
IPL 2026
IPL 2027
IPL 2028
```

Each season can have:

```text
name_bn
name_en
year
registrationOpen
registrationClose
eventDate
venue
registrationFee
paymentQR
rules
status
```

This means next year the admin can simply create:

**IPL 2027**

without changing code.

---

# 49. Team Database

Each season should have separate teams.

Example:

```text
IPL 2026
    ├── Team A
    ├── Team B
    └── Team C

IPL 2027
    ├── Team X
    └── Team Y
```

Previous-year data should remain available.

---

# 50. IPL Teams Public Page

Only approved teams should appear publicly.

Card:

```text
Team Logo
Team Name
Registration Status
Season
```

Optionally:

```text
Captain
Players
```

depending on privacy requirements.

Admin controls what information is public.

---

# 51. Content Management System

Almost everything visible on the public website should be editable.

Admin should be able to manage:

```text
Logo
Hero title
Hero description
Hero image
CTA text
About content
Contact information
Footer
Social links
Navbar labels
Event content
Post content
Gallery captions
IPL rules
Registration instructions
Payment instructions
Email templates
```

---

# 52. Homepage Section Builder

For maximum flexibility, consider a section-based homepage CMS.

Example:

```text
Hero
↓
Featured Event
↓
Upcoming Events
↓
Recent Events
↓
IPL Banner
↓
Gallery
↓
Announcements
↓
About Iswampur
↓
Contact
```

Super Admin can:

* Enable/disable section
* Reorder section
* Change title
* Change language
* Configure content

This prevents redesigning the website every time.

---

# 53. SEO

Each event should have:

```text
slug
metaTitle_bn
metaTitle_en
metaDescription_bn
metaDescription_en
ogImage
```

Use SEO-friendly URLs.

Example:

```text
/events/iswampur-premier-league-2026
```

instead of:

```text
/events/12345
```

But internally still use secure random IDs.

---

# 54. Responsive Design

Must work beautifully on:

* Android phones
* iPhone
* Tablets
* Laptops
* Desktop

Priority:

**Mobile first.**

Since most villagers/users will probably access from mobile.

---

# 55. Visual Design Direction

Do NOT make it look like a generic government website.

Design should feel:

**Modern + Premium + Community + Cultural**

Use:

* Large typography
* Beautiful photography
* Smooth cards
* Subtle gradients
* Glass effects where appropriate
* Clean spacing
* Elegant animations
* Good dark mode

But avoid excessive animations.

The website should feel trustworthy and professional.

---

# 56. IPL Visual Identity

IPL section can have a slightly more energetic sports-oriented design.

For example:

```text
ISWAMPUR
PREMIER LEAGUE

2026
```

with:

* cricket imagery
* scoreboard-inspired UI
* team cards
* registration CTA
* countdown

But it must still feel part of the main Iswampur website.

---

# 57. Registration Countdown

When registration is open:

```text
Registration closes in

05 Days
12 Hours
24 Minutes
```

This should be automatically calculated from the configured registration deadline.

When closed:

```text
Registration Closed
```

---

# 58. Event Countdown

For upcoming events:

```text
Event starts in:
XX Days
XX Hours
```

Optional and controlled by admin.

---

# 59. Notifications

Create a notification system for important actions.

For example:

### Team

```text
Registration submitted
Payment under review
Correction required
Registration approved
Registration rejected
```

### Admin

```text
New registration received
Correction submitted
```

Email should be the primary notification mechanism.

An internal dashboard notification system can also be added.

---

# 60. Email Templates

Do NOT hard-code email content.

Create:

```text
emailTemplates
```

Templates:

```text
registrationSubmitted
registrationReceived
correctionRequired
registrationApproved
registrationRejected
passGenerated
```

Each should support:

```text
subject_bn
subject_en
body_bn
body_en
```

Use variables:

```text
{{teamName}}
{{registrationId}}
{{passId}}
{{eventName}}
{{eventDate}}
{{venue}}
{{verificationUrl}}
```

Admin can edit templates.

---

# 61. Form Validation

Validation must happen in:

### Frontend

for good UX.

AND

### Backend

for security.

Validate:

* Required fields
* Email
* Phone
* Emergency number
* Team name
* Player count
* File type
* File size
* Duplicate registration
* Payment screenshot
* Terms acceptance

---

# 62. Duplicate Registration Protection

A Google account should not be able to accidentally submit unlimited registrations for the same team/season.

Implement configurable rules.

For example:

```text
One Google account → one active registration per IPL season
```

But Super Admin should be able to override/cancel if needed.

Also detect:

* same team name
* same phone
* same email

and warn admins about possible duplicates.

---

# 63. Registration Draft

If the user closes the page before submitting, optionally preserve the registration as:

```text
DRAFT
```

When they return and sign in again, they can continue.

This will make the registration experience much better.

---

# 64. Admin Search & Filters

Admin registration dashboard should have:

Search:

```text
Team Name
Registration ID
Email
Phone
Pass ID
```

Filters:

```text
Season
Status
Payment Status
Submission Date
```

Sorting:

```text
Newest
Oldest
Team Name
Status
```

---

# 65. Export

Authorized admin should be able to export registrations.

Formats:

```text
CSV
Excel
PDF
```

But export access should be permission-controlled because registration contains personal information.

---

# 66. Privacy

Do not publicly display:

* Email
* Phone
* Emergency contact
* Payment screenshot
* Google account details

unless explicitly required.

Public team page should contain only information intentionally made public by admin.

---

# 67. Error Handling

Create proper error states.

Examples:

```text
Something went wrong.
Please try again.

Registration session expired.

Payment screenshot upload failed.

You do not have permission to perform this action.

Registration is currently closed.
```

Never show raw backend errors to users.

---

# 68. Loading States

Use:

* Skeleton loaders
* Button loading states
* Upload progress
* Form submission progress

Do not leave blank screens while data loads.

---

# 69. Empty States

Example:

```text
কোনো নতুন অনুষ্ঠান পাওয়া যায়নি।
```

and English equivalent.

For gallery:

```text
এই অনুষ্ঠানের কোনো ছবি এখনো যোগ করা হয়নি।
```

---

# 70. Admin Preview

Before publishing content, admin should optionally be able to preview:

```text
Bengali
English
```

This is especially useful for event pages and announcements.

---

# 71. Draft / Publish System

Content should support:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Admin can prepare an event without immediately publishing it.

---

# 72. Scheduled Publishing

Optional but highly useful.

Admin can set:

```text
Publish At
```

Then the system automatically publishes the post/event at that time.

---

# 73. Soft Delete

Do not permanently delete important records immediately.

For events/posts:

```text
deletedAt
deletedBy
```

Use soft deletion where appropriate.

Super Admin can permanently delete if necessary.

---

# 74. Backup / Data Safety

Important Firestore data should be designed so that accidental deletion does not destroy historical records.

Especially:

```text
IPL registrations
Payment records
Approval history
Audit logs
```

should never be casually deleted.

---

# 75. Admin Activity

Super Admin dashboard should show:

```text
Recent Admin Activities
```

Example:

```text
Admin A approved Team Warriors
Admin B created Independence Day event
Admin C uploaded 12 photos
```

---

# 76. Contact System

Public contact form:

```text
Name
Email
Phone (optional)
Message
```

Store in Firestore.

Admin can:

* View
* Mark read
* Archive
* Delete

Optional email notification to designated admin.

---

# 77. About Iswampur

Editable CMS page.

Include:

* About village
* History
* Community
* Important places
* Photos

Both Bengali and English.

No content should be hard-coded.

---

# 78. Navigation Management

Super Admin should be able to configure navigation.

Example:

```text
Home
Events
IPL
Gallery
About
Contact
```

Admin can:

* Change label Bengali
* Change label English
* Change order
* Enable/disable item
* Set URL

---

# 79. Footer Management

Editable:

```text
About text
Contact
Quick links
Social links
Copyright
```

Both languages.

---

# 80. Database Data Structure Example

A registration could conceptually look like:

```json
{
  "id": "reg_random_secure_id",
  "seasonId": "season_random_id",
  "eventId": "event_random_id",

  "userId": "firebase_uid",

  "team": {
    "name": "Example Warriors",
    "address": "Iswampur",
    "representativeName": "Example"
  },

  "contact": {
    "email": "example@gmail.com",
    "phone": "XXXXXXXXXX",
    "emergencyPhone": "XXXXXXXXXX"
  },

  "players": [
    {
      "name": "Player 1"
    },
    {
      "name": "Player 2"
    }
  ],

  "payment": {
    "amount": 1000,
    "screenshotUrl": "...",
    "screenshotPublicId": "...",
    "status": "PENDING"
  },

  "terms": {
    "accepted": true,
    "acceptedAt": "...",
    "version": "2026-v1"
  },

  "status": "PENDING_REVIEW",

  "createdAt": "...",
  "updatedAt": "..."
}
```

Keep actual schema normalized where appropriate rather than blindly copying this structure.

---

# 81. Unique ID Requirements

All important entities must use secure random identifiers:

```text
eventId
registrationId
teamId
passId
postId
galleryId
adminId
auditLogId
```

Never create IDs based only on:

```text
1
2
3
4
```

or timestamps alone.

Use UUID / Firebase auto-ID / cryptographically secure random IDs.

---

# 82. Important Security Rule

Never expose sensitive Cloudinary operations directly with permanent secrets.

Never put:

```text
CLOUDINARY_API_SECRET
SMTP_PASSWORD
FIREBASE_ADMIN_PRIVATE_KEY
```

in frontend `.env`.

Frontend `.env` must contain only genuinely public configuration.

---

# 83. Recommended API Structure

Example:

```text
/api/auth
/api/events
/api/events/:id
/api/gallery
/api/posts
/api/contact

/api/ipl/seasons
/api/ipl/registrations
/api/ipl/registrations/:id
/api/ipl/registrations/:id/approve
/api/ipl/registrations/:id/reject
/api/ipl/registrations/:id/correction

/api/passes
/api/passes/:id/verify

/api/admins
/api/roles
/api/permissions

/api/email
/api/upload
```

Every protected API should perform authorization.

---

# 84. Admin UI Structure

Admin sidebar:

```text
Dashboard

Content
 ├── Homepage
 ├── Events
 ├── Posts
 ├── Gallery
 ├── Pages
 └── Navigation

IPL
 ├── Seasons
 ├── Registration Form
 ├── Rules
 ├── Registrations
 ├── Teams
 ├── Payments
 ├── Passes
 └── Results

Communication
 ├── Email Templates
 └── Notifications

Users
 ├── Admins
 ├── Roles
 └── Permissions

System
 ├── Settings
 ├── Audit Logs
 └── Activity
```

Only show menu items that the logged-in admin has permission to access.

---

# 85. Super Admin UI

Super Admin gets everything plus:

```text
System Overview

Admin Management
Role Management
Permission Management

Event Assignment

Registration Reviewer Assignment

System Settings

Email Settings
Payment Settings

Audit Logs

Database / Data Management
```

---

# 86. Very Important: Admin Permission UI

Super Admin should see something like:

```text
Admin: John

Role:
IPL Registration Manager

Permissions:

[✓] View registrations
[✓] Review payments
[✓] Approve registrations
[✓] Reject registrations

[ ] Manage events
[ ] Manage gallery
[ ] Manage admins
[ ] Manage system settings
```

And changes should take effect without redeploying the application.

---

# 87. Registration Reviewer Assignment

In Super Admin settings:

```text
IPL Registration Reviewer

Primary:
[ Select Admin ]

Secondary:
[ Select Admin ]

Backup:
[ Select Admin ]
```

When a new registration arrives, notify the selected admin(s).

This is much better than hard-coding:

```text
jonsknabab@gmail.com
```

---

# 88. Initial Configuration

Seed:

### Super Admin

```text
skahidulla568@gmail.com
```

### Initial Admin

```text
jonsknabab@gmail.com
```

Initial admin should NOT automatically receive Super Admin permissions.

Super Admin decides what access they receive.

---

# 89. Future Expandability

Architecture should make it easy to add future modules:

```text
Football Tournament
Badminton
Blood Donation
Cultural Festival
Education Program
Village Committee
Emergency Notices
Lost & Found
Volunteer Registration
```

without rewriting the application.

---

# 90. Most Important Architectural Principle

Think of the platform as:

```text
ISWAMPUR
│
├── Content Management
│
├── Events
│
├── Gallery
│
├── Announcements
│
├── Community
│
└── Event Registration Engine
        │
        └── IPL
             │
             ├── Seasons
             ├── Teams
             ├── Registration
             ├── Payment
             ├── Verification
             └── Passes
```

**IPL should be a module, not the entire architecture.**

This will save a huge amount of development work later.

---

# 91. Development Order

Do NOT try to build everything simultaneously.

Recommended order:

### Phase 1 — Foundation

* React/Vite
* Tailwind
* Routing
* Theme
* Bengali/English system
* Firebase
* Authentication
* Base design system

### Phase 2 — Public Website

* Home
* Events
* Event details
* Gallery
* Posts
* About
* Contact

### Phase 3 — CMS/Admin

* Admin authentication
* Permissions
* Events CRUD
* Gallery
* Posts
* Homepage CMS
* Bilingual content

### Phase 4 — Super Admin

* Admin management
* Roles
* Permissions
* Audit logs
* Assignments

### Phase 5 — IPL

* Season management
* Rules
* Registration form builder
* Google authentication
* Registration
* Payment
* Screenshot upload

### Phase 6 — Verification

* Admin review
* Approval/rejection
* Email
* Pass generation
* QR verification
* PDF

### Phase 7 — Polish

* SEO
* Mobile optimization
* Loading states
* Error handling
* Security audit
* Performance optimization

---

# 92. Final Acceptance Criteria

The project should NOT be considered complete until all of these work:

### Public

* [ ] Bengali is default
* [ ] English switch works
* [ ] Dark/light mode works
* [ ] Homepage is dynamic
* [ ] Events are dynamic
* [ ] Gallery is dynamic
* [ ] Posts are dynamic
* [ ] IPL section works
* [ ] Mobile responsive

### Admin

* [ ] Google login
* [ ] Permission-based access
* [ ] Event CRUD
* [ ] Gallery management
* [ ] Post management
* [ ] Bilingual content
* [ ] IPL management
* [ ] Registration management

### Super Admin

* [ ] Admin management
* [ ] Role management
* [ ] Permission management
* [ ] Reviewer assignment
* [ ] Audit logs
* [ ] Global settings

### IPL Registration

* [ ] Rules
* [ ] Terms acceptance
* [ ] Google sign-in
* [ ] Dynamic form
* [ ] Player management
* [ ] Payment QR
* [ ] Screenshot upload
* [ ] Submission
* [ ] Admin notification
* [ ] Review
* [ ] Approval
* [ ] Rejection
* [ ] Correction
* [ ] Email
* [ ] Unique registration ID
* [ ] Unique pass ID
* [ ] PDF
* [ ] QR verification

---

## একটা জিনিস আমি বিশেষভাবে যোগ করব

তোর original idea-তে **“registration form generate করা”** কথাটা ছিল, কিন্তু আমি এটাকে আরও এক ধাপ এগিয়ে **Dynamic Registration Form Builder** করেছি।

মানে ভবিষ্যতে যদি IPL-এর বদলে কোনোদিন:

> “ইস্বামপুর ফুটবল টুর্নামেন্ট”

হয়, তাহলে developer-কে আবার form বানাতে হবে না।

Super Admin শুধু Admin Panel-এ গিয়ে করবে:

```text
Create Event
       ↓
Enable Registration
       ↓
Create Form
       ↓
Add Field
   Team Name
   Captain Name
   Phone
   Players
   Address
   ...
       ↓
Publish
```

একই registration engine নতুন event-এর জন্য কাজ করবে।

আর **সবচেয়ে গুরুত্বপূর্ণ**, তোর “admin থেকে সব editable” requirement-টা পূরণ করার জন্য আমি শুধু Event CRUD রাখিনি—**homepage CMS + bilingual CMS + registration form builder + email template system + permission system + season system** রেখেছি। এতে ২০২৬-এর IPL শেষ হয়ে গেলেও website-টা অকেজো হবে না।

