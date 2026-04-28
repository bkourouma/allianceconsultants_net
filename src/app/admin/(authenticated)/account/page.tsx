import { auth } from "@/lib/auth";
import { PasswordChangeForm } from "@/components/admin/PasswordChangeForm";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mon compte</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gestion du compte administrateur Alliance Consultants.
        </p>
      </header>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <Field label="E-mail">{session?.user?.email ?? "—"}</Field>
        <Field label="Nom">{session?.user?.name ?? "—"}</Field>
      </section>

      <PasswordChangeForm />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{children}</p>
    </div>
  );
}
