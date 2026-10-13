'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GlobalLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevRouteRef = useRef({ pathname, search: searchParams?.toString() || '' });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When route changes finish, complete progress and smoothly hide
  useEffect(() => {
    const currentSearch = searchParams?.toString() || '';
    if (
      pathname !== prevRouteRef.current.pathname ||
      currentSearch !== prevRouteRef.current.search
    ) {
      prevRouteRef.current = { pathname, search: currentSearch };
      if (loading) {
        setProgress(100);
        const timer = setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, searchParams, loading]);

  useEffect(() => {
    // Intercept clicks on internal links to show page switch loading bar
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't trigger if already right-clicked or meta/ctrl clicked (new tab)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (
        link &&
        link.href &&
        !link.target &&
        !link.hasAttribute('download') &&
        !link.href.startsWith('mailto:') &&
        !link.href.startsWith('tel:') &&
        !link.href.startsWith('javascript:')
      ) {
        try {
          const url = new URL(link.href, window.location.href);
          const isSameOrigin = url.origin === window.location.origin;
          const isDifferentPath =
            url.pathname !== window.location.pathname ||
            (url.search !== window.location.search && !url.hash);
          const isHashAnchorOnly =
            url.pathname === window.location.pathname &&
            Boolean(url.hash) &&
            url.search === window.location.search;

          if (isSameOrigin && isDifferentPath && !isHashAnchorOnly) {
            setLoading(true);
            setProgress(30);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Gradually advance progress while awaiting page change
            const stepTimer1 = setTimeout(() => {
              setProgress((prev) => (prev < 65 ? 65 : prev));
            }, 180);
            const stepTimer2 = setTimeout(() => {
              setProgress((prev) => (prev < 85 ? 85 : prev));
            }, 450);

            // Safety fallback: if page load takes longer than 5s or gets cancelled, hide
            timeoutRef.current = setTimeout(() => {
              setLoading(false);
              setProgress(0);
              clearTimeout(stepTimer1);
              clearTimeout(stepTimer2);
            }, 5000);
          }
        } catch {
          // ignore parsing error
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0] shadow-[0_0_12px_rgba(242,101,34,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? 'width 0.2s ease-out, opacity 0.35s ease-out 0.1s'
              : 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
