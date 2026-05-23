"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, optimizeCloudinaryUrl } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

export default function ImageCarousel({ images, title, className }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!images.length) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center", className)}>
        <span className="text-gray-400 text-sm">No photos</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative min-w-full h-full shrink-0">
            <Image
              src={optimizeCloudinaryUrl(src, 800, 500)}
              alt={`${title} ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}

      <span className="absolute top-3 right-3 text-xs text-white bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
        {current + 1}/{images.length}
      </span>
    </div>
  );
}
