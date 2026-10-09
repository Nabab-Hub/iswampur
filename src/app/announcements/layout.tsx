import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'অফিসিয়াল নোটিশ ও ঘোষণা | Official Notices',
  description:
    'ঈশ্বমপুর গ্রাম ও আইপিএল টুর্নামেন্ট পরিচালনা কমিটির জরুরি নোটিশ, বিজ্ঞপ্তি এবং নিয়মাবলী সংক্রান্ত ঘোষণা।',
  openGraph: {
    title: 'অফিসিয়াল নোটিশ ও ঘোষণা | Iswampur Official Notices',
    description: 'ঈশ্বমপুর গ্রাম ও আইপিএল পরিচালনা কমিটির জরুরি নোটিশ ও বিজ্ঞপ্তি।',
    url: '/announcements',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' }],
  },
};

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
