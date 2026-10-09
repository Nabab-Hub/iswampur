import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ফটো ও মিডিয়া গ্যালারি | Photo Gallery',
  description:
    'ঈশ্বমপুর গ্রামের অতীত ও বর্তমান অনুষ্ঠান, আইপিএল টুর্নামেন্ট ও উৎসবের দুর্লভ মুহূর্তের ফটো ও ভিডিও সংগ্রহ।',
  openGraph: {
    title: 'ফটো ও মিডিয়া গ্যালারি | Iswampur Village Gallery',
    description: 'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান ও আইপিএল ক্রিকেট উৎসবের স্মৃতিময় মুহূর্তসমূহ।',
    url: '/gallery',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' }],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
