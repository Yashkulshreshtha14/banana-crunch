"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminSetupPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: form.get("token"),
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const body = await response.text();
      let result: { error?: string } = {};
      try {
        result = body ? JSON.parse(body) : {};
      } catch {
        throw new Error(`The setup service returned an unexpected response (HTTP ${response.status}). Please try again shortly.`);
      }
      if (!response.ok) throw new Error(result.error || "Setup failed. Please try again.");
      window.location.href = "/admin?setup=complete";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-[#fffdf8] px-5 py-12 text-[#27251f]">
      <section className="mx-auto max-w-lg rounded-3xl border border-[#eee8d9] bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#73823c]">Banana Crunch · Owner setup</p>
        <h1 className="mt-3 text-3xl font-semibold">Create your admin account</h1>
        <p className="mt-3 text-sm leading-6 text-[#69665e]">This one-time setup is for the store owner. You’ll need the private setup code provided to you. Choose a unique password with at least 12 characters.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-medium">Setup code
            <input required minLength={32} name="token" type="password" autoComplete="off" className="mt-2 w-full rounded-xl border border-[#ddd8cd] px-4 py-3 outline-none focus:border-[#829247]" />
          </label>
          <label className="block text-sm font-medium">Your name
            <input required minLength={2} maxLength={100} name="name" defaultValue="Yash" autoComplete="name" className="mt-2 w-full rounded-xl border border-[#ddd8cd] px-4 py-3 outline-none focus:border-[#829247]" />
          </label>
          <label className="block text-sm font-medium">Owner email
            <input required type="email" name="email" defaultValue="yashkulshreshtha14@gmail.com" autoComplete="email" className="mt-2 w-full rounded-xl border border-[#ddd8cd] px-4 py-3 outline-none focus:border-[#829247]" />
          </label>
          <label className="block text-sm font-medium">Create password
            <input required minLength={12} maxLength={128} name="password" type="password" autoComplete="new-password" className="mt-2 w-full rounded-xl border border-[#ddd8cd] px-4 py-3 outline-none focus:border-[#829247]" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-full bg-[#29271f] px-5 py-3.5 font-semibold text-white transition hover:bg-[#474335] disabled:opacity-60">{busy ? "Creating account…" : "Create owner account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#69665e]"><Link className="underline underline-offset-4" href="/admin">Back to admin sign in</Link></p>
      </section>
    </main>
  );
}
