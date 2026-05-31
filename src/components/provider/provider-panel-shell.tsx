"use client";

import { useState } from "react";
import { ProviderPageTransition } from "@/components/provider/provider-page-transition";
import { ProviderSidebar } from "@/components/provider/provider-sidebar";
import { ProviderTopBar } from "@/components/provider/provider-top-bar";
import type { ProviderNavCounts } from "@/lib/provider/dashboard-data";

type Props = {
  userName: string;
  avatarUrl: string | null;
  profession: string;
  ratingAvg: number | null;
  reviewCount: number;
  navCounts: ProviderNavCounts;
  children: React.ReactNode;
};

export function ProviderPanelShell({
  userName,
  avatarUrl,
  profession,
  ratingAvg,
  reviewCount,
  navCounts,
  children,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fcfa]">
      <div className="flex items-start">
        <ProviderSidebar
          userName={userName}
          avatarUrl={avatarUrl}
          profession={profession}
          ratingAvg={ratingAvg}
          reviewCount={reviewCount}
          navCounts={navCounts}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ProviderTopBar
            userName={userName}
            avatarUrl={avatarUrl}
            profession={profession}
            navCounts={navCounts}
            onMobileMenuOpen={() => setMobileNavOpen(true)}
          />
          <main className="flex-1 px-4 pb-8 pt-2 lg:px-8 lg:pt-2">
            <ProviderPageTransition>{children}</ProviderPageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
