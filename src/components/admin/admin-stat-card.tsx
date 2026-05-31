import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "green" | "blue" | "amber" | "red" | "slate";

const toneMap: Record<Tone, { chip: string; value: string }> = {
  green: { chip: "bg-[#e5f3ef] text-[#087a61]", value: "text-[#083228]" },
  blue: { chip: "bg-[#e6efff] text-[#0b55ff]", value: "text-[#083228]" },
  amber: { chip: "bg-[#fdf2dd] text-[#b7791f]", value: "text-[#083228]" },
  red: { chip: "bg-[#fdeaea] text-[#d4493f]", value: "text-[#083228]" },
  slate: { chip: "bg-[#eef1f0] text-[#53635f]", value: "text-[#083228]" },
};

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  sub?: string;
  href?: string;
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  sub,
  href,
}: AdminStatCardProps) {
  const tones = toneMap[tone];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones.chip)}>
          <Icon className="h-5 w-5" />
        </div>
        {href ? (
          <ArrowUpRight className="h-4 w-4 text-[#9aa8a4] transition group-hover:text-[#087a61]" />
        ) : null}
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-[#7b8b87]">
        {label}
      </p>
      <p className={cn("mt-1 text-[26px] font-black leading-none", tones.value)}>
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-[#53635f]">{sub}</p> : null}
    </>
  );

  const base =
    "block rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, "group transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]")}
      >
        {body}
      </Link>
    );
  }

  return <div className={base}>{body}</div>;
}
