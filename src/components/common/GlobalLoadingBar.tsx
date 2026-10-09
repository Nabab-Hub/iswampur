'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GlobalLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When route finishes changing, hide loading bar
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links or submit buttons to trigger visual loader feedback
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (link && link.href && !link.target && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-1 w-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0] animate-pulse" />
      <div className="h-0.5 w-1/3 bg-white/80 blur-xs absolute top-0 left-0 animate-[move_1.5s_infinite_linear]" />
    </div>
  );
}
