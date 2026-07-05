import Link from "next/link";
import { ExternalLink } from "lucide-react";

const explore = [
  { label: "For Renters", href: "/for-renters" },
  { label: "For Buyers", href: "/for-buyers" },
  { label: "For Sellers", href: "/for-listers" },
  { label: "For Agencies", href: "/for-agents" },
];

const support = [
  { label: "Help Center", href: "/help" },
  { label: "Fair Housing Policy", href: "/fair-housing-policy" },
  { label: "Blog", href: "https://blog.lynue.com/", external: true },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Terms of Service", href: "/terms-of-services" },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/lynuecom/" },
  { label: "Facebook", href: "https://web.facebook.com/lynuecom/" },
  { label: "LinkedIn", href: "https://linkedin.com/company/lynue" },
  { label: "X / Twitter", href: "https://x.com/Lynuecom" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-zinc-900 text-zinc-300">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand + socials */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xl font-black text-white">Lynue</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Nigeria&apos;s trusted property platform for rent and sale.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full p-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Explore</p>
            <ul className="space-y-3">
              {explore.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Support</p>
            <ul className="space-y-3">
              {support.map(({ label, href, external }) => (
                <li key={label}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white">{label}</a>
                  ) : (
                    <Link href={href} className="text-sm hover:text-white">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Legal</p>
            <ul className="space-y-3">
              {legal.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Lynue Inc. All rights reserved.
          </p>
          <a href="mailto:info@lynue.com" className="text-xs text-zinc-500 hover:text-white">
            info@lynue.com
          </a>
        </div>
      </div>
    </footer>
  );
}
