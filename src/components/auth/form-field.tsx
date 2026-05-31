import { cn } from "@/lib/utils";

export const inputClassName =
  "w-full rounded-xl border border-black/10 bg-[#f7f7f3] px-4 py-3 text-sm text-[#083228] outline-none transition focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20";

export function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-[#083228]">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
