import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  bodyClassName?: string;
};

export function AdminCard({
  children,
  className,
  title,
  subtitle,
  actions,
  bodyClassName,
}: AdminCardProps) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <section
      className={cn(
        "rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-black text-[#083228]">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[#53635f]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={cn(hasHeader ? "p-5" : "", bodyClassName)}>{children}</div>
    </section>
  );
}

export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
