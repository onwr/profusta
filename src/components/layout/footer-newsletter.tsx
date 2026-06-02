"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "profusta_newsletter";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    try {
      const existing = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]",
      ) as string[];
      if (!existing.includes(trimmed.toLowerCase())) {
        existing.push(trimmed.toLowerCase());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed.toLowerCase()]));
    }

    setDone(true);
    setEmail("");
  }

  if (done) {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#475569]">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0f1419]" />
        Kaydınız alındı. Yeniliklerden haberdar olacaksınız.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 flex h-12 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz"
        className="min-w-0 flex-1 px-4 text-sm text-[#0f1419] outline-none placeholder:text-[#94a3b8]"
      />

      <button
        type="submit"
        className="grid w-14 place-items-center bg-[#0f1419] text-white transition hover:bg-[#1e293b]"
        aria-label="Bültene kaydol"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
