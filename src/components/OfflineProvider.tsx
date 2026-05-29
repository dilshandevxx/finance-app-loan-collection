"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { markInstallmentPaid } from "@/app/actions";
import { Wifi, WifiOff, Loader2, CheckCircle } from "lucide-react";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [showSyncedSuccess, setShowSyncedSuccess] = useState(false);
  const syncingRef = useRef(false);

  const updateQueueLength = () => {
    if (typeof window !== "undefined") {
      try {
        const queueStr = localStorage.getItem("offlineSyncQueue");
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          setQueueLength(queue.length);
          return queue.length;
        } else {
          setQueueLength(0);
          return 0;
        }
      } catch (e) {
        setQueueLength(0);
        return 0;
      }
    }
    return 0;
  };

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);
    updateQueueLength();

    const triggerSync = async () => {
      if (!navigator.onLine || syncingRef.current) return;
      
      try {
        const queueStr = localStorage.getItem("offlineSyncQueue");
        if (!queueStr) return;
        const queue = JSON.parse(queueStr);
        if (queue.length === 0) return;

        syncingRef.current = true;
        setIsOffline(false);
        setIsSyncing(true);

        const failedItems = [];
        
        // Process queue item by item
        for (const item of queue) {
          try {
            if (item.type === "markInstallmentPaid") {
              const res = await markInstallmentPaid(item.installmentId);
              if (res && res.error) {
                throw new Error(res.error);
              }
            }
          } catch (err) {
            console.error("Failed to sync offline item:", item, err);
            failedItems.push(item);
          }
        }
        
        // Only keep failed items in the queue
        if (failedItems.length > 0) {
          localStorage.setItem("offlineSyncQueue", JSON.stringify(failedItems));
        } else {
          localStorage.removeItem("offlineSyncQueue");
        }
        
        updateQueueLength();
        
        // Show success alert if all synced successfully
        if (failedItems.length === 0) {
          setShowSyncedSuccess(true);
          router.refresh();
          window.dispatchEvent(new CustomEvent("local-cache-updated"));
          setTimeout(() => {
            setShowSyncedSuccess(false);
          }, 4000);
        }
      } catch (e) {
        console.error("Failed to sync offline queue", e);
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleQueueUpdated = () => {
      const len = updateQueueLength();
      if (navigator.onLine && len > 0) {
        triggerSync();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen to custom queue update events from QuickPaymentModal
    window.addEventListener("offline-queue-updated", handleQueueUpdated);

    // Also poll queue length & auto-sync every 1.5 seconds in case storage updates in background
    const interval = setInterval(() => {
      const len = updateQueueLength();
      if (navigator.onLine && len > 0) {
        triggerSync();
      }
    }, 1500);

    // Initial check on mount
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-queue-updated", handleQueueUpdated);
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
          <div className="bg-primary text-primary-foreground border border-primary/20 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
            <span>Syncing {queueLength > 0 ? `${queueLength} payment(s)...` : "database..."}</span>
          </div>
        )}

        {/* Synced Success Banner */}
        {showSyncedSuccess && !isOffline && !isSyncing && (
          <div className="bg-primary text-primary-foreground border border-primary/20 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
            <CheckCircle className="w-4 h-4 text-primary-foreground" />
            <span>All payments synced online successfully!</span>
          </div>
        )}

      </div>

      {children}
    </>
  );
}
