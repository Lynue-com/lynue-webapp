import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Page not found</h2>
      <p className="mt-2 text-zinc-600">The page you requested does not exist or has moved.</p>
      <Link href="/" className="mt-6">
        <Button>Go to home</Button>
      </Link>
    </div>
  );
}
