"use client";

import { useEffect, useState } from "react";
import { markInstallmentPaid } from "@/app/actions";
import { Wifi, WifiOff, Loader2, CheckCircle } from "lucide-react";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [showSyncedSuccess, setShowSyncedSuccess] = useState(false);

  const updateQueueLength = () => {
    if (typeof window !== "undefined") {
      try {
        const queueStr = localStorage.getItem("offlineSyncQueue");
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          setQueueLength(queue.length);
        } else {
          setQueueLength(0);
        }
      } catch (e) {
        setQueueLength(0);
      }
    }
  };

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);
    updateQueueLength();

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
            updateQueueLength();
            
            // Show brief success alert
            setShowSyncedSuccess(true);
            setTimeout(() => {
              setShowSyncedSuccess(false);
            }, 4000);
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

    // Listen to custom queue update events from QuickPaymentModal
    window.addEventListener("offline-queue-updated", updateQueueLength);

    // Also poll queue length every 1.5 seconds in case storage updates in background
    const interval = setInterval(updateQueueLength, 1500);

    // Initial check on mount
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-queue-updated", updateQueueLength);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Floating Status Banners */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        
        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-orange-600 dark:bg-orange-500 border border-orange-500/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-2xl animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Offline Mode</span>
            {queueLength > 0 && (
              <span className="bg-black/30 text-white px-2 py-0.5 rounded-full text-[10px]">
                {queueLength} Sync{queueLength > 1 ? "s" : ""} Pending
              </span>
            )}
          </div>
        )}
        
        {/* Syncing Banner */}
        {isSyncing && (
          <div className="bg-neon-lime text-black border border-neon-lime/20 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Syncing {queueLength > 0 ? `${queueLength} payment(s)...` : "database..."}</span>
          </div>
        )}

        {/* Synced Success Banner */}
        {showSyncedSuccess && !isOffline && !isSyncing && (
          <div className="bg-neon-lime text-black border border-neon-lime/20 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>All payments synced online successfully!</span>
          </div>
        )}

      </div>

      {children}
    </>
  );
}
