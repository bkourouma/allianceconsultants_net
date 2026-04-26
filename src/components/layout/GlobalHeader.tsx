"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/validators/content";

interface GlobalHeaderProps {
  menu: MenuItem[];
  brandName: string;
  logoUrl: string;
}

export function GlobalHeader({ menu, brandName, logoUrl }: GlobalHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${brandName} — accueil`}
            width={160}
            height={40}
            className="h-9 w-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="sr-only">{brandName}</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                item.primary
                  ? "ml-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-primary-dark)]"
                  : "text-gray-700 hover:text-[var(--color-primary)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="sr-only">{open ? "Fermer" : "Ouvrir"} le menu</span>
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-menu" aria-label="Menu mobile" className="border-t border-gray-100 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-4 pt-2 sm:px-6">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                  item.primary
                    ? "mt-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-center text-white hover:bg-[var(--color-primary-dark)]"
                    : "text-gray-700 hover:text-[var(--color-primary)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
