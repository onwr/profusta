"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  Eye,
  EyeOff,
  Landmark,
  TrendingUp,
  Wallet as WalletIcon,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";

function formatTry(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function DashboardWalletCard({
  wallet,
}: {
  wallet: ProviderDashboardData["wallet"];
}) {
  const [show, setShow] = useState(true);
  const mask = "•••••";

  const { available, pending, totalEarned, withdrawn } = wallet;

  const stats = [
    {
      key: "pending",
      label: "Bekleyen ödeme",
      value: pending,
      icon: Clock3,
      hint: "Aktif işlerden escrow",
    },
    {
      key: "earned",
      label: "Toplam kazanç",
      value: totalEarned,
      icon: TrendingUp,
      hint: "Tüm zamanlar",
    },
    {
      key: "withdrawn",
      label: "Çekilen tutar",
      value: withdrawn,
      icon: Landmark,
      hint: "Tamamlanan ödemeler",
    },
  ] as const;

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/10 text-white shadow-[0_20px_55px_rgba(8,50,40,0.22)]"
      style={{
        background:
          "linear-gradient(145deg, #064a3f 0%, #083228 55%, #041b15 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(8,122,97,0.45), transparent 40%), radial-gradient(circle at bottom left, rgba(255,255,255,0.06), transparent 35%)",
        }}
      />
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />

      <div className="relative z-10 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                Cüzdan
              </p>
              <h3 className="text-[17px] font-black tracking-[-0.02em] text-white">
                Bakiye Özeti
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Bakiyeyi gizle" : "Bakiyeyi göster"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
          >
            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
          <p className="text-[12px] font-semibold text-white/55">
            Kullanılabilir bakiye
          </p>
          <p className="mt-2 text-[34px] font-black leading-none tracking-tighter text-white">
            ₺{show ? formatTry(available) : mask}
          </p>
          {!show ? null : available <= 0 && pending <= 0 ? (
            <p className="mt-2 text-[11px] font-medium text-white/50">
              Tamamlanan işlerden kazanç oluştuğunda bakiye güncellenir.
            </p>
          ) : null}
        </div>

        <ul className="mt-3 space-y-2">
          {stats.map(({ key, label, value, icon: Icon, hint }) => (
            <li
              key={key}
              className="flex items-center justify-between gap-3 rounded-[16px] border border-white/8 bg-white/6 px-3.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white/80">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white/90">{label}</p>
                  <p className="truncate text-[10px] font-medium text-white/40">
                    {hint}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-[14px] font-black text-white">
                ₺{show ? formatTry(value) : mask}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2">
          <Link
            href={ROUTES.provider.payouts}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-[12px] font-black text-[#083228] shadow-[0_10px_24px_rgba(0,0,0,0.15)] transition hover:bg-white/95"
          >
            <Landmark className="h-4 w-4" />
            Para Çek
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={ROUTES.provider.earnings}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 text-[11px] font-bold text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            Kazanç detayları
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
