import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion · Backoffice Alliance",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Backoffice Alliance Consultants
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Connectez-vous avec votre compte administrateur.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Suspense
            fallback={
              <div className="text-sm text-slate-500">Chargement…</div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Espace réservé à l&apos;équipe Alliance Consultants.
        </p>
      </div>
    </div>
  );
}
