import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'অনলাইন টিম রেজিস্ট্রেশন | Online Team Registration IPL 2026',
  description:
    'ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) এ আপনার ক্রিকেট টিম নিবন্ধন করুন। ডিজিটাল স্কোয়াড এন্ট্রি, সুরক্ষিত যাচাইকরণ ও ইনস্ট্যান্ট কিউআর টিম পাস।',
  openGraph: {
    title: 'অনলাইন টিম রেজিস্ট্রেশন | Iswampur Premier League 2026',
    description:
      'আপনার ক্রিকেট টিম অনলাইন নিবন্ধন করুন ও ডিজিটাল কিউআর টিম পাস সংগ্রহ করুন।',
    url: '/register/iswampur-premier-league-2026',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'IPL 2026 Online Team Registration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'অনলাইন টিম রেজিস্ট্রেশন | IPL 2026',
    description: 'ঈশ্বমপুর প্রিমিয়ার লীগ ২০২৬ টিম নিবন্ধন চলছে।',
    images: ['/og-image.jpg'],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
