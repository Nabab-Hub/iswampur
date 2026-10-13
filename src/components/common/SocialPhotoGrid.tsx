'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface SocialPhotoGridProps {
  images: string[];
  alt?: string;
  className?: string;
}

export default function SocialPhotoGrid({
  images,
  alt = 'Post photo',
  className = '',
}: SocialPhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) return null;

  const count = images.length;

  const openLightbox = (index: number) => {
    setActiveIdx(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <>
      {/* 1:1 SQUARE ASPECT RATIO CONTAINER FOR ALL CARD SIZES */}
      <div
        className={`relative aspect-square w-full overflow-hidden select-none bg-slate-900 ${className}`}
      >
        {/* CASE 1: Exactly 1 Image (1:1 Full Square) */}
        {count === 1 && (
          <div
            onClick={() => openLightbox(0)}
            className="w-full h-full relative overflow-hidden cursor-pointer group bg-black/20"
          >
            <img
              src={images[0]}
              alt={`${alt} 1`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {/* CASE 2: Exactly 2 Images (Side-by-side inside 1:1 Square) */}
        {count === 2 && (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
              >
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {/* CASE 3: Exactly 3 Images (1 on Top Half, 2 on Bottom Half inside 1:1 Square) */}
        {count === 3 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
            {/* Top Image: spans 2 columns, height 50% */}
            <div
              onClick={() => openLightbox(0)}
              className="col-span-2 row-span-1 relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
            >
              <img
                src={images[0]}
                alt={`${alt} 1`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            </div>

            {/* Bottom 2 Images: 1 column each */}
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i + 1}
                onClick={() => openLightbox(i + 1)}
                className="col-span-1 row-span-1 relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
              >
                <img
                  src={img}
                  alt={`${alt} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {/* CASE 4: Exactly 4 Images (2x2 Grid inside 1:1 Square) */}
        {count === 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
            {images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
              >
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {/* CASE 5: More than 4 Images (2x2 Grid with +1, +2 on 4th Box) */}
        {count > 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
            {/* First 3 Images */}
            {images.slice(0, 3).map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
              >
                <img
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </div>
            ))}

            {/* 4th Box with +N Overlay (+1 if 5, +2 if 6, etc.) */}
            <div
              onClick={() => openLightbox(3)}
              className="relative w-full h-full overflow-hidden cursor-pointer group bg-black/20"
            >
              <img
                src={images[3]}
                alt={`${alt} 4`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center text-white text-xl sm:text-2xl font-black tracking-wider group-hover:bg-black/55 transition-colors">
                +{count - 4}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX: FULL IMAGE IN ORIGINAL RATIO */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar: Counter & Close */}
          <div
            className="flex items-center justify-between p-4 sm:p-6 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-bold border border-white/10 tracking-wide">
              Photo {activeIdx + 1} of {images.length}
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110 active:scale-95"
              aria-label="Close photo view"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Center Stage: Display Image in its FULL ORIGINAL RATIO (No Cropping) */}
          <div
            className="relative flex-1 flex items-center justify-center px-4 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 sm:left-6 z-10 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-[#F26522] text-white backdrop-blur-md transition-all hover:scale-110 active:scale-90 border border-white/10 shadow-2xl"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Image in True Original Aspect Ratio */}
            <div className="relative max-w-full max-h-[82vh] flex items-center justify-center">
              <img
                src={images[activeIdx]}
                alt={`${alt} original ratio ${activeIdx + 1}`}
                className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl select-none animate-in zoom-in-95 duration-200"
              />
            </div>

            {/* Next Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 sm:right-6 z-10 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-[#F26522] text-white backdrop-blur-md transition-all hover:scale-110 active:scale-90 border border-white/10 shadow-2xl"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div
              className="p-4 sm:p-6 overflow-x-auto flex items-center justify-center gap-2.5 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 max-w-full overflow-x-auto">
                {images.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activeIdx
                        ? 'border-[#F26522] scale-105 shadow-md shadow-[#F26522]/50'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
