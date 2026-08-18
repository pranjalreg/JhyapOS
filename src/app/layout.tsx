import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { WaitlistProvider } from "@/components/waitlist/waitlist-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-jb",
  weight: ["400", "500"],
});

const SITE = "https://jhyapos.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "JhyapOS — An AI-native workspace",
    template: "%s — JhyapOS",
  },
  description:
    "JhyapOS is an AI-native workspace built for research, creation, and the work that happens between the tools.",
  keywords: [
    "AI workspace",
    "research tools",
    "AI agents",
    "knowledge work",
    "AI-native",
    "JhyapOS",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "JhyapOS",
    title: "JhyapOS — An AI-native workspace",
    description:
      "AI shouldn't just answer you. It should work with you. JhyapOS is an AI-native workspace for research, creation, and the work that happens between the tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JhyapOS — An AI-native workspace",
    description:
      "AI shouldn't just answer you. It should work with you.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060708",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-void text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-void"
        >
          Skip to content
        </a>
        <WaitlistProvider>{children}</WaitlistProvider>
      </body>
    </html>
  );
}
