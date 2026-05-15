"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Something went wrong</h2>
      <p className="mt-2 text-zinc-600">An unexpected issue occurred while loading this page.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
