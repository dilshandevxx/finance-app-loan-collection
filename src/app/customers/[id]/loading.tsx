import { ArrowLeft } from "lucide-react";

export default function CustomerDetailLoading() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-2xl mx-auto w-full px-4 pt-4 animate-pulse">
      {/* Back button & Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-card/60 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-muted-foreground/30" />
        </div>
        <div className="w-32 h-6 rounded-md bg-card/60" />
      </div>
      
      {/* Profile Card Skeleton */}
      <div className="w-full h-64 rounded-[2.5rem] bg-card/60 border border-border/50 mt-2" />

      {/* Tabs Skeleton */}
      <div className="h-14 w-full rounded-[1.5rem] bg-secondary/50 mt-2" />

      {/* List Skeleton */}
      <div className="flex flex-col gap-4 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-[1.75rem] bg-card/60 border border-border/50" />
        ))}
      </div>
    </div>
  );
}
