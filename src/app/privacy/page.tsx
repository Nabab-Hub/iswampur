import React from 'react';
import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতি (Privacy Policy)',
  description:
    'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্মের তথ্য সুরক্ষা, টিম রেজিস্ট্রেশন ডাটা ও ডিজিটাল কিউআর পাস সংক্রান্ত গোপনীয়তা নীতি।',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'গোপনীয়তা নীতি | Privacy Policy - Iswampur',
    description:
      'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্মের তথ্য সুরক্ষা ও গোপনীয়তা সংক্রান্ত অফিসিয়াল নীতিমালা।',
    url: '/privacy',
    images: ['/og-image.jpg'],
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
