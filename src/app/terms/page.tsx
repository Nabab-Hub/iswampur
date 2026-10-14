import React from 'react';
import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'শর্তাবলী ও নিয়মাবলী (Terms & Conditions)',
  description:
    'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম ও ঈশ্বমপুর প্রিমিয়ার লীগ (IPL) এর অফিসিয়াল নিয়মাবলী, রেজিস্ট্রেশন শর্ত ও মাঠের আচরণবিধি।',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'শর্তাবলী ও নিয়মাবলী | Terms & Conditions - Iswampur',
    description:
      'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম এবং টুর্নামেন্টের সমস্ত অফিসিয়াল শর্ত ও নিয়মাবলী।',
    url: '/terms',
    images: ['/og-image.jpg'],
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
