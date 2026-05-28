import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on mobile inputs
}

import { ThemeProvider } from "@/components/ThemeProvider";
import { OfflineProvider } from "@/components/OfflineProvider";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 pb-24 md:pb-0 relative overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <OfflineProvider>
            {/* Ambient background glows for premium desktop look */}
            <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none z-0" />
            <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] pointer-events-none z-0" />

            <main className="flex-1 max-w-md md:max-w-6xl mx-auto w-full px-2.5 sm:px-4 md:px-8 pt-8 md:pl-32 relative z-10">
              {children}
            </main>
            <InstallPrompt />
          </OfflineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
