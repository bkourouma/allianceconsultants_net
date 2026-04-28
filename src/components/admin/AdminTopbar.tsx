import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

interface AdminTopbarProps {
  user: { email?: string | null; name?: string | null };
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-base font-bold tracking-tight text-slate-900"
          >
            Alliance · Backoffice
          </Link>
          <span className="hidden rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 sm:inline">
            v0.1
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="hidden text-slate-600 hover:text-primary sm:inline"
          >
            Voir le site
          </Link>
          <span className="hidden text-slate-500 sm:inline">
            {user.name ?? user.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
