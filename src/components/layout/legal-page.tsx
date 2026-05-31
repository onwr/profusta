import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-16 sm:px-12">
      <Link
        href={ROUTES.home}
        className="text-sm font-semibold text-[#087a61] hover:underline"
      >
        ← Ana sayfa
      </Link>
      <h1 className="mt-6 text-3xl font-black text-[#083228]">{title}</h1>
      <div className="prose prose-neutral mt-8 max-w-none text-[#53635f]">
        {children}
      </div>
    </div>
  );
}
