import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Collection | ScorchCore",
);

export default function CollectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
