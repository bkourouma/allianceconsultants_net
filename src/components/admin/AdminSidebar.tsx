"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/references", label: "Références" },
  { href: "/admin/account", label: "Mon compte" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav aria-label="Navigation backoffice" className="sticky top-24 space-y-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-200/70",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
