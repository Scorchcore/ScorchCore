"use client";

import {
  Flame,
  Gem,
  type LucideIcon,
  Pickaxe,
  Repeat2,
  Sparkles,
  TrendingDown,
  Vote,
  Wrench,
} from "lucide-react";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const DISTRIBUTION = [
  {
    label: "Mining Rewards & Staking",
    percentage: 50,
    amount: "1,050,000,000 $CORE",
    color: "from-ethereal-cyan via-cyan-300 to-magma-gold",
    dot: "bg-ethereal-cyan",
    border: "border-ethereal-cyan/45",
    description:
      "Earned by CoreMiners through active mining cycles. Staking begins in the second year.",
  },
  {
    label: "Ecosystem Treasury & DAO",
    percentage: 20,
    amount: "420,000,000 $CORE",
    color: "from-magma-gold via-yellow-300 to-orange-400",
    dot: "bg-magma-gold",
    border: "border-magma-gold/45",
    description: "Protocol treasury, DAO operations, growth, and reserves.",
  },
  {
    label: "Rewards (Adoption/Airdrops)",
    percentage: 15,
    amount: "315,000,000 $CORE",
    color: "from-magma-orange via-orange-400 to-magma-gold",
    dot: "bg-magma-orange",
    border: "border-magma-orange/45",
    description: "Adoption incentives, airdrops, and community activation.",
  },
  {
    label: "Team & Advisors",
    percentage: 10,
    amount: "210,000,000 $CORE",
    color: "from-cyan-200 via-ethereal-cyan to-magma-gold",
    dot: "bg-cyan-200",
    border: "border-cyan-200/35",
    description: "Long-term aligned contributors and advisors.",
  },
  {
    label: "Initial Liquidity (Katana)",
    percentage: 5,
    amount: "105,000,000 $CORE",
    color: "from-orange-300 via-magma-orange to-red-500",
    dot: "bg-orange-300",
    border: "border-orange-300/40",
    description: "Initial market liquidity for Katana.",
  },
];

const KEY_METRICS = [
  { label: "Total Supply", value: "2.1B", unit: "$CORE" },
  { label: "Halving Cycle", value: "Annual", unit: "-50% emission" },
  { label: "Initial Emission", value: "After-V.1", unit: "$CORE/day" },
  { label: "Circular economy", value: "Deflationary", unit: "on every forge" },
];

const HALVING_SCHEDULE = [
  { year: "Year 1", emission: "100%", mined: "525M $CORE" },
  { year: "Year 2", emission: "50%", mined: "262.5M $CORE" },
  { year: "Year 3", emission: "25%", mined: "131.25M $CORE" },
  { year: "Year 4", emission: "12.5%", mined: "65.625M $CORE" },
  { year: "Year 5", emission: "6.25%", mined: "32.812M $CORE" },
];

const UTILITY = [
  {
    icon: Pickaxe,
    title: "Upgrades",
    description:
      "Spend $CORE to upgrade CoreMiner stats, unlock abilities, and enhance mining power.",
  },
  {
    icon: Wrench,
    title: "Repairs",
    description:
      "CoreMiners degrade over time. Use $CORE to repair and maintain peak mining efficiency.",
  },
  {
    icon: Vote,
    title: "Governance",
    description:
      "Stake $CORE to vote on protocol proposals, emission rates, and ecosystem decisions.",
  },
  {
    icon: Gem,
    title: "Staking",
    description:
      "Lock $CORE for additional yield and protocol benefits including boosted TrustScore. Begins in the second mining year.",
  },
];

const FLYWHEEL = [
  {
    icon: Flame,
    title: "Forge Transmutation",
    description: "Axies + AXS + Mementos redirected to Scorchcore treasury",
  },
  {
    icon: TrendingDown,
    title: "Halving",
    description: "Annual 50% reduction in new $CORE emission",
  },
  {
    icon: Repeat2,
    title: "Buybacks",
    description: "Treasury buys and burns $CORE from the market",
  },
];

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

function TokenomicsHero() {
  return (
    <header className="mx-auto max-w-4xl text-center">
      <p className="alchemy-eyebrow mb-4 text-xs">ScorchCore Economy</p>
      <h1 className="alchemy-heading-strong text-balance text-4xl leading-tight md:text-6xl">
        Tokenomics
      </h1>
      <p className="alchemy-copy mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/72 md:text-base">
        A deflationary Forge & Collect-to-Earn Protocol with programmed scarcity
        inspired by Bitcoin.
      </p>
      <div className="mx-auto mt-7 flex w-fit items-center gap-2 border border-ethereal-cyan/25 bg-black/35 px-4 py-2 text-xs text-cyan-50/70 shadow-[0_0_24px_rgba(125,249,255,0.08)]">
        <Sparkles className="h-3.5 w-3.5 text-ethereal-cyan" />
        <span>Hard-capped ritual economy</span>
      </div>
    </header>
  );
}

function MetricGrid() {
  return (
    <section
      aria-label="Key tokenomics metrics"
      className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-4"
    >
      {KEY_METRICS.map((metric, index) => (
        <article
          key={metric.label}
          className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-magma-gold/50 md:p-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(125,249,255,0.12),transparent_58%)] opacity-70 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <p className="text-[0.65rem] font-semibold uppercase text-cyan-50/46 md:text-xs">
              {metric.label}
            </p>
            <p className="alchemy-heading-strong mt-2 break-words text-[clamp(1.18rem,3.8vw,1.6rem)] leading-tight md:text-[clamp(1.18rem,1.7vw,1.6rem)]">
              {metric.value}
            </p>
            <p className="mt-2 text-[0.68rem] text-cyan-50/52 md:text-xs">
              {metric.unit}
            </p>
            <span className="mx-auto mt-4 block h-px w-12 bg-gradient-to-r from-transparent via-magma-gold/70 to-transparent" />
            <span className="mt-2 block text-[0.62rem] text-cyan-50/28">
              0{index + 1}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

function DistributionPanel() {
  return (
    <section className="mt-18 md:mt-20">
      <SectionHeading
        eyebrow="Allocation"
        title="Token Distribution"
        description="Distribution Summary: supply is weighted toward mining, staking, treasury, adoption, team alignment, and initial Katana liquidity."
      />

      <div className="mx-auto max-w-6xl border border-cyan-100/10 bg-black/30 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-md md:p-6">
        <div
          aria-label="Token distribution percentages"
          role="img"
          className="flex h-10 overflow-hidden border border-cyan-100/12 bg-black/60 shadow-[inset_0_0_24px_rgba(125,249,255,0.06)]"
        >
          {DISTRIBUTION.map((item) => (
            <div
              key={item.label}
              className={`bg-linear-to-r ${item.color}`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.label}: ${item.percentage}%`}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {DISTRIBUTION.map((item) => (
            <article
              key={item.label}
              className={`group relative min-h-52 overflow-hidden border ${item.border} bg-black/42 p-4 shadow-[0_14px_42px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:border-magma-gold/55`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${item.color} opacity-80`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/8 via-transparent to-orange-500/8 opacity-60 transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-magma-gold/70 to-transparent" />
              <div className="relative flex h-full flex-col gap-4">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${item.dot} shadow-[0_0_18px_currentColor]`}
                />
                <div className="min-w-0">
                  <p className="alchemy-heading-strong text-3xl leading-none">
                    {item.percentage}%
                  </p>
                  <p className="mt-2 font-mono text-[0.68rem] uppercase text-cyan-50/48">
                    {item.amount}
                  </p>
                </div>
                <h3 className="font-semibold leading-snug text-cyan-50">
                  {item.label}
                </h3>
                <p className="mt-auto text-sm leading-6 text-cyan-50/58">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HalvingSchedule() {
  return (
    <section className="mt-18 md:mt-20">
      <SectionHeading
        eyebrow="Emission"
        title="Halving Schedule"
        description="Emission rate is halved every 12 months, increasing scarcity as the protocol matures."
      />

      <div className="mx-auto max-w-3xl">
        <div className="hidden overflow-hidden border border-ethereal-cyan/20 bg-black/38 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-md md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-100/12 bg-cyan-300/5">
                <th className="px-6 py-4 text-left font-semibold uppercase text-cyan-50/50">
                  Period
                </th>
                <th className="px-6 py-4 text-center font-semibold uppercase text-cyan-50/50">
                  Emission Rate
                </th>
                <th className="px-6 py-4 text-right font-semibold uppercase text-cyan-50/50">
                  Tokens Mined
                </th>
              </tr>
            </thead>
            <tbody>
              {HALVING_SCHEDULE.map((row, index) => (
                <tr
                  key={row.year}
                  className={`border-b border-cyan-100/8 last:border-b-0 ${
                    index === 0 ? "bg-orange-500/8" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-semibold text-cyan-50">
                    {row.year}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-magma-gold">
                    {row.emission}
                  </td>
                  <td className="px-6 py-4 text-right text-cyan-50/68">
                    {row.mined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {HALVING_SCHEDULE.map((row, index) => (
            <article
              key={row.year}
              className={`border bg-black/42 p-4 ${
                index === 0
                  ? "border-magma-gold/45 shadow-[0_0_28px_rgba(240,106,18,0.12)]"
                  : "border-cyan-100/12"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-cyan-50">{row.year}</h3>
                <span className="alchemy-heading text-xl">{row.emission}</span>
              </div>
              <p className="mt-2 text-xs uppercase text-cyan-50/42">
                Tokens mined
              </p>
              <p className="mt-1 text-sm text-cyan-50/70">{row.mined}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function UtilityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-ethereal-cyan/45">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-transparent to-orange-500/10 opacity-60 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center border border-cyan-100/14 bg-black/50 shadow-[0_0_22px_rgba(125,249,255,0.08)]">
          <Icon className="h-5 w-5 text-magma-gold" />
        </div>
        <h3 className="alchemy-heading text-xl leading-tight">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-cyan-50/64">{description}</p>
      </div>
    </article>
  );
}

function UtilityGrid() {
  return (
    <section className="mt-18 md:mt-20">
      <SectionHeading
        eyebrow="Utility"
        title="$CORE Utility"
        description="The token sits inside the loop of progression, maintenance, governance, staking, forging, and play."
      />

      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {UTILITY.map((item) => (
          <UtilityCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

function DeflationaryFlywheel() {
  return (
    <section className="mx-auto mt-18 max-w-4xl md:mt-20">
      <div className="relative overflow-hidden border border-magma-gold/28 bg-black/42 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(247,198,90,0.16),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(125,249,255,0.12),transparent_48%)]" />
        <div className="relative">
          <p className="alchemy-eyebrow mb-3 text-[0.68rem]">Scarcity Loop</p>
          <h2 className="alchemy-heading-strong text-3xl leading-tight">
            The Deflationary Flywheel
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {FLYWHEEL.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="relative border border-cyan-100/12 bg-black/38 p-4"
                >
                  {index < FLYWHEEL.length - 1 ? (
                    <span className="pointer-events-none absolute left-full top-1/2 hidden h-px w-4 bg-gradient-to-r from-magma-gold/55 to-ethereal-cyan/30 sm:block" />
                  ) : null}
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-orange-300/22 bg-black/55">
                    <Icon className="h-5 w-5 text-ethereal-cyan" />
                  </div>
                  <h3 className="font-semibold text-magma-gold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-cyan-50/58">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-cyan-50/68">
            Multiple deflationary forces work together to create sustainable
            long-term value. As supply decreases and utility grows, $CORE
            becomes increasingly scarce.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function TokenomicsPage() {
  return (
    <>
      <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss pt-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(247,198,90,0.14),transparent_28%),radial-gradient(circle_at_20%_30%,rgba(125,249,255,0.14),transparent_26%),radial-gradient(circle_at_82%_48%,rgba(240,106,18,0.13),transparent_30%),linear-gradient(180deg,#020607_0%,#030b0e_48%,#010203_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),transparent_20%,transparent_80%,rgba(0,0,0,0.78)),radial-gradient(ellipse_at_center,transparent_0_42%,rgba(0,0,0,0.62)_100%)]" />

        <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 pb-20 md:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tokenomics", href: "/tokenomics" },
            ]}
          />
          <TokenomicsHero />
          <MetricGrid />
          <DistributionPanel />
          <HalvingSchedule />
          <UtilityGrid />
          <DeflationaryFlywheel />
        </div>
      </main>
      <Footer />
    </>
  );
}
