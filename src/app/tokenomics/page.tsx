import type { Metadata } from "next";
import TokenomicsClient from "@/app/tokenomics/TokenomicsClient";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  JsonLd,
  TOKENOMICS_FAQ,
  webPageJsonLd,
} from "@/lib/seo";

const description =
  "Explore ScorchCore tokenomics: $CORE supply, emission halvings, utility, allocation, and the deflationary flywheel behind the protocol economy.";

export const metadata: Metadata = createPageMetadata({
  title: "ScorchCore Tokenomics | $CORE Supply and Utility",
  description,
  path: "/tokenomics",
  keywords: ["$CORE tokenomics", "halving emission", "deflationary token"],
});

export default function TokenomicsPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/tokenomics",
            name: "ScorchCore Tokenomics",
            description,
          }),
          breadcrumbJsonLd([
            { label: "Home", path: "/" },
            { label: "Tokenomics", path: "/tokenomics" },
          ]),
          faqJsonLd([...TOKENOMICS_FAQ]),
        ]}
      />
      <TokenomicsClient />
    </>
  );
}
