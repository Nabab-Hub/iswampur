import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/themeContext';
import { AuthProvider } from '@/lib/auth/authContext';

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://iswampur.vercel.app';

export const viewport: Viewport = {
  themeColor: '#08143A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম & IPL 2026 | Iswampur Premier League',
    template: '%s | ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম',
  },
  description:
    'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান, মেলা, সাংস্কৃতিক উৎসব ও বার্ষিক ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) ক্রিকেট টুর্নামেন্টের অফিসিয়াল ডিজিটাল পোর্টাল। অনলাইন টিম রেজিস্ট্রেশন, লাইভ রুলস ও ডিজিটাল কিউআর টিম পাস।',
  keywords: [
    'ঈশ্বমপুর',
    'ঈশ্বমপুর গ্রাম',
    'ঈশ্বমপুর প্রিমিয়ার লীগ',
    'আইপিএল ২০২৬',
    'IPL 2026',
    'Iswampur',
    'Iswampur Premier League',
    'Iswampur Cricket Tournament',
    'Village Digital Platform',
    'Sports Portal',
    'Team Registration',
    'QR Team Pass',
    'West Bengal Village Sports',
  ],
  authors: [{ name: 'Iswampur Digital Committee & Sports Council', url: siteUrl }],
  creator: 'Iswampur Village Committee',
  publisher: 'Iswampur Village Digital Platform',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম & IPL 2026',
    description:
      'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান, উৎসব ও বার্ষিক ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) এর অফিসিয়াল অনলাইন পোর্টাল। লাইভ টিম রেজিস্ট্রেশন ও ডিজিটাল কিউআর পাস।',
    url: siteUrl,
    siteName: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম',
    locale: 'bn_IN',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        secureUrl: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Iswampur Premier League 2026 & Village Digital Platform',
      },
      {
        url: '/og-image.png',
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Iswampur Premier League 2026 HD Banner',
      },
      {
        url: '/og-image-square.jpg',
        secureUrl: `${siteUrl}/og-image-square.jpg`,
        width: 600,
        height: 600,
        type: 'image/jpeg',
        alt: 'Iswampur Digital Platform Square Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম & IPL 2026',
    description:
      'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান ও বার্ষিক ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) ক্রিকেট টুর্নামেন্টের অনলাইন রেজিস্ট্রেশন পোর্টাল।',
    images: [`${siteUrl}/og-image.jpg`],
    creator: '@IswampurSports',
    site: '@IswampurSports',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ঈশ্বমপুর',
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'theme-color': '#08143A',
    'msapplication-TileColor': '#08143A',
    'msapplication-TileImage': '/icon-192.png',
    'apple-mobile-web-app-title': 'ঈশ্বমপুর',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম',
      alternateName: 'Iswampur Village & Sports Digital Platform',
      description: 'Official village platform and Iswampur Premier League online portal.',
      inLanguage: 'bn-IN',
    },
    {
      '@type': 'SportsOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Iswampur Premier League Committee',
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      sameAs: [],
    },
    {
      '@type': 'SportsEvent',
      '@id': `${siteUrl}/#tournament`,
      name: 'Iswampur Premier League 2026 (10th Edition)',
      startDate: '2026-12-20T09:00:00+05:30',
      endDate: '2026-12-25T18:00:00+05:30',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Iswampur Central Sports Ground',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Iswampur',
          addressRegion: 'West Bengal',
          addressCountry: 'IN',
        },
      },
      image: [`${siteUrl}/og-image.jpg`],
      description:
        '10th Annual Iswampur Premier League Cricket Tournament with online registration and QR passes.',
      organizer: {
        '@type': 'Organization',
        name: 'Iswampur Sports Council',
        url: siteUrl,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className={`dark ${hindSiliguri.variable} ${inter.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ঈশ্বমপুর" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#F26522] selection:text-white bg-[#050d24] text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
