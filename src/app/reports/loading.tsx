import { BottomNav } from "@/components/BottomNav";

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6 pb-24 animate-pulse">
      <header className="w-full flex items-center justify-between bg-card/60 p-5 rounded-[1.75rem] border border-border/50 shadow-sm relative overflow-hidden mb-2 max-w-5xl mx-auto h-16" />

      <div className="md:hidden px-4">
        <div className="w-full h-32 bg-card/60 rounded-[2rem] border border-border/50" />
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 h-96 bg-card/60 rounded-[2rem] border border-border/50" />
      
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
