"use client";

import { clsx } from "clsx";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

interface ScrollLockState {
  count: number;
  previousOverflow: string;
  previousPaddingRight: string;
}

const scrollLockRef: ScrollLockState = {
  count: 0,
  previousOverflow: "",
  previousPaddingRight: "",
};

function lockBodyScroll() {
  scrollLockRef.count += 1;
  if (scrollLockRef.count > 1) return;

  scrollLockRef.previousOverflow = document.body.style.overflow;
  scrollLockRef.previousPaddingRight = document.body.style.paddingRight;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlockBodyScroll() {
  scrollLockRef.count = Math.max(0, scrollLockRef.count - 1);
  if (scrollLockRef.count > 0) return;

  document.body.style.overflow = scrollLockRef.previousOverflow;
  document.body.style.paddingRight = scrollLockRef.previousPaddingRight;
  scrollLockRef.previousOverflow = "";
  scrollLockRef.previousPaddingRight = "";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl mx-4",
  };

  return createPortal(
    <div className="fixed inset-0 z-1000 overflow-y-auto">
      {closeOnOverlayClick ? (
        <button
          type="button"
          aria-label="Close modal overlay"
          className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-md"
        />
      )}

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Modal"}
          className={clsx(
            "alchemy-copy relative w-full transform overflow-hidden border border-magma-gold/30 bg-black/90 text-cyan-50 shadow-[0_28px_90px_rgba(0,0,0,0.72),0_0_42px_rgba(240,106,18,0.14)] backdrop-blur-xl transition-all",
            sizes[size],
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/12 via-transparent to-cyan-300/8" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/70 to-transparent" />

          {(title || showCloseButton) && (
            <div className="relative flex items-center justify-between border-b border-cyan-100/12 px-5 py-4 md:px-6">
              {title && (
                <h2 className="alchemy-heading text-balance text-2xl leading-tight">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-4 inline-flex h-10 w-10 shrink-0 items-center justify-center border border-cyan-100/12 bg-black/42 text-cyan-50/58 transition-all hover:border-magma-gold/55 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  aria-label="Close modal"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="relative px-5 py-5 md:px-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "mt-4 flex items-center justify-end gap-3 border-t border-cyan-100/12 px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
