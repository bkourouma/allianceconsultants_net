import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: ReactNode;
  user: { email?: string | null; name?: string | null };
}

export function AdminShell({ children, user }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminTopbar user={user} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
