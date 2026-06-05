import type { Metadata } from "next";
import HomeClient from "@/app/HomeClient";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  HOME_FAQ,
  JsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const description =
  "ScorchCore is a deflationary Forge & Collect-to-Earn Protocol on Ronin where dormant assets become CoreMiner NFTs inside the $CORE economy.";

export const metadata: Metadata = createPageMetadata({
  title: "ScorchCore Protocol | Forge CoreMiners on Ronin",
  description,
  path: "/",
  keywords: ["digital alchemy", "CoreMiner NFT", "Ronin protocol"],
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/",
            name: "ScorchCore Protocol",
            description,
          }),
          breadcrumbJsonLd([{ label: "Home", path: "/" }]),
          faqJsonLd([...HOME_FAQ]),
        ]}
      />
      <HomeClient />
    </>
  );
}
