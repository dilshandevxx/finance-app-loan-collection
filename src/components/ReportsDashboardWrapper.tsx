"use client";

import dynamic from "next/dynamic";

// We dynamically import the ReportsDashboard with ssr: false here inside a Client Component wrapper
// because next/dynamic with ssr: false is not allowed directly in Server Components in Next.js 14+.
export const ReportsDashboardWrapper = dynamic(
  () => import("./ReportsDashboard").then((mod) => mod.ReportsDashboard),
  { ssr: false }
);
