import { ArrowLeft, UserCircle2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function EditCustomerLoading() {
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-5xl mx-auto px-2 sm:px-4 pt-2 md:pt-4 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="w-full h-16 rounded-[1.75rem] bg-card/60 border border-border/50" />

      {/* Main Card Skeleton */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="rounded-3xl bg-card/60 border border-border/50 p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2 mb-2">
            <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
            <div className="h-4 w-32 bg-secondary/30 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 col-span-2 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
            <div className="h-16 col-span-2 sm:col-span-1 bg-secondary/30 rounded-2xl" />
          </div>
          
          <div className="h-14 w-full bg-secondary/50 rounded-2xl mt-4" />
        </div>
      </div>
      <BottomNav hideOnMobile />
    </div>
  );
}
