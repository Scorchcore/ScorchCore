"use client";

import { Footer } from "@/components/layout";
import { Card } from "@/components/ui";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  links?: { label: string; url: string }[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Camilo Yonhson",
    role: "Founder & CEO",
    bio: "Visionary founder driving the strategic direction of ScorchCore Protocol. Educator in Web3, blockchain, and cryptocurrencies. Financial expert passionate about building thriving gaming economies and onboarding the next generation of blockchain users.",
    avatar: "🚀",
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
    avatar: "🧑‍💻",
    links: [
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/danilo-contreras-05597922b/",
      },
    ],
  },
];

const VALUES = [
  {
    icon: "🔥",
    title: "Burn-to-Earn Innovation",
    description:
      "We transform dormant assets into productive ones through a novel deflationary mechanism that benefits the entire ecosystem.",
  },
  {
    icon: "🤖",
    title: "Anti-Bot & Fair Play",
    description:
      "TrustScore and Proof-of-Humanity ensure real players are rewarded, not automated scripts. Fair play is non-negotiable.",
  },
  {
    icon: "♻️",
    title: "Circular Economy",
    description:
      "Every $CORE spent flows back into the ecosystem — upgrades, repairs, governance. No value leaves the flywheel.",
  },
  {
    icon: "🐕",
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

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Team
          </h1>
          <p className="text-gray-400 text-lg">
            Building the future of digital alchemy on Ronin.
          </p>
        </div>

        {/* Team Members */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <Card
                key={member.name}
                variant="glass"
                className="p-6 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 border-2 border-orange-500/30 flex items-center justify-center">
                  <span className="text-4xl">{member.avatar}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-sm text-orange-400 mb-3">{member.role}</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {member.bio}
                </p>
                {member.links && member.links.length > 0 && (
                  <div className="flex justify-center gap-3 mt-4">
                    {member.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {/* Hiring Card */}
            <Card
              variant="bordered"
              className="p-6 text-center flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                <span className="text-3xl text-gray-500">+</span>
              </div>
              <h3 className="text-lg font-bold text-gray-400">Join the Team</h3>
              <p className="text-sm text-gray-500 mt-2">
                Interested in building with us? Reach out on Discord.
              </p>
            </Card>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {VALUES.map((value) => (
              <Card key={value.title} variant="glass" hover className="p-6">
                <div className="text-4xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Roadmap
          </h2>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MILESTONES.map((milestone, idx) => (
              <Card
                key={milestone.phase}
                variant={idx === 0 ? "gradient" : "glass"}
                className="p-6"
              >
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                  {milestone.phase}
                </p>
                <h3 className="text-lg font-bold text-white mb-4">
                  {milestone.title}
                </h3>
                <ul className="space-y-2">
                  {milestone.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto">
          <Card variant="gradient" className="p-8 md:p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Join the Community
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              ScorchCore is built by and for the community. Follow our progress,
              contribute ideas, and be part of the future of digital alchemy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span
                aria-disabled="true"
                className="cursor-default rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 text-sm font-medium text-gray-500"
              >
                Discord
              </span>
              <span
                aria-disabled="true"
                className="cursor-default rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 text-sm font-medium text-gray-500"
              >
                Twitter / X
              </span>
              <a
                href="https://github.com/DNO8/ScorchCoreWeb"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                GitHub
              </a>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
