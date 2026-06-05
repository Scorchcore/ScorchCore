import type { Metadata } from "next";
import TerminologyClient from "@/app/terminology/TerminologyClient";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
  JsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const description =
  "Learn the ScorchCore lexicon: CoreMiners, Geodes, the Elemental Forge, $CORE, $fCORE, TrustScore, Ronin, and protocol mining terms.";

const terminologyFaq = [
  {
    question: "What is a CoreMiner?",
    answer:
      "A CoreMiner is a ScorchCore NFT created through the Elemental Forge and designed to participate in $CORE mining cycles.",
  },
  {
    question: "What is a Geode?",
    answer:
      "A Geode is a crystalline NFT vessel created during the Forge process before hatching into a CoreMiner.",
  },
  {
    question: "What is TrustScore?",
    answer:
      "TrustScore is a reputation metric used by ScorchCore to support fair participation and protocol benefits.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "ScorchCore Terminology | Protocol Glossary",
  description,
  path: "/terminology",
  keywords: ["ScorchCore glossary", "CoreMiner meaning", "$CORE terms"],
});

export default function TerminologyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/terminology",
            name: "ScorchCore Terminology",
            description,
          }),
          breadcrumbJsonLd([
            { label: "Home", path: "/" },
            { label: "Terminology", path: "/terminology" },
          ]),
          faqJsonLd(terminologyFaq),
        ]}
      />
      <TerminologyClient />
    </>
  );
}
