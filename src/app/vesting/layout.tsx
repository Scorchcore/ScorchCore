import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Vesting | ScorchCore App",
);

export default function VestingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
