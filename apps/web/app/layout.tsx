import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import Script from "next/script";

import { env } from "@formbricks/lib/env";

import "./globals.css";

const SENTRY_KEY = env.NEXT_PUBLIC_SENTRY_KEY;

export const metadata: Metadata = {
  title: {
    template: "%s | Formbricks",
    default: "Formbricks",
  },
  description: "Open-Source Survey Suite",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {SENTRY_KEY && (
        <Script src={`https://js.sentry-cdn.com/${SENTRY_KEY}.min.js`} crossOrigin="anonymous" />
      )}
      {process.env.VERCEL === "1" && <SpeedInsights sampleRate={0.1} />}
      <body className="flex h-screen flex-col">{children}</body>
    </html>
  );
}
