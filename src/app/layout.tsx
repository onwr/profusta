import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${APP_NAME} — Ev Teknik Servis Platformu`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Klima, kombi, elektrik ve daha fazlası için güvenilir usta bulun. Talep oluşturun veya ilanlardan hizmet alın.",
  keywords: [
    "usta",
    "teknik servis",
    "klima",
    "kombi",
    "elektrikçi",
    "ev hizmeti",
    "ProfUSTA",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: APP_NAME,
    title: `${APP_NAME} — Ev Teknik Servis Platformu`,
    description:
      "Güvenilir usta bulun, talep oluşturun veya hizmet ilanlarından yararlanın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col antialiased"
        suppressHydrationWarning
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
