import { ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

export default function FeedLoading() {
  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-28 md:pb-12 px-4 pt-6 min-h-screen max-w-[1400px] mx-auto animate-pulse">
      
      {/* ── Header Skeleton ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-secondary/50 w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-primary/50" />
              <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
            </div>
            <div className="h-4 w-64 bg-secondary/30 rounded mt-2" />
          </div>
        </div>
      </div>

      {/* ── Content Skeleton ───────────────────────────────────────── */}
      <div className="rounded-[2rem] bg-card/60 border border-border/50 p-6 lg:p-8 min-h-[500px]">
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-secondary/30 rounded-2xl" />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
