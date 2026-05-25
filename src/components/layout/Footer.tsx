"use client";

import { clsx } from "clsx";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Github,
  Hammer,
  Instagram,
  type LucideIcon,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

interface FooterProps {
  className?: string;
  compact?: boolean;
}

interface FooterPrimaryLink {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
  disabled?: boolean;
  external?: boolean;
}

interface FooterSocialLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();

const primaryLinks: FooterPrimaryLink[] = [
  {
    label: "White Paper",
    href: "#",
    icon: FileText,
    disabled: true,
  },
  {
    label: "Forge Manual",
    href: "/terminology",
    icon: BookOpen,
  },
  {
    label: "GitHub",
    href: "https://github.com/DNO8/ScorchCoreWeb",
    icon: Github,
    external: true,
  },
  {
    label: "Enter App",
    href: "/forge",
    icon: Hammer,
    accent: true,
  },
] as const;

const socialLinks: FooterSocialLink[] = [
  { label: "X", href: "#", disabled: true },
  { label: "Instagram", href: "#", icon: Instagram, disabled: true },
  { label: "Discord", href: "#", icon: MessageCircle, disabled: true },
] as const;

const sparkPositions = [
  "left-[8%] top-[74%] h-1.5 w-1.5 rotate-12 delay-0",
  "left-[17%] top-[52%] h-1 w-3 -rotate-12 delay-150",
  "left-[26%] top-[82%] h-1.5 w-1.5 rotate-45 delay-300",
  "right-[9%] top-[66%] h-1 w-3 rotate-12 delay-500",
  "right-[20%] top-[78%] h-1.5 w-1.5 -rotate-45 delay-700",
  "right-[31%] top-[54%] h-1 w-3 rotate-45 delay-1000",
];

function FooterLink({ item }: { item: FooterPrimaryLink }) {
  const Icon = item.icon;
  const className = clsx(
    "scorch-footer-link",
    item.accent && "scorch-footer-link--accent",
    item.disabled && "is-disabled",
  );

  const content = (
    <>
      <Icon className="h-4 w-4" />
      <span>[ {item.label.toUpperCase()} ]</span>
      {item.accent ? <ArrowRight className="h-4 w-4" /> : null}
    </>
  );

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {content}
      </span>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

function SocialLink({ item }: { item: FooterSocialLink }) {
  const Icon = item.icon;

  return (
    <span
      aria-disabled={item.disabled ? "true" : undefined}
      className="scorch-footer-social"
    >
      {Icon ? (
        <Icon className="h-6 w-6" />
      ) : (
        <span className="text-4xl">X</span>
      )}
      <span className="sr-only">{item.label}</span>
    </span>
  );
}

export const Footer: React.FC<FooterProps> = ({
  className,
  compact = false,
}) => {
  return (
    <footer
      className={clsx(
        "scorch-footer alchemy-copy relative isolate overflow-hidden bg-deep-abyss text-white",
        compact ? "py-14 md:py-16" : "py-16 md:py-24",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,249,255,0.14),transparent_25%),radial-gradient(circle_at_50%_88%,rgba(240,106,18,0.22),transparent_32%),linear-gradient(180deg,#010203_0%,#020607_48%,#030806_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),transparent_18%,transparent_82%,rgba(0,0,0,0.88)),radial-gradient(ellipse_at_center,transparent_0_35%,rgba(0,0,0,0.64)_100%)]" />

      {sparkPositions.map((position) => (
        <span
          key={position}
          className={clsx("scorch-footer-spark absolute", position)}
        />
      ))}

      <div className="scorch-footer-frame relative z-[1] mx-auto w-[min(1120px,calc(100%-2rem))] px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-3 md:grid-cols-4">
          {primaryLinks.map((item) => (
            <FooterLink key={item.label} item={item} />
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center text-center md:mt-16">
          <Link href="/" aria-label="ScorchCore home" className="group">
            <Image
              src="/logo.png"
              alt=""
              width={96}
              height={96}
              className="h-20 w-20 rounded-full object-cover shadow-[0_0_38px_rgba(240,106,18,0.42)] transition duration-200 group-hover:scale-[1.03] group-hover:shadow-[0_0_52px_rgba(125,249,255,0.32)] md:h-24 md:w-24"
            />
          </Link>

          <Link href="/forge" className="scorch-footer-cta mt-8">
            <span>[ ENTER THE</span>
            <span>SCORCH HEART-LAB ]</span>
          </Link>

          <div className="mt-9 flex items-center justify-center gap-6 md:gap-8">
            {socialLinks.map((item) => (
              <SocialLink key={item.label} item={item} />
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-cyan-100/48 md:text-sm">
            Developed for the Ronin Ecosystem - ScorchCore Protocol{" "}
            {currentYear}.
          </p>
        </div>
      </div>
    </footer>
  );
};
