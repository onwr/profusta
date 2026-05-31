import {
  Briefcase,
  CheckCircle2,
  FileText,
  Inbox,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { cn } from "@/lib/utils";

type IconTone = "blue" | "purple" | "amber" | "green" | "yellow";

const TONES: Record<IconTone, { bg: string; text: string }> = {
  blue: { bg: "bg-[#eef8f5]", text: "text-[#087a61]" },
  purple: { bg: "bg-[#e6f4f0]", text: "text-[#0a6b58]" },
  amber: { bg: "bg-[#fff4cc]", text: "text-[#d97706]" },
  green: { bg: "bg-[#dcf7e7]", text: "text-[#087a61]" },
  yellow: { bg: "bg-[#fef3c7]", text: "text-[#ca8a04]" },
};

export function DashboardStatRow({
  stats,
}: {
  stats: ProviderDashboardData["stats"];
}) {
  const items: {
    key: string;
    label: string;
    value: string | number;
    sub: string;
    trend: number | null;
    icon: React.ComponentType<{ className?: string }>;
    tone: IconTone;
  }[] = [
    {
      key: "requests",
      label: "Gelen Talepler",
      value: stats.newRequests.value,
      sub: stats.newRequests.sub,
      trend: stats.newRequests.trend,
      icon: Inbox,
      tone: "blue",
    },
    {
      key: "offers",
      label: "Tekliflerim",
      value: stats.offersSent.value,
      sub: stats.offersSent.sub,
      trend: stats.offersSent.trend,
      icon: FileText,
      tone: "purple",
    },
    {
      key: "active",
      label: "Aktif İşlerim",
      value: stats.activeJobs.value,
      sub: stats.activeJobs.sub,
      trend: stats.activeJobs.trend,
      icon: Briefcase,
      tone: "amber",
    },
    {
      key: "completed",
      label: "Tamamlanan İşler",
      value: stats.completedWeek.value,
      sub: stats.completedWeek.sub,
      trend: stats.completedWeek.trend,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      key: "rating",
      label: "Ortalama Puanım",
      value: stats.rating.value,
      sub: stats.rating.sub,
      trend: stats.rating.trend,
      icon: Star,
      tone: "yellow",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const tone = TONES[item.tone];
        const Icon = item.icon;
        const TrendIcon = item.trend != null && item.trend < 0 ? TrendingDown : TrendingUp;

        return (
          <article
            key={item.key}
            className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-[0_18px_50px_rgba(8,50,40,0.06)]"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  tone.bg,
                  tone.text,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-right text-[10px] font-bold leading-snug text-[#5a7a72]">
                {item.label}
              </p>
            </div>
            <p className="mt-2.5 text-[24px] font-black leading-none text-[#083228]">
              {item.value}
            </p>
            <p className="mt-1 text-[11px] font-medium text-[#8aa39c]">{item.sub}</p>
            {item.trend != null ? (
              <p
                className={cn(
                  "mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold",
                  item.trend >= 0 ? "text-[#087a61]" : "text-[#ef4444]",
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {item.trend >= 0 ? "+" : ""}
                {item.trend}% artış
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-[#d1d5db]">—</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
