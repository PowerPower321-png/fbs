import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FB ROI Calculator: Stop Wasting $5k/mo",
  description: "Instant Facebook Ads ROI Calculator. Check ROAS, LTV, and CPA instantly. Stop burning budget.",
  applicationName: "FB ROI Checker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FB ROI Checker",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "FB ROI Checker",
    title: "FB ROI Calculator: Stop Wasting $5k/mo",
    description: "Instant Facebook Ads ROI Calculator. Check ROAS, LTV, and CPA instantly. Stop burning budget.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <div className="min-h-screen flex flex-col bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

