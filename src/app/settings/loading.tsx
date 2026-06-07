"use client";

import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="w-full min-h-[100dvh] bg-[#030014] flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center justify-center p-8">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
        
        {/* Spinner */}
        <div className="relative z-10 w-16 h-16 rounded-[1.5rem] bg-card/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        <p className="mt-6 text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse relative z-10">
          Loading Settings...
        </p>
      </div>
    </div>
  );
}
