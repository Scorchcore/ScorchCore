"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { NAV_ITEMS } from "@/lib/constants/routes";
import { ScorchNavLink } from "./ScorchNavLink";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="border-b border-orange-500/20 bg-black/70 shadow-[0_10px_34px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <ScorchNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActive}
                variant="strip"
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
};
