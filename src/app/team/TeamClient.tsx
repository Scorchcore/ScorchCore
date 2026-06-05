"use client";

import {
  Check,
  Code2,
  ExternalLink,
  Flame,
  Github,
  HeartHandshake,
  Linkedin,
  type LucideIcon,
  MessagesSquare,
  Repeat2,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  icon: LucideIcon;
  accent: "orange" | "cyan";
  links?: { label: string; url: string }[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Camilo Yonhson",
    role: "Founder & CEO",
    bio: "Visionary founder driving the strategic direction of ScorchCore Protocol. Educator in Web3, blockchain, and cryptocurrencies. Financial expert passionate about building thriving gaming economies and onboarding the next generation of blockchain users.",
    icon: Rocket,
    accent: "orange",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/camilo-yonhson-cisternas-159451288/",
      },
    ],
  },
  {
    name: "Danilo Contreras",
    role: "CTO & Lead Developer",
    bio: "Full-stack blockchain developer with a passion for building sustainable gaming economies on Ronin. Architect of the ScorchCore Protocol.",
    icon: Code2,
    accent: "cyan",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/danilo-contreras-05597922b/",
      },
    ],
  },
  {
    name: "Christian Pérez de Arce",
    role: "Software Engineer",
    bio: "Software engineer focused on turning advanced technologies into clear, useful digital experiences. He leads web design for ScorchCore, combining blockchain expertise, AI-powered SaaS architecture experience, and a user-centered design philosophy.",
    icon: Sparkles,
    accent: "orange",
  },
];

const VALUES = [
  {
    icon: Flame,
    title: "Burn-to-Earn Innovation",
    description:
      "We transform dormant assets into productive ones through a novel deflationary mechanism that benefits the entire ecosystem.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Bot & Fair Play",
    description:
      "TrustScore and Proof-of-Humanity ensure real players are rewarded, not automated scripts. Fair play is non-negotiable.",
  },
  {
    icon: Repeat2,
    title: "Circular Economy",
    description:
      "Every $CORE spent flows back into the ecosystem — upgrades, repairs, governance. No value leaves the flywheel.",
  },
  {
    icon: HeartHandshake,
    title: "Social Impact",
    description:
      "A portion of protocol revenue is donated to animal shelters. Gaming can be a force for good in the real world.",
  },
];

const MILESTONES = [
  {
    phase: "Phase 1",
    title: "Foundation",
    items: [
      "Smart Contract Development",
      "Core Protocol Design",
      "Website & Landing Page",
      "Community Building",
    ],
  },
  {
    phase: "Phase 2",
    title: "Launch",
    items: [
      "Elemental Forge goes live",
      "CoreMiner NFT Minting",
      "$CORE Mining begins",
      "Marketplace Integration",
    ],
  },
  {
    phase: "Phase 3",
    title: "Expansion",
    items: [
      "Minigames (F2P)",
      "PvP Arena",
      "Scholarship System 2.0",
      "DAO Governance",
    ],
  },
  {
    phase: "Phase 4",
    title: "Evolution",
    items: [
      "Cross-chain expansion",
      "Mobile app",
      "Strategic partnerships",
      "Community-driven features",
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="alchemy-eyebrow mb-3 text-[0.68rem]">{eyebrow}</p>
      <h2 className="alchemy-heading text-balance text-3xl leading-tight md:text-4xl">
        {title}
      </h2>
      <p className="alchemy-copy mx-auto mt-4 max-w-2xl text-pretty text-sm leading-7 text-cyan-50/64">
        {description}
      </p>
    </div>
  );
}

function TeamHero() {
  return (
    <header className="mx-auto max-w-4xl text-center">
      <p className="alchemy-eyebrow mb-4 text-xs">ScorchCore Builders</p>
      <h1 className="alchemy-heading-strong text-balance text-4xl leading-tight md:text-6xl">
        Team
      </h1>
      <p className="alchemy-copy mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/72 md:text-base">
        Building the future of digital alchemy on Ronin.
      </p>
      <div className="mx-auto mt-7 flex w-fit items-center gap-2 border border-ethereal-cyan/25 bg-black/35 px-4 py-2 text-xs text-cyan-50/70 shadow-[0_0_24px_rgba(125,249,255,0.08)]">
        <UsersRound className="h-3.5 w-3.5 text-ethereal-cyan" />
        <span>{TEAM_MEMBERS.length} core contributors indexed</span>
      </div>
    </header>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const Icon = member.icon;
  const isCyan = member.accent === "cyan";

  return (
    <article
      className={`group relative overflow-hidden border bg-black/42 p-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md transition-all hover:-translate-y-0.5 md:p-6 ${
        isCyan
          ? "border-ethereal-cyan/35 hover:border-ethereal-cyan/55"
          : "border-magma-gold/35 hover:border-magma-gold/55"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-75 transition-opacity group-hover:opacity-100 ${
          isCyan
            ? "bg-[radial-gradient(circle_at_50%_0%,rgba(125,249,255,0.16),transparent_58%)]"
            : "bg-[radial-gradient(circle_at_50%_0%,rgba(247,198,90,0.16),transparent_58%)]"
        }`}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/70 to-transparent" />

      <div className="relative">
        <div className="mx-auto mb-5 grid h-24 w-24 place-items-center border border-cyan-100/14 bg-black/55 shadow-[0_0_32px_rgba(125,249,255,0.1)]">
          <div className="grid h-18 w-18 place-items-center border border-magma-gold/30 bg-black/60">
            <Icon
              className={`h-7 w-7 ${
                isCyan ? "text-ethereal-cyan" : "text-magma-gold"
              }`}
            />
          </div>
        </div>
        <p className="mb-2 text-[0.65rem] font-semibold uppercase text-cyan-50/38">
          {getInitials(member.name)}
        </p>
        <h2 className="alchemy-heading text-xl leading-tight">{member.name}</h2>
        <p className="mt-2 text-xs font-semibold uppercase text-ethereal-cyan/78">
          {member.role}
        </p>
        <p className="mt-4 text-sm leading-7 text-cyan-50/64">{member.bio}</p>

        {member.links && member.links.length > 0 ? (
          <div className="mt-5 flex justify-center gap-3">
            {member.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-cyan-100/14 bg-black/42 px-4 py-2 text-xs font-semibold uppercase text-cyan-50/66 transition-all hover:border-magma-gold/55 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Linkedin className="h-4 w-4" />
                <span>{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamGrid() {
  return (
    <section className="mt-10 md:mt-12">
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function ValuesGrid() {
  return (
    <section className="mt-18 md:mt-20">
      <SectionHeading
        eyebrow="Principles"
        title="Our Values"
        description="The team is building around durable systems: fair participation, circular utility, deflationary pressure, and community-aligned impact."
      />

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {VALUES.map((value) => {
          const Icon = value.icon;
          return (
            <article
              key={value.title}
              className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-ethereal-cyan/45 md:p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-300/10 via-transparent to-orange-500/10 opacity-60 transition-opacity group-hover:opacity-100" />
              <div className="relative flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-cyan-100/14 bg-black/50 shadow-[0_0_22px_rgba(125,249,255,0.08)]">
                  <Icon className="h-5 w-5 text-magma-gold" />
                </div>
                <div>
                  <h3 className="alchemy-heading text-xl leading-tight">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-cyan-50/64">
                    {value.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="mt-18 md:mt-20">
      <SectionHeading
        eyebrow="Trajectory"
        title="Roadmap"
        description="A phased build path from protocol foundation to launch, expansion, and community-driven evolution."
      />

      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MILESTONES.map((milestone, index) => (
          <article
            key={milestone.phase}
            className={`relative overflow-hidden border bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-md ${
              index === 0
                ? "border-magma-gold/45 shadow-[0_0_32px_rgba(240,106,18,0.1)]"
                : "border-cyan-100/12"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(247,198,90,0.12),transparent_55%)]" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="border border-cyan-100/12 bg-black/42 px-3 py-1 text-[0.65rem] font-semibold uppercase text-cyan-50/58">
                  {milestone.phase}
                </span>
                <span className="text-xs text-cyan-50/30">0{index + 1}</span>
              </div>
              <h3 className="alchemy-heading text-xl leading-tight">
                {milestone.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {milestone.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-6 text-cyan-50/64"
                  >
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-ethereal-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CommunityCta() {
  return (
    <section className="mx-auto mt-18 max-w-4xl md:mt-20">
      <div className="relative overflow-hidden border border-magma-gold/28 bg-black/42 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(247,198,90,0.16),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(125,249,255,0.12),transparent_48%)]" />
        <div className="relative">
          <p className="alchemy-eyebrow mb-3 text-[0.68rem]">Community</p>
          <h2 className="alchemy-heading-strong text-3xl leading-tight">
            Join the Community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cyan-50/68">
            ScorchCore is built by and for the community. Follow our progress,
            contribute ideas, and be part of the future of digital alchemy.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 border border-cyan-100/12 bg-black/42 px-5 py-3 text-xs font-semibold uppercase text-cyan-50/36"
            >
              <MessagesSquare className="h-4 w-4" />
              Discord
            </button>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 border border-cyan-100/12 bg-black/42 px-5 py-3 text-xs font-semibold uppercase text-cyan-50/36"
            >
              <Sparkles className="h-4 w-4" />
              Twitter / X
            </button>
            <a
              href="https://github.com/DNO8/ScorchCoreWeb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border border-ethereal-cyan/25 bg-black/42 px-5 py-3 text-xs font-semibold uppercase text-cyan-50/72 transition-all hover:border-magma-gold/60 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Github className="h-4 w-4" />
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TeamPage() {
  return (
    <>
      <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss pt-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(125,249,255,0.16),transparent_30%),radial-gradient(circle_at_22%_32%,rgba(240,106,18,0.14),transparent_28%),radial-gradient(circle_at_78%_42%,rgba(247,198,90,0.1),transparent_28%),linear-gradient(180deg,#020607_0%,#030b0e_48%,#010203_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),transparent_20%,transparent_80%,rgba(0,0,0,0.78)),radial-gradient(ellipse_at_center,transparent_0_42%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-1 mx-auto w-full max-w-6xl px-4 pb-20 md:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Team", href: "/team" },
            ]}
          />
          <TeamHero />
          <TeamGrid />
          <ValuesGrid />
          <Roadmap />
          <CommunityCta />
        </div>
      </main>
      <Footer />
    </>
  );
}
