import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ঈশ্বমপুর গ্রাম ডিজিটাল প্ল্যাটফর্ম & IPL 2026',
    short_name: 'ঈশ্বমপুর',
    description:
      'ঈশ্বমপুর গ্রামের সকল অনুষ্ঠান, মেলা, সাংস্কৃতিক উৎসব ও বার্ষিক ঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) এর অফিসিয়াল ডিজিটাল প্ল্যাটফর্ম।',
    start_url: '/',
    display: 'standalone',
    background_color: '#050D24',
    theme_color: '#08143A',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
