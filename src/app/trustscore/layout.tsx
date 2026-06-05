import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "TrustScore | ScorchCore App",
);

export default function TrustScoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
