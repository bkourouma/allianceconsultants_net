"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        void signOut({ callbackUrl: "/admin/login" });
      }}
      disabled={loading}
      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
    >
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
