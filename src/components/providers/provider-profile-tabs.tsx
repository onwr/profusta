"use client";

import { useState, type ReactNode } from "react";

type ProviderProfileTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function ProviderProfileTabs({ tabs }: { tabs: ProviderProfileTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const activeContent =
    tabs.find((tab) => tab.id === activeTab)?.content ?? tabs[0]?.content;

  return (
    <div className="space-y-5">
      <div className="flex overflow-x-auto rounded-[22px] border border-black/5 bg-white p-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black transition ${
                active
                  ? "bg-[#087a61] text-white shadow-[0_10px_24px_rgba(8,122,97,0.20)]"
                  : "text-[#53635f] hover:bg-[#f5f7fb] hover:text-[#083228]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>{activeContent}</div>
    </div>
  );
}
