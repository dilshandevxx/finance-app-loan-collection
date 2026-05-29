"use client";

import { useState, useEffect } from "react";
import { X, Download, Share2, PlusSquare } from "lucide-react";
import { config } from "@/lib/config";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // 2. Check if dismissed before
    const isDismissed = localStorage.getItem("pwa_install_dismissed") === "true";
    if (isDismissed) return;

    // 3. Listen for Android/Chrome PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setPlatform("android");
      setShowPrompt(true);
      window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) 
      && !(window as any).MSStream;
    
    if (isIos) {
      setPlatform("ios");
      // Add a slight delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-gray-900 text-white dark:bg-neutral-900 border border-gray-800 dark:border-neutral-800 rounded-2xl p-5 shadow-2xl z-[10000] animate-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex gap-4 items-start pr-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Download className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-100 mb-1">
            Install {config.appShortName}
          </h3>
          
          {platform === "android" && (
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Install the app on your home screen for quick access and offline collection.
            </p>
          )}

          {platform === "ios" && (
            <div className="text-xs text-gray-400 leading-relaxed mb-1 space-y-2">
              <p>Install this app on your iPhone:</p>
              <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  Tap the share button <Share2 className="w-3.5 h-3.5 text-blue-400 inline" /> below
                </li>
                <li className="flex items-center gap-1.5">
                  Select <span className="text-gray-200">"Add to Home Screen"</span> <PlusSquare className="w-3.5 h-3.5 text-gray-200 inline" />
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {platform === "android" && (
        <div className="flex gap-2.5 mt-2">
          <button
            onClick={handleDismiss}
            className="flex-1 h-10 text-xs font-semibold text-gray-400 hover:text-white border border-gray-800 hover:bg-white/5 rounded-xl transition-all"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-[2] h-10 text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 border-none cursor-pointer"
          >
            <Download className="w-4 h-4" /> Install Now
          </button>
        </div>
      )}
    </div>
  );
}
