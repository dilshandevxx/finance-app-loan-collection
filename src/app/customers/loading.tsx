export default function CustomersLoading() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-2 sm:pt-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="w-full h-24 rounded-[2rem] bg-card/60 border border-border/50 mb-4" />
      
      {/* Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="h-14 flex-1 rounded-[1.5rem] bg-card/60 border border-border/50" />
        <div className="h-14 w-full sm:w-[200px] rounded-[1.5rem] bg-card/60 border border-border/50 shrink-0" />
      </div>

      {/* Tabs Skeleton */}
      <div className="h-12 w-full max-w-md mx-auto rounded-[1.25rem] bg-secondary/50" />

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[140px] rounded-[2rem] bg-card/60 border border-border/50" />
        ))}
      </div>
    </div>
  );
}
