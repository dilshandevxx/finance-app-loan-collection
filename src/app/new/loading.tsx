import { Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function NewLoanLoading() {
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-5xl mx-auto px-2 sm:px-4 pt-2 md:pt-4 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="w-full h-16 rounded-[1.75rem] bg-card/60 border border-border/50" />

      {/* Main Card Skeleton */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="h-[600px] w-full rounded-3xl bg-card/60 border border-border/50 p-6 flex flex-col gap-6">
          <div className="w-full h-12 bg-secondary/50 rounded-2xl" />
          <div className="w-full h-24 bg-secondary/50 rounded-2xl" />
          <div className="w-full h-24 bg-secondary/50 rounded-2xl" />
          <div className="w-full h-24 bg-secondary/50 rounded-2xl" />
        </div>
      </div>
      <BottomNav hideOnMobile />
    </div>
  );
}
