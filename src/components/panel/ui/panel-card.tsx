import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

export function PanelCard({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
}) {
  return (
    <section
      className={cn(
        size === "lg" ? panelClasses.cardLg : panelClasses.card,
        "p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
