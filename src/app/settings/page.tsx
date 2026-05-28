"use client";

import { useState, useEffect } from "react";
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
  Smartphone,
  Trash2
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Greeting } from "@/components/Greeting";
import { config } from "@/lib/config";
import { logout } from "@/app/auth-actions";
import { clearAllData } from "@/app/actions";

export default function SettingsPage() {
  const router = useRouter();
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      const res = await clearAllData();
      if (res.success) {
        localStorage.removeItem("offlineSyncQueue");
        localStorage.removeItem("pwa_install_dismissed");
        setShowToast("All application data cleared successfully!");
        setTimeout(() => {
          setShowToast(null);
          router.push("/");
          router.refresh();
        }, 2000);
      } else {
        setShowToast(res.error || "Failed to clear data");
        setTimeout(() => setShowToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setShowToast("An unexpected error occurred");
      setTimeout(() => setShowToast(null), 4000);
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  };

  // PWA Installation states
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches 
        || (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

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
    <div className="flex flex-col gap-6 pb-28 pt-4 max-w-lg mx-auto w-full relative min-h-screen px-4">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#7c6dbf]" /> {showToast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-2 mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#7c6dbf] bg-[#7c6dbf]/10 px-3 py-1.5 rounded-full border border-[#7c6dbf]/20 shadow-sm">
          Agent Profile
        </span>
      </header>

      {/* Profile Section */}
      <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-1.5 text-[#9dedc8] text-[10px] font-bold uppercase tracking-wider bg-[#9dedc8]/10 px-3 py-1 rounded-full border border-[#9dedc8]/20">
            <div className="w-2 h-2 rounded-full bg-[#9dedc8] animate-pulse" />
            Active
          </span>
        </div>
        <CardContent className="p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
          <div className="relative">
            <div className="absolute -inset-[3px] bg-gradient-to-tr from-[#e05470] via-[#7c6dbf] to-[#6ab4e8] rounded-full blur-sm opacity-60" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary overflow-hidden relative border-2 border-card shadow-xl shrink-0 z-10">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(config.agentName)}`} alt="Agent Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <Greeting name={config.agentName} />
            <span className="text-muted-foreground text-xs sm:text-sm font-semibold tracking-widest uppercase mt-0.5">ID: AGT-84729</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 mt-2">
        
        {/* App Installation Section */}
        <section>
          <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Mobile Application</h3>
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#6ab4e8]/10 border border-[#6ab4e8]/20 p-2.5 rounded-xl text-[#6ab4e8]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-foreground font-semibold text-sm">Standalone App</span>
                    <span className="text-muted-foreground text-xs mt-0.5">Run without browser borders</span>
                  </div>
                </div>
                <div>
                  {isInstalled ? (
                    <span className="text-[10px] font-bold text-[#9dedc8] bg-[#9dedc8]/10 border border-[#9dedc8]/20 px-3 py-1.5 rounded-full uppercase tracking-wider">Installed</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#e05470] bg-[#e05470]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">Not Installed</span>
                  )}
                </div>
              </div>

              {!isInstalled && deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="w-full h-11 bg-[#6ab4e8] hover:bg-[#5aa4d8] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Install {config.appShortName} Now
                </button>
              )}

              {!isInstalled && (
                <div className="flex gap-2.5 mt-2 border-t border-border pt-4">
                  <button
                    onClick={handleResetBanner}
                    className="flex-1 h-9 bg-secondary hover:bg-border/50 text-[11px] font-bold text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-1.5 border border-border uppercase tracking-wide"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Popups
                  </button>
                  <button
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    className="flex-1 h-9 bg-secondary hover:bg-border/50 text-[11px] font-bold text-muted-foreground rounded-xl transition-all flex items-center justify-center gap-1.5 border border-border uppercase tracking-wide"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Can't Install?
                  </button>
                </div>
              )}

              {!isInstalled && showTroubleshooting && (
                <div className="bg-[#e8849a]/10 border border-[#e8849a]/20 rounded-xl p-4 mt-2 text-left flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-[#e8849a] text-xs font-bold uppercase tracking-widest">
                    <Info className="w-4 h-4" /> Why is "Install" hidden?
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browsers enforce a 24-hour cooldown if you recently uninstalled. To bypass it:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-foreground font-medium">
                    <li>Tap the lock icon 🔒 in the URL bar</li>
                    <li>Select Site Settings</li>
                    <li>Tap Clear data</li>
                    <li>Refresh this page twice</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Account</h3>
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <Link 
                href="/settings/security"
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/50 transition-colors border-b border-border group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#7c6dbf]/10 border border-[#7c6dbf]/20 p-2.5 rounded-xl text-[#7c6dbf] group-hover:bg-[#7c6dbf] group-hover:text-white transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-foreground font-semibold text-sm">Security & PIN</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
              <Link 
                href="/settings/notifications"
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#e8849a]/10 border border-[#e8849a]/20 p-2.5 rounded-xl text-[#e8849a] group-hover:bg-[#e8849a] group-hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-foreground font-semibold text-sm">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Preferences</h3>
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary border border-border p-2.5 rounded-xl text-foreground">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-foreground font-semibold text-sm">Dark Mode</span>
                </div>
                <ThemeToggle />
              </div>
              <div 
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setOfflineSyncEnabled(!offlineSyncEnabled)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl border transition-colors ${offlineSyncEnabled ? 'bg-[#7c6dbf] border-[#7c6dbf] text-white shadow-md shadow-[#7c6dbf]/20' : 'bg-secondary border-border text-muted-foreground'}`}>
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-foreground font-semibold text-sm">Offline Sync</span>
                    <span className="text-muted-foreground text-[11px] mt-0.5">Download data for field</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${offlineSyncEnabled ? 'bg-[#7c6dbf]' : 'bg-secondary border border-border'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${offlineSyncEnabled ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Danger Zone */}
        <section className="mt-2">
          <h3 className="text-[#e05470] text-xs font-bold mb-3 uppercase tracking-widest px-2">Danger Zone</h3>
          <Card className="border-[#e05470]/30 bg-[#e05470]/5 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col text-left">
                  <span className="text-foreground font-bold text-sm">Clear All Data</span>
                  <span className="text-muted-foreground text-xs mt-1 max-w-[200px]">Permanently delete all customers and local caches.</span>
                </div>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 h-10 bg-[#e05470] hover:bg-[#d0435f] text-white font-bold rounded-xl text-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e05470]/20"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Data
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={handleClearAllData}
                      disabled={isClearing}
                      className="px-4 h-10 bg-[#e05470] hover:bg-[#d0435f] text-white font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e05470]/20"
                    >
                      {isClearing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Confirm Deletion"
                      )}
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 h-10 bg-transparent text-foreground hover:bg-secondary font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer border border-border"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Actions */}
        <section className="mt-4">
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-card hover:bg-secondary text-[#e05470] font-bold transition-colors border border-border shadow-sm disabled:opacity-50 active:scale-[0.98]"
          >
            {isSigningOut ? (
              <div className="w-5 h-5 border-2 border-[#e05470]/30 border-t-[#e05470] rounded-full animate-spin" />
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
