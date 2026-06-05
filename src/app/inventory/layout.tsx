import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Inventory | ScorchCore App",
);

export default function InventoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
