import type { Metadata } from "next";
import TeamClient from "@/app/team/TeamClient";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  JsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const description =
  "Meet the ScorchCore builders creating a deflationary digital alchemy protocol for Ronin gaming assets and the $CORE economy.";

export const metadata: Metadata = createPageMetadata({
  title: "ScorchCore Team | Protocol Builders",
  description,
  path: "/team",
  keywords: ["ScorchCore team", "Ronin builders", "blockchain gaming team"],
});

export default function TeamPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/team",
            name: "ScorchCore Team",
            description,
          }),
          breadcrumbJsonLd([
            { label: "Home", path: "/" },
            { label: "Team", path: "/team" },
          ]),
        ]}
      />
      <TeamClient />
    </>
  );
}
