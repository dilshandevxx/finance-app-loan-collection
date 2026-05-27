"use client";

import { useEffect, useState } from "react";
import { markInstallmentPaid } from "@/app/actions";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = async () => {
      setIsOffline(false);
      setIsSyncing(true);
      
      try {
        const queueStr = localStorage.getItem("offlineSyncQueue");
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          if (queue.length > 0) {
            // Process queue
            for (const item of queue) {
              if (item.type === "markInstallmentPaid") {
                await markInstallmentPaid(item.installmentId);
              }
            }
            // Clear queue
            localStorage.removeItem("offlineSyncQueue");
          }
        }
      } catch (e) {
        console.error("Failed to sync offline queue", e);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount in case they come back online before mount
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg animate-in slide-in-from-top-4">
          <WifiOff className="w-4 h-4" /> Offline Mode
        </div>
      )}
      
      {isSyncing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg animate-in fade-in zoom-in-95">
          <Wifi className="w-4 h-4" /> Syncing...
        </div>
      )}

      {children}
    </>
  );
}
