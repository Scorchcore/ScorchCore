import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Economy | ScorchCore App",
);

export default function EconomyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
