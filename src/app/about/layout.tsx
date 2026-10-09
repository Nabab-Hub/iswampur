import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | About Iswampur',
  description:
    'ঈশ্বমপুর গ্রামের ইতিহাস, সংস্কৃতি, ঐতিহ্য এবং ডিজিটাল ও ক্রীড়া উন্নয়ন কমিটির পরিচিতি।',
  openGraph: {
    title: 'আমাদের সম্পর্কে | About Iswampur Village',
    description: 'ঈশ্বমপুর গ্রামের ইতিহাস, ঐতিহ্য ও উন্নয়ন কমিটির পরিচিতি।',
    url: '/about',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
