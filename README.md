# 🌾 Iswampur Digital Platform & IPL Tournament Management System
> **ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম ও প্রিমিয়ার লীগ (IPL)**

A production-ready, full-stack, bilingual (Bengali default / English toggle) web application and community CMS for **Iswampur**, featuring the annual **Iswampur Premier League (IPL)** cricket tournament management system, dynamic event registration engine, administrative RBAC, cryptographically signed team passes, and real-time QR verification.

---

## 🚀 Key Features

### 1. 🌐 Public Experience & CMS
- **Bilingual by Default (Bengali / English):** Bengali (`bn`) is the default language across all screens, forms, notifications, and navigation. Instant toggle to English (`en`) without page reload.
- **Dark & Light Mode:** System-detected with persistent local storage and zero-flash initialization.
- **Dynamic Homepage & Sections:** Hero carousel with latest featured notice, upcoming & past events grid, IPL promo banner with live countdown, village photo gallery preview, and about section.
- **Dedicated IPL Tournament Hub (`/ipl`):** Tournament overview, season rules & guidelines (`/ipl/rules`), verified team squads showcase (`/ipl/teams`), and quick pass verification.
- **Events & Lightbox Gallery:** Categorized event archives with bilingual details, start/end dates, location, and interactive full-resolution gallery lightbox.
- **Notice Board / Announcements:** Village announcements, administrative notices, and news feed.

### 2. 🏏 End-to-End IPL Team Registration Flow (`/register/[slug]`)
1. **Gatekeeper:** Validates deadline and max team caps.
2. **Rules Acceptance:** Enforces timestamped terms & conditions acceptance before continuing.
3. **Google Sign-In:** Authenticates team representative via Google (one active team per Google account per season).
4. **Dynamic Squad Builder:** Configurable min/max player roster rows with captaincy, team contact info, and emergency numbers.
5. **Payment Verification:** Displays admin-configured UPI payment QR code, amount, and handles secure payment screenshot upload.
6. **Submission & Tracking:** Generates a secure, non-sequential registration ID (`reg_*`). Real-time tracking portal at `/my-registration` with status badges (*Pending Review*, *Approved*, *Needs Correction*, *Rejected*).

### 3. 🛡️ Cryptographically Secure Team Passes & Verification
- **Unique Random Pass Code:** Format `ISW-IPL26-XXXX` + cryptographic `passId`.
- **HMAC-SHA256 Digital Signature:** Tamper-proof verification using a private server signing secret.
- **Server-Side PDF Pass Generation:** Instant printable PDF pass with team roster, venue details, and embedded QR code.
- **Public & Matchday Scanner Verification (`/verify/[passId]`):** Scans the QR code to verify validity on the ground without leaking private phone numbers or personal emails.
- **Ground Matchday Check-in Tool (`/admin/checkin`):** Volunteer/admin interface for scanning or entering codes to check in teams on match day.

### 4. 👑 RBAC Admin & Super Admin System
- **Super Admin (`skahidulla568@gmail.com`):** Complete system authority, assignable permissions matrix (checkbox grid of Admins × Granular Permissions), and reviewer notification routing.
- **Initial Admin:** Pre-seeded for `jonsknabab@gmail.com` with granular scope.
- **Reviewer Routing:** Super admin designates which admin receives registration review emails.
- **Admin Review Desk (`/admin/registrations`):** Zoomable payment screenshot modal, approve / reject / correction actions with audit logging, and CSV export.
- **Dynamic Registration Form Builder (`/admin/form-builder`):** Construct custom registration forms for future events (e.g., Football, Blood Donation, Cultural Programs).
- **Site Content Manager (`/admin/content`):** Real-time editor for village name, logo, contact, footer, rules, and payment QR settings.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server Actions, TypeScript)
- **Styling:** Tailwind CSS with CSS custom variables for theming
- **Database:** Firebase Firestore (with pre-seeded fallback for instant local execution)
- **Authentication:** Firebase Authentication (Google Sign-In only)
- **Media Uploads:** Cloudinary (server-signed uploads)
- **Email Service:** Nodemailer (Bilingual HTML email templates)
- **PDF & QR Code:** `pdf-lib` + `qrcode`
- **Validation:** Zod schemas on client and server routes

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
# Clone or navigate to the repository
cd iswampur

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your service credentials:
```env
# Public Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase Admin SDK (Server-Side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
MAIL_FROM="Iswampur Village <noreply@iswampur.org>"

# Super Admin & Security
SUPER_ADMIN_EMAIL=skahidulla568@gmail.com
PASS_SIGNING_SECRET=iswampur_crypto_secret_production_key_2026
```

> **Note on Zero-Config Fallback:** The application includes a pre-seeded storage repository in `src/lib/db/repository.ts`. You can run and test the complete public and admin interface out of the box even before connecting live Cloud credentials!

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Test
```bash
npm run build
npm run start
```

---

## 🚀 Deployment to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Set the Environment Variables under **Project Settings > Environment Variables** using the keys from `.env.example`.
4. Deploy! The project uses native Next.js App Router optimizations and deploys seamlessly to `iswampur.vercel.app`.

---

## 📁 Project Architecture

```
iswampur/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing page, about, contact, events, gallery, announcements
│   │   ├── ipl/               # Dedicated IPL hub, tournament rules, verified teams showcase
│   │   ├── register/[slug]/   # 5-step interactive team registration wizard
│   │   ├── my-registration/   # Team status tracker & PDF pass downloader
│   │   ├── verify/[passId]/   # Public QR verification screen
│   │   ├── admin/             # Dashboard, events CRUD, posts CRUD, registrations desk, check-in
│   │   ├── super-admin/       # Admin RBAC matrix, reviewer routing, security audit logs
│   │   └── api/               # REST API endpoints (Events, Registrations, Passes, Uploads, Check-in)
│   ├── components/            # Reusable UI, Layout (Navbar, Footer), & Modular Sections
│   ├── lib/
│   │   ├── auth/              # Client & Server authentication contexts
│   │   ├── db/                # Firestore + in-memory seeded fallback repository
│   │   ├── firebase/          # Client & Admin Firebase initialization
│   │   ├── i18n/              # Bengali/English localization engine
│   │   ├── mailer/            # Bilingual HTML email service
│   │   ├── pass/              # HMAC-SHA256 signature generator & PDF pass builder
│   │   └── theme/             # Light/Dark mode state management
│   ├── messages/              # Bengali (`bn.ts`) and English (`en.ts`) dictionaries
│   └── types/                 # Complete TypeScript data model definitions
├── DECISIONS.md               # Architectural tradeoffs and design decisions log
└── README.md                  # Project documentation
```

---

## 📄 License
Created for **Iswampur Village Committee & Sports Association**. All rights reserved.
