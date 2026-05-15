"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SaveButton } from "@/shared/ui/save-button";

type GalleryImage = {
  id?: string | undefined;
  url: string;
};

type ListingImageGalleryProps = {
  listingId: string;
  title: string;
  images: GalleryImage[];
};

export function ListingImageGallery({ listingId, title, images }: ListingImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const hasMultiple = images.length > 1;

  const previous = useCallback(() => {
    setCurrent((value) => (value - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((value) => (value + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "ArrowLeft") {
        previous();
      }
      if (event.key === "ArrowRight") {
        next();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, open, previous]);

  if (images.length === 0) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white text-zinc-500">
        No media available for this listing.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[30rem] overflow-hidden rounded-2xl bg-zinc-100">
        <Image
          src={images[current]?.url ?? ""}
          alt={`${title} image ${current + 1}`}
          fill
          className="object-cover"
          onClick={() => setOpen(true)}
        />

        <div className="absolute right-4 top-4">
          <SaveButton listingId={listingId} />
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white"
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                current === index ? "border-zinc-900" : "border-zinc-200"
              }`}
              onClick={() => setCurrent(index)}
            >
              <Image src={image.url} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-zinc-900"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>

          <div className="relative h-full w-full max-w-6xl">
            <Image src={images[current]?.url ?? ""} alt={title} fill className="object-contain" />
            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={previous}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
