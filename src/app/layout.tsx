import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: config.appShortName,
  },
};

export const viewport: Viewport = {
  themeColor: "#07050F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on mobile inputs
}

import { ThemeProvider } from "@/components/ThemeProvider";
import { OfflineProvider } from "@/components/OfflineProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased bg-background`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 md:pb-0 relative overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <OfflineProvider>
            {/* Ambient violet glow blobs — Deep Violet Pro */}
            <div className="fixed top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/5 dark:bg-violet-500/8 blur-[140px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/4 dark:bg-indigo-400/6 blur-[120px] pointer-events-none z-0" />

            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <InstallPrompt />
          </OfflineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
