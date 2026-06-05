import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Cinzel_Decorative, Roboto_Mono } from "next/font/google";
import "./globals.css";
import LoaderWrapper from "@/components/landing/LoaderWrapper";
import { Header } from "@/components/layout";
import { Web3Provider } from "@/lib/providers/Web3Provider";
import {
  createPageMetadata,
  JsonLd,
  organizationJsonLd,
  SITE_NAME,
  SITE_URL,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel-decorative",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "ScorchCore Protocol | Digital Alchemy on Ronin",
  }),
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: "ScorchCore Team" }],
  creator: "ScorchCore Team",
  publisher: "ScorchCore Protocol",
  category: "Blockchain gaming",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzelDecorative.variable} ${robotoMono.variable} font-sans antialiased bg-black`}
      >
        <JsonLd
          data={[
            organizationJsonLd(),
            websiteJsonLd(),
            softwareApplicationJsonLd(),
          ]}
        />
        <Web3Provider>
          <LoaderWrapper />
          <Header />
          {children}
        </Web3Provider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
