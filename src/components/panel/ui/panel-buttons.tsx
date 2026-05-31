import Link from "next/link";
import { panelClasses } from "@/components/panel/panel-theme";
import { cn } from "@/lib/utils";

type BtnProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function PanelPrimaryButton({
  children,
  className,
  disabled,
  ...props
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(panelClasses.primaryBtn, "h-10", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function PanelSecondaryButton({
  children,
  className,
  disabled,
  ...props
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(panelClasses.secondaryBtn, "h-10", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function PanelPrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(panelClasses.primaryBtn, "h-10", className)}
    >
      {children}
    </Link>
  );
}

export function PanelGhostLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(panelClasses.ghostBtn, "h-9", className)}>
      {children}
    </Link>
  );
}
