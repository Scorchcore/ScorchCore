import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Mining | ScorchCore App",
);

export default function StakingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
