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
    <main className="flex-1 w-full mx-auto max-w-md px-2.5 sm:px-4 pt-4 pb-24 relative z-10 md:max-w-[1600px] md:px-8 md:pl-[280px] md:pb-8 [@media(pointer:fine)]:max-w-[1600px] [@media(pointer:fine)]:px-8 [@media(pointer:fine)]:pl-[280px] [@media(pointer:fine)]:pb-8">
      {children}
    </main>
  );
}
