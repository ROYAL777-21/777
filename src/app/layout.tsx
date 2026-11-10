import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Scroll Academy — Gamified Bible Study",
  description:
    "Learn Biblical Greek, Hebrew, manuscripts, apologetics and the great denominations with Duolingo-style gamification: streaks, XP, hearts, leagues and quests.",
  applicationName: "Scroll Academy",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Scroll Academy",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/scroll-icon.svg",
    apple: "/scroll-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // pinch-zoom stays available (WCAG 1.4.4); double-tap zoom on lesson
  // buttons is already suppressed by `touch-action: manipulation` in CSS
  userScalable: true,
  viewportFit: "cover", // iPhone notch + home indicator support
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff9ec" },
    { media: "(prefers-color-scheme: dark)", color: "#fff9ec" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
