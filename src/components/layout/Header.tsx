"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { ConnectWallet } from "@/components/wallet";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants/routes";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { ScorchNavLink } from "./ScorchNavLink";

export const Header: React.FC = () => {
  const { isConnected } = useWallet();
  const pathname = usePathname();
  const homeUrl = isConnected ? "/dashboard" : "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const appLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/forge", label: "Forge" },
    { href: "/inventory", label: "Inventory" },
    { href: "/staking", label: "Mining" },
    { href: "/analytics", label: "Analytics" },
    { href: "/collection", label: "Collections" },
    { href: "/trustscore", label: "TrustScore" },
    { href: "/economy", label: "Economy" },
    { href: "/vesting", label: "Vesting" },
  ];
  const dropdownLinks = appLinks.slice(4);
  const isMoreActive = dropdownLinks.some((link) => pathname === link.href);

  return (
    <header className="sticky top-0 z-40 w-full bg-linear-to-b from-black/95 via-black/78 to-black/20 backdrop-blur-md supports-backdrop-filter:bg-black/70">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={homeUrl}
          aria-label="ScorchCore Protocol"
          className="group flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="h-14 w-14 rounded-full object-cover shadow-[0_0_28px_rgba(240,106,18,0.34)] transition duration-200 group-hover:scale-[1.03] group-hover:shadow-[0_0_38px_rgba(247,198,90,0.42)]"
          />
          <span className="sr-only">ScorchCore Protocol</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {/* Public Links - always visible */}
          {PUBLIC_NAV_ITEMS.map((link) => (
            <ScorchNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}

          {/* App Links - only when connected */}
          {isConnected && (
            <>
              <div className="mx-1 h-7 w-px bg-linear-to-b from-transparent via-orange-300/35 to-transparent" />
              {appLinks.slice(0, 4).map((link) => (
                <ScorchNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={pathname === link.href}
                />
              ))}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  className={`scorch-nav-link scorch-nav-link--desktop ${isMoreActive ? "is-active" : ""}`}
                >
                  <span className="scorch-nav-label">[ MORE ]</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="scorch-nav-panel absolute right-0 z-50 mt-3 w-56 p-2">
                      {dropdownLinks.map((link) => (
                        <ScorchNavLink
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          variant="dropdown"
                          isActive={pathname === link.href}
                          onClick={() => setIsDropdownOpen(false)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Right side: Wallet + Mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button - always visible */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg border border-orange-300/20 p-2 text-orange-100 transition-colors hover:border-orange-300/50 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - always available */}
      {isMobileMenuOpen && (
        <div className="border-t border-orange-500/20 bg-black/95 lg:hidden">
          <nav className="container mx-auto px-4 py-4">
            {/* Public Links */}
            <div className="space-y-2">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
                Learn
              </p>
              {PUBLIC_NAV_ITEMS.map((link) => (
                <ScorchNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  variant="mobile"
                  isActive={pathname === link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>

            {/* App Links - only when connected */}
            {isConnected && (
              <div className="mt-4 space-y-2 border-t border-orange-500/20 pt-4">
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
                  App
                </p>
                {appLinks.map((link) => (
                  <ScorchNavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    variant="mobile"
                    isActive={pathname === link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            )}

            {/* Wallet */}
            <div className="mt-4 border-t border-orange-500/20 pt-4">
              <ConnectWallet />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
