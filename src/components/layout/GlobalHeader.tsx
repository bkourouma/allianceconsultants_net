"use client";

import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70"
          : "border-b border-transparent bg-white/70 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-28 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={`${brandName} — accueil`}
            width={160}
            height={40}
            className="h-16 w-auto lg:h-20"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "inline-flex";
            }}
          />
          <span
            className="hidden items-center text-base font-bold tracking-tight text-slate-900"
            style={{ display: "none" }}
            aria-hidden="true"
          >
            <span className="mr-2 inline-flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              A
            </span>
            {brandName}
          </span>
          <span className="sr-only">{brandName}</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 lg:flex"
        >
          {menu
            .filter((item) => !item.primary)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            ))}
          {menu
            .filter((item) => item.primary)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="ml-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center rounded-md text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="sr-only">{open ? "Fermer" : "Ouvrir"} le menu</span>
          <BurgerIcon open={open} />
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobile"
          className="fixed inset-0 top-24 z-40 flex flex-col overflow-y-auto bg-white px-4 pb-12 pt-6 sm:px-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {menu
              .filter((item) => !item.primary)
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center rounded-lg px-4 text-lg font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>

          <div className="mt-8 border-t border-slate-200 pt-6">
            {menu
              .filter((item) => item.primary)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  );
}
