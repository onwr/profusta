import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

export function PanelBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(panelClasses.backLink, className)}>
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
