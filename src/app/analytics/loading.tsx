import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

export default function AnalyticsLoading() {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-28 md:pb-12 px-4 pt-6 min-h-screen max-w-[1400px] mx-auto animate-pulse">
      
      {/* ── Header Skeleton ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-secondary/50 w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400/50" />
              <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
            </div>
            <div className="h-4 w-64 bg-secondary/30 rounded mt-2" />
          </div>
        </div>
      </div>

      {/* ── Content Grid Skeleton ──────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:gap-8">
        
        {/* Row 1: Summary Skeleton */}
        <div className="w-full h-32 rounded-[2rem] bg-card/60 border border-border/50" />

        {/* Row 2: Chart Skeleton */}
        <div className="rounded-[2rem] bg-card/60 border border-border/50 p-6 lg:p-8 h-[380px]" />

        {/* Row 3: Actionable Cards side-by-side Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="h-48 rounded-[2rem] bg-card/60 border border-border/50" />
          <div className="h-48 rounded-[2rem] bg-card/60 border border-border/50" />
        </div>

        {/* Row 4: Village Breakdown Skeleton */}
        <div className="w-full h-64 rounded-[2rem] bg-card/60 border border-border/50" />

      </div>

      <BottomNav />
    </div>
  );
}
