import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Forge | ScorchCore App",
);

export default function ForgeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
