import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম | Iswampur Village Events & IPL',
  description:
    'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান, মেলা, সাংস্কৃতিক উৎসব ও বার্ষিক ঈশ্বমপুর প্রিমিয়ার লীগ (IPL) এর অফিসিয়াল অনলাইন পোর্টাল।',
  keywords: [
    'Iswampur',
    'Iswampur Premier League',
    'IPL 2026',
    'ঈশ্বমপুর',
    'ঈশ্বমপুর প্রিমিয়ার লীগ',
    'Village Events',
    'Cricket Tournament',
  ],
  authors: [{ name: 'Iswampur Digital Committee' }],
  openGraph: {
    title: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম | Iswampur Village Platform',
    description: 'অনুষ্ঠান, উৎসব ও ঈশ্বমপুর প্রিমিয়ার লীগ অনলাইন দল নিবন্ধন পোর্টাল।',
    type: 'website',
    locale: 'bn_IN',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className={`dark ${hindSiliguri.variable} ${inter.variable}`}>
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
