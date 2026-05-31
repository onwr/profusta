import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#087a61] text-white shadow-[0_14px_30px_rgba(8,122,97,0.22)] hover:bg-[#06644f]",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline:
    "border border-black/10 bg-white text-[#083228] hover:bg-[#f4f8f6]",
  ghost: "text-[#083228] hover:bg-[#f4f8f6]",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-[58px] items-center justify-center rounded-2xl px-5 text-[15px] font-black transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-[58px] items-center justify-center rounded-2xl px-5 text-[15px] font-black transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}