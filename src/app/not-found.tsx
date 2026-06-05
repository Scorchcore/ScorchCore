import { ArrowRight, Compass, Home } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout";

const recoveryLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Tokenomics", href: "/tokenomics", icon: ArrowRight },
  { label: "Terminology", href: "/terminology", icon: ArrowRight },
  { label: "Team", href: "/team", icon: ArrowRight },
] as const;

export default function NotFound() {
  return (
    <>
      <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss px-4 pt-28 text-white md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(240,106,18,0.18),transparent_30%),radial-gradient(circle_at_50%_72%,rgba(125,249,255,0.12),transparent_34%),linear-gradient(180deg,#020607_0%,#030b0e_48%,#010203_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),transparent_20%,transparent_80%,rgba(0,0,0,0.78)),radial-gradient(ellipse_at_center,transparent_0_42%,rgba(0,0,0,0.62)_100%)]" />

        <section className="relative z-1 mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col items-center justify-center pb-20 text-center">
          <div className="mb-7 flex h-16 w-16 items-center justify-center border border-magma-gold/45 bg-black/48 shadow-[0_0_34px_rgba(240,106,18,0.18)]">
            <Compass className="h-7 w-7 text-magma-gold" />
          </div>
          <p className="alchemy-eyebrow mb-4 text-xs">Signal Lost</p>
          <h1 className="alchemy-heading-strong text-balance text-5xl leading-none md:text-7xl">
            404
          </h1>
          <h2 className="alchemy-heading mt-5 text-balance text-2xl leading-tight md:text-4xl">
            This forge route is inactive
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-cyan-50/68 md:text-base">
            The page may have moved, or the requested ritual never existed.
            Return to an indexed ScorchCore surface and keep exploring the
            protocol.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {recoveryLinks.map((item) => {
              const Icon = item.icon;
              const isPrimary = item.href === "/";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isPrimary
                      ? "inline-flex min-h-11 items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-5 py-3 text-xs font-semibold uppercase text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      : "inline-flex min-h-11 items-center gap-2 border border-cyan-100/12 bg-black/42 px-5 py-3 text-xs font-semibold uppercase text-cyan-50/66 transition-all hover:border-magma-gold/55 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
