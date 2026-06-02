import { cn } from "@/lib/utils";

function ShimmerBlock({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[#eef3f1]",
        className,
      )}
    >
      <div className="loading-shimmer absolute inset-0" aria-hidden />
    </div>
  );
}

/** Sayfa geçişlerinde içerik alanı iskeleti */
export function PageLoadingShell({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <ShimmerBlock className="h-10 w-56" />
        <ShimmerBlock className="h-4 w-full max-w-2xl" />
        <ShimmerBlock className="h-4 w-4/5 max-w-xl" />
        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <ShimmerBlock className="h-36" />
          <ShimmerBlock className="h-36" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <ShimmerBlock className="h-7 w-40 rounded-full" />
        <ShimmerBlock className="h-12 w-full max-w-3xl" />
        <ShimmerBlock className="h-4 w-full max-w-2xl" />
        <ShimmerBlock className="h-4 w-3/4 max-w-xl" />
        <div className="flex gap-3 pt-2">
          <ShimmerBlock className="h-11 w-36 rounded-full" />
          <ShimmerBlock className="h-11 w-32 rounded-full" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <ShimmerBlock className="aspect-4/3 w-full" />
            <ShimmerBlock className="h-4 w-3/4" />
            <ShimmerBlock className="h-3 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ShimmerBlock key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
