"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Shield, 
  Moon, 
  DownloadCloud, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Download, 
  HelpCircle, 
  RefreshCw, 
  Info,
  Smartphone
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Greeting } from "@/components/Greeting";
import { config } from "@/lib/config";
import { logout } from "@/app/auth-actions";

export default function SettingsPage() {
  const router = useRouter();
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // PWA Installation states
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone PWA mode
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches 
        || (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    // 2. Check if global prompt already exists
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    // 3. Listen for the prompt event if it fires later
    const handlePrompt = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    };

    window.addEventListener("pwa-prompt-available", handlePrompt);
    return () => {
      window.removeEventListener("pwa-prompt-available", handlePrompt);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const res = await logout();
      if (res.success) {
        router.push("/login");
      } else {
        setIsSigningOut(false);
        setShowToast("Sign out failed");
        setTimeout(() => setShowToast(null), 4000);
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
      setShowToast("An error occurred during sign out");
      setTimeout(() => setShowToast(null), 4000);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  const handleResetBanner = () => {
    localStorage.removeItem("pwa_install_dismissed");
    setShowToast("Install banner reset! Reload to see it.");
    setTimeout(() => setShowToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full relative min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-neon-lime" /> {showToast}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-br from-neutral-50/60 via-white to-neutral-100/40 dark:from-[#1a1a1c] dark:via-[#141416] dark:to-[#0c0c0d] p-5 rounded-[1.75rem] border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative overflow-hidden mb-2">
        <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">Settings</h1>
        <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-neon-lime bg-neon-lime/10 px-3 py-1 rounded-full border border-neon-lime/25 shadow-sm">
          Agent Profile
        </span>
      </header>

      {/* Profile Section */}
      <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-1.5 text-black dark:text-neon-lime text-xs font-black uppercase tracking-wider bg-neon-lime/15 px-3 py-1 rounded-full border border-neon-lime/25">
            <div className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
            Active
          </span>
        </div>
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-muted overflow-hidden relative border-4 border-white dark:border-[#0a0a0a] shadow-xl shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(config.agentName)}`} alt="Agent Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Greeting name={config.agentName} />
            <span className="text-gray-400 dark:text-white/40 text-sm font-semibold tracking-wide uppercase mt-1">ID: AGT-84729</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-8 mt-2">
        
        {/* App Installation Section */}
        <section>
          <h3 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-3 uppercase tracking-wider px-2">Mobile Application</h3>
          <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-5 flex flex-col gap-4">
              
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border p-2 rounded-xl text-black dark:text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black dark:text-white font-medium text-sm">Standalone Mode</span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">Run without browser borders</span>
                  </div>
                </div>
                <div>
                  {isInstalled ? (
                    <span className="text-xs font-bold text-black dark:text-neon-lime bg-neon-lime/15 border border-neon-lime/20 px-3 py-1 rounded-full">Installed ✅</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">Not Installed</span>
                  )}
                </div>
              </div>

              {/* Install Button Trigger */}
              {!isInstalled && deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="w-full h-11 bg-neon-lime hover:bg-neon-lime/90 active:scale-[0.99] text-black font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  <Download className="w-4 h-4" /> Install {config.appShortName} App Now
                </button>
              )}

              {/* Reset Banner Button & Troubleshooting Toggle */}
              {!isInstalled && (
                <div className="flex gap-2.5 mt-2 border-t border-gray-100 dark:border-border/60 pt-4">
                  <button
                    onClick={handleResetBanner}
                    className="flex-1 h-9 bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-[#1c1c1c] text-xs font-semibold text-gray-600 dark:text-neutral-400 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-200 dark:border-border"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Install Popups
                  </button>
                  <button
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    className="flex-1 h-9 bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-[#1c1c1c] text-xs font-semibold text-gray-600 dark:text-neutral-400 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-200 dark:border-border"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Can't Install?
                  </button>
                </div>
              )}

              {/* Troubleshooting Instructions */}
              {!isInstalled && showTroubleshooting && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mt-2 text-left flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-4 h-4" /> Why is "Install" not showing?
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
                    If you installed the app before and then uninstalled it, Android or Chrome puts the app on a **temporary installation cooldown** (often 24 hours) to prevent spam.
                  </p>
                  <div className="text-xs text-gray-600 dark:text-neutral-400 flex flex-col gap-2">
                    <span className="font-bold text-black dark:text-white">To bypass the cooldown and force the install button:</span>
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Open the website in your mobile browser.</li>
                      <li>Tap the **lock icon** 🔒 (or settings icon) next to the URL in the address bar.</li>
                      <li>Select **Site settings** (or **Cookies and site data**).</li>
                      <li>Tap **Clear data** or **Clear & reset** (this resets Chrome's install records for this site).</li>
                      <li>**Reload/refresh the page twice**. The "Install" prompt will now show up!</li>
                    </ol>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-3 uppercase tracking-wider px-2">Account</h3>
          <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <Link 
                href="/settings/security"
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border-b border-gray-200 dark:border-border group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border p-2 rounded-xl text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white font-medium text-sm">Security & PIN</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </Link>
              <Link 
                href="/settings/notifications"
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border p-2 rounded-xl text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white font-medium text-sm">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-3 uppercase tracking-wider px-2">App Preferences</h3>
          <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-border">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border p-2 rounded-xl text-black dark:text-white">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white font-medium text-sm">Dark Mode</span>
                </div>
                <ThemeToggle />
              </div>
              <div 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                onClick={() => setOfflineSyncEnabled(!offlineSyncEnabled)}
              >
                <div className="flex items-center gap-4">
                  <div className={`border p-2 rounded-xl transition-colors ${offlineSyncEnabled ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-black dark:text-white'}`}>
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-black dark:text-white font-medium text-sm">Offline Sync</span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">Download data for field collection</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${offlineSyncEnabled ? 'bg-neon-lime' : 'bg-gray-200 dark:bg-[#222]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${offlineSyncEnabled ? 'left-7' : 'left-1 dark:bg-[#666]'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Actions */}
        <section className="mt-4">
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-card text-red-600 dark:text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-gray-200 dark:border-border shadow-sm disabled:opacity-50"
          >
            {isSigningOut ? (
              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Sign Out
              </>
            )}
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
