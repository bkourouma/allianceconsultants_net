"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onClick() {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        window.alert("Échec de la suppression.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      window.alert("Erreur réseau.");
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className="inline-flex h-9 items-center justify-center rounded-md border border-red-300 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {submitting ? "Suppression…" : "Supprimer"}
    </button>
  );
}
