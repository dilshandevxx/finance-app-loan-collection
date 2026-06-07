import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-xs font-black text-muted-foreground animate-pulse tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
