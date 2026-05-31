import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

/** Liste / harita gövdesi — eşleşen satırlarda aynı minimum yükseklik */
export const dashboardWidgetBodyClass =
  "flex min-h-[220px] flex-1 flex-col";

type Props = {
  title: string;
  href?: string;
  viewAllLabel?: string;
  className?: string;
  /** Izgara satırında kartlar aynı yüksekliğe uzansın */
  fill?: boolean;
  children: React.ReactNode;
};

export function DashboardCard({
  title,
  href,
  viewAllLabel = "Tümünü gör",
  className,
  fill = false,
  children,
}: Props) {
  return (
    <section
      className={cn(
        panelClasses.card,
        "p-5",
        fill && "flex h-full flex-col",
        className,
      )}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-base font-black text-[#083228]">{title}</h2>
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
      {fill ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
