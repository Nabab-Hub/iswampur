import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'সকল অনুষ্ঠান ও উৎসব | Events & Celebrations',
  description:
    'ঈশ্বমপুর গ্রামের সকল বার্ষিক মেলা, সাংস্কৃতিক উৎসব, খেলাধুলা ও ধর্মীয় অনুষ্ঠানের সম্পূর্ণ ক্যালেন্ডার ও তথ্য।',
  openGraph: {
    title: 'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান ও উৎসব | Events Calendar',
    description:
      'ঈশ্বমপুর গ্রামের সকল বার্ষিক মেলা, সাংস্কৃতিক উৎসব, খেলাধুলা ও ধর্মীয় অনুষ্ঠানের সম্পূর্ণ ক্যালেন্ডার ও তথ্য।',
    url: '/events',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Iswampur Village Events Calendar',
      },
    ],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
