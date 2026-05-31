"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { CustomerTopBar } from "@/components/customer/customer-top-bar";
import type { CustomerNavCounts } from "@/lib/customer/dashboard-data";

type Props = {
  userId: string;
  userName: string;
  navCounts: CustomerNavCounts;
  children: React.ReactNode;
};

export function CustomerPanelShell({
  userId,
  userName,
  navCounts,
  children,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fcfa]">
      <div className="flex items-start">
        <CustomerSidebar
          userId={userId}
          navCounts={navCounts}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-black/5 bg-white px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#083228] hover:bg-[#eef8f5]"
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-[#083228]">Müşteri Paneli</span>
          </div>

          <CustomerTopBar
            userName={userName}
            unreadMessagesCount={navCounts.unreadMessagesCount}
          />

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
