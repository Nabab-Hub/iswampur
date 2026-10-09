import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'যোগাযোগ ও হেল্পডেস্ক | Contact Us',
  description:
    'ঈশ্বমপুর গ্রাম কমিটি এবং আইপিএল পরিচালনা কমিটির সাথে যোগাযোগ করুন। হেল্পলাইন ও অফিসিয়াল সহায়তা।',
  openGraph: {
    title: 'যোগাযোগ ও হেল্পডেস্ক | Contact Iswampur Committee',
    description: 'ঈশ্বমপুর গ্রাম ও আইপিএল পরিচালনা কমিটির অফিসিয়াল যোগাযোগ ও হেল্পডেস্ক।',
    url: '/contact',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, type: 'image/jpeg' }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
