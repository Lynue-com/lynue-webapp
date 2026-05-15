"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/cn";
import { useSavedListings, useToggleSaved } from "@/queries/use-saved";

type SaveButtonProps = {
  listingId: string;
  className?: string;
};

export function SaveButton({ listingId, className }: SaveButtonProps) {
  const savedQuery = useSavedListings();
  const toggleMutation = useToggleSaved();

  const isSaved = (savedQuery.data ?? []).some((saved) => saved.listingId === listingId);

  return (
    <button
      type="button"
      disabled={toggleMutation.isPending}
      onClick={() => {
        toggleMutation.mutate(
          { listingId, isSaved },
          {
            onSuccess: () => {
              toast.success(isSaved ? "Removed from saved" : "Saved listing");
            },
            onError: (error) => {
              toast.error(error.message || "Unable to update saved status");
            },
          },
        );
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100",
        className,
      )}
      aria-label={isSaved ? "Unsave listing" : "Save listing"}
    >
      <Heart size={16} className={cn(isSaved ? "fill-current text-rose-600" : "text-zinc-700")} />
    </button>
  );
}
