import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Account" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="fixed inset-0 z-200 overflow-auto">
      <Image
        src="/images/authbackground.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
