import { BottomNav } from "@/components/BottomNav";

export default function VillagesLoading() {
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-4xl mx-auto px-2 sm:px-4 pt-2 sm:pt-4 min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="w-full h-16 rounded-[1.75rem] bg-card/60 border border-border/50" />

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Card 1 Skeleton */}
        <div className="h-64 bg-card/60 border border-border/50 rounded-3xl" />
        
        {/* Card 2 Skeleton */}
        <div className="h-96 bg-card/60 border border-border/50 rounded-3xl" />
      </div>

      <BottomNav />
    </div>
  );
}
