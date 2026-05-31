import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PanelPageHeader({
  title,
  subtitle,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className={panelClasses.pageTitle}>{title}</h1>
        {subtitle ? (
          <p className={cn("mt-1", panelClasses.subtitle)}>{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
