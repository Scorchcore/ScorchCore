"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import type React from "react";
import { NAV_ITEMS } from "@/lib/constants/routes";
import { ScorchNavLink } from "./ScorchNavLink";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-orange-500/20 bg-black/95 shadow-[18px_0_42px_rgba(0,0,0,0.4)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <nav className="flex h-full flex-col gap-3 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <ScorchNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={isActive}
                variant="sidebar"
                onClick={onClose}
              />
            );
          })}

          {/* Stats Section */}
          <div className="mt-auto space-y-2">
            <div className="scorch-nav-panel p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
                [ Mis Estadísticas ]
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-100/55">CoreMiners:</span>
                  <span className="font-medium text-magma-gold">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-100/55">Geodas:</span>
                  <span className="font-medium text-magma-gold">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-100/55">Poder Total:</span>
                  <span className="font-medium text-ethereal-cyan">0</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};
