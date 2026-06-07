"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths that should not have the dashboard layout constraints
  const isAuthOrWelcome = pathname?.startsWith("/login") || pathname?.startsWith("/welcome");

  if (isAuthOrWelcome) {
    return <main className="flex-1 w-full relative z-10">{children}</main>;
  }

  // Dashboard layout wrapper
  return (
    <main className="flex-1 w-full mx-auto max-w-md md:max-w-[1600px] px-2.5 sm:px-4 md:px-8 pt-4 md:pl-24 relative z-10">
      {children}
    </main>
  );
}
