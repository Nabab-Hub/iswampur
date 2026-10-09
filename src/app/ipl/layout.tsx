import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'আইপিএল হাব ও টুর্নামেন্ট ২০২৬ | Iswampur Premier League (IPL)',
  description:
    'ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) দশম সংস্করণের অফিসিয়াল ইনফো হাব, টিম স্কোয়াড, নিয়মাবলী ও লাইভ আপডেট।',
  openGraph: {
    title: 'আইপিএল হাব ও টুর্নামেন্ট ২০২৬ | Iswampur Premier League',
    description:
      'ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) দশম সংস্করণের অফিসিয়াল ইনফো হাব, টিম স্কোয়াড ও নিয়মাবলী।',
    url: '/ipl',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Iswampur Premier League Tournament Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আইপিএল হাব ও টুর্নামেন্ট ২০২৬ | Iswampur Premier League',
    description: 'ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) এর অফিসিয়াল টুর্নামেন্ট হাব।',
    images: ['/og-image.jpg'],
  },
};

export default function IPLLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
