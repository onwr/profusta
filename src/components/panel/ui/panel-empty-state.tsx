import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

export function PanelEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(panelClasses.emptyState, className)}>
      {icon ? <div className="mx-auto mb-3 flex justify-center">{icon}</div> : null}
      <p className="text-[14px] font-black text-[#083228]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-[280px] text-[12px] font-medium text-[#5a7a72]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
