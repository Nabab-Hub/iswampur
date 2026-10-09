'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
}

export default function ImageSlider({
  images,
  alt = 'Post Image',
  className = '',
  aspectRatio = 'video',
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'max-h-[500px]';

  return (
    <>
      <div
        className={`relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-slate-200 dark:border-[#1d3575] shadow-lg select-none ${className}`}
      >
        {/* Main Image View */}
        <div className={`relative w-full ${aspectClass} overflow-hidden flex items-center justify-center bg-black/40`}>
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />

          {/* Image count pill */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black tracking-wide border border-white/20 shadow-md">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Enlarge Button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md"
            title="Enlarge Image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Nav Arrows (if multiple images) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-[#F26522] text-white backdrop-blur-md transition-all duration-300 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-[#F26522] text-white backdrop-blur-md transition-all duration-300 opacity-90 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Cute Pagination Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-5 h-2 bg-[#F26522] shadow-sm shadow-[#F26522]/50'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 p-3 rounded-full bg-black/60 hover:bg-[#F26522] text-white transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 p-3 rounded-full bg-black/60 hover:bg-[#F26522] text-white transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
