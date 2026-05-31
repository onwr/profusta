import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
            {eyebrow}
          </span>
        ) : null}
        <h1
          className={cn(
            "text-2xl font-black tracking-[-0.02em] text-[#083228]",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#53635f]">{subtitle}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
