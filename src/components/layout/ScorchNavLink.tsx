"use client";

import { clsx } from "clsx";
import Link from "next/link";
import type React from "react";

type ScorchNavVariant = "desktop" | "strip" | "sidebar" | "mobile" | "dropdown";

interface ScorchNavLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  variant?: ScorchNavVariant;
  className?: string;
}

export const ScorchNavLink: React.FC<ScorchNavLinkProps> = ({
  href,
  label,
  icon,
  isActive = false,
  onClick,
  variant = "desktop",
  className,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "scorch-nav-link",
        `scorch-nav-link--${variant}`,
        isActive && "is-active",
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="scorch-nav-icon">
          {icon}
        </span>
      )}
      <span className="scorch-nav-label">[ {label.toUpperCase()} ]</span>
    </Link>
  );
};
