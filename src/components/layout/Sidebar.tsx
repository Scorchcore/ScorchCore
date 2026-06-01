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
          "fixed left-0 top-16 z-40 flex h-[calc(100dvh-4rem)] w-64 flex-col overflow-hidden border-r border-orange-500/20 bg-black/95 shadow-[18px_0_42px_rgba(0,0,0,0.4)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <nav className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-color:rgba(125,249,255,0.35)_transparent] [scrollbar-width:thin]">
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
          </div>

          {/* Stats Section */}
          <div className="shrink-0 border-t border-orange-500/20 p-4">
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
