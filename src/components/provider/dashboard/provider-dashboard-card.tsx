import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { providerClasses } from "@/components/provider/provider-theme";
import { cn } from "@/lib/utils";

export function ProviderDashboardCard({
  title,
  href,
  viewAllLabel = "Tümünü Gör",
  className,
  headerExtra,
  children,
}: {
  title: string;
  href?: string;
  viewAllLabel?: string;
  className?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(providerClasses.card, "flex flex-col p-4 lg:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className={providerClasses.sectionTitle}>{title}</h2>
        <div className="flex items-center gap-3">
          {headerExtra}
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-0.5 text-xs font-bold text-[#087a61] hover:underline"
            >
              {viewAllLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
