import type { Metadata } from "next";

export const SITE_URL = "https://scorchcore.xyz";
export const SITE_NAME = "ScorchCore Protocol";
export const SITE_HANDLE = "@ScorchCoreLatam";

export const PUBLIC_ROUTES = [
  {
    path: "/",
    label: "Home",
    priority: 1,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/tokenomics",
    label: "Tokenomics",
    priority: 0.85,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/terminology",
    label: "Terminology",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/team",
    label: "Team",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
] satisfies Array<{
  path: string;
  label: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}>;

const defaultDescription =
  "ScorchCore is a deflationary Forge & Collect-to-Earn Protocol on Ronin where dormant assets become CoreMiners that participate in the $CORE economy.";

const defaultKeywords = [
  "ScorchCore",
  "Ronin",
  "CoreMiner",
  "$CORE",
  "Axie Infinity",
  "Forge and Collect-to-Earn",
  "NFT mining",
  "blockchain gaming",
];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description = defaultDescription,
  path = "/",
  keywords = [],
  image = "/icon.png",
}: {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: absoluteUrl(image),
          width: 512,
          height: 512,
          alt: `${SITE_NAME} brand mark`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: SITE_HANDLE,
      creator: SITE_HANDLE,
      images: [absoluteUrl(image)],
    },
  };
}

export function createNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(data).replace(/</g, "\\u003c")}
    </script>
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    sameAs: [
      "https://github.com/Scorchcore/ScorchCore",
      "https://x.com/ScorchCoreLatam",
      "https://www.instagram.com/prospectorzero",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en",
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software-application`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description: defaultDescription,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function webPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#software-application`,
    },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(
  items: Array<{ label: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export const HOME_FAQ = [
  {
    question: "What is ScorchCore Protocol?",
    answer:
      "ScorchCore is a deflationary Forge & Collect-to-Earn Protocol on Ronin that transforms dormant assets into productive CoreMiner NFTs.",
  },
  {
    question: "What are CoreMiners?",
    answer:
      "CoreMiners are NFTs created through the Elemental Forge. They are designed to participate in mining cycles and the broader $CORE economy.",
  },
  {
    question: "What is $CORE used for?",
    answer:
      "$CORE is the native utility token planned for upgrades, repairs, staking, governance, forge activity, and protocol minigames.",
  },
  {
    question: "Why does ScorchCore use Ronin?",
    answer:
      "Ronin is an EVM-compatible gaming blockchain built for fast, low-cost transactions and strong gaming ecosystem distribution.",
  },
] as const;

export const TOKENOMICS_FAQ = [
  {
    question: "What is the total $CORE supply?",
    answer:
      "$CORE is presented with a hard-capped supply of 2.1 billion tokens in the current ScorchCore tokenomics model.",
  },
  {
    question: "How does the $CORE halving work?",
    answer:
      "The tokenomics page describes an annual emission reduction model where the emission rate is halved every 12 months.",
  },
  {
    question: "What creates deflationary pressure?",
    answer:
      "ScorchCore combines forge burns, programmed emission reductions, protocol utility, and buyback mechanisms as its planned scarcity loop.",
  },
] as const;
