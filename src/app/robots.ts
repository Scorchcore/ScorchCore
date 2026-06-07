import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/analytics",
        "/collection",
        "/dashboard",
        "/economy",
        "/forge",
        "/inventory",
        "/staking",
        "/trustscore",
        "/vesting",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
