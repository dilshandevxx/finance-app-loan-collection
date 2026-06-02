"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Shield,
  Moon,
  Sun,
  DownloadCloud,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Download,
  HelpCircle,
  RefreshCw,
  Info,
  Smartphone,
  Trash2,
  Mail
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
import { Greeting } from "@/components/Greeting";
import { config } from "@/lib/config";
import { logout, getUserProfile, updateUserProfileImage } from "@/app/auth-actions";
import { clearAllData, fetchSystemVillages, createSystemVillage, fetchCompanySettings, saveCompanySettings } from "@/app/actions";

export default function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Villages state & actions
  const [villages, setVillages] = useState<string[]>([]);

  // Company settings state
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // User Profile state
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, pin: string, avatarUrl?: string } | null>(null);

  const loadVillages = async () => {
    try {
      const res = await fetchSystemVillages();
      setVillages(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCompanySettings = async () => {
    try {
      const res = await fetchCompanySettings();
      setCompanyName(res.name);
      setCompanyLogo(res.logo);
      setCompanyLogoPreview(res.logo);
    } catch (e) {
      console.error("Error loading company settings:", e);
    }
  };

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      loadVillages();
      loadCompanySettings();
      getUserProfile().then(res => {
        if (res) {
          setUserProfile(res);
        }
      });
      setThemeMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCompanyLogoPreview(previewUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCompanyLogo(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      const res = await saveCompanySettings(companyName, companyLogo);
      if (res.success) {
        setShowToast("Company profile updated successfully!");
        setTimeout(() => setShowToast(null), 3000);
      } else {
        setShowToast(res.error || "Failed to save company profile");
        setTimeout(() => setShowToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setShowToast("An unexpected error occurred");
      setTimeout(() => setShowToast(null), 4000);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleUserProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        setUserProfile(prev => prev ? { ...prev, avatarUrl: dataUrl } : null);
        setShowToast("Saving profile image...");

        const res = await updateUserProfileImage(dataUrl);
        if (res.success) {
          setShowToast("Profile image updated successfully!");
          setTimeout(() => setShowToast(null), 3000);
        } else {
          setShowToast(res.error || "Failed to save profile image");
          setTimeout(() => setShowToast(null), 4000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches
        || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };

    const handle = requestAnimationFrame(() => {
      checkStandalone();

      const win = window as unknown as { deferredPrompt?: BeforeInstallPromptEvent };
      if (win.deferredPrompt) {
        setDeferredPrompt(win.deferredPrompt);
      }
    });

    const handlePrompt = () => {
      const win = window as unknown as { deferredPrompt?: BeforeInstallPromptEvent };
      if (win.deferredPrompt) {
        setDeferredPrompt(win.deferredPrompt);
      }
    };

    window.addEventListener("pwa-prompt-available", handlePrompt);
    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("pwa-prompt-available", handlePrompt);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const res = await logout();
      if (res.success) {
        router.push("/welcome");
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
      (window as unknown as { deferredPrompt?: BeforeInstallPromptEvent | null }).deferredPrompt = null;
    }
  };

  const handleResetBanner = () => {
    localStorage.removeItem("pwa_install_dismissed");
    setShowToast("Install banner reset! Reload to see it.");
    setTimeout(() => setShowToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-5xl mx-auto w-full relative min-h-screen px-4 sm:px-6 pt-4 sm:pt-8">

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-primary" /> {showToast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between bg-card p-4 sm:p-6 rounded-[1.75rem] border border-border shadow-sm mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/20 shadow-sm">
          Administrator
        </span>
      </header>

      {/* Profile Section */}
      <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm relative">
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        </div>
        <CardContent className="p-6 sm:p-8 flex items-center gap-5 sm:gap-6">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById("profile-image-input")?.click()}>
            <div className="absolute -inset-[3px] bg-primary/20 rounded-full blur-xs opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary overflow-hidden relative border-2 border-card shadow-xl shrink-0 z-10 transition-transform group-hover:scale-105">
              <img
                src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userProfile?.name || config.agentName)}`}
                alt="Agent Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <input
              type="file"
              id="profile-image-input"
              accept="image/*"
              onChange={handleUserProfileImageChange}
              className="hidden"
            />
          </div>
          <div className="flex flex-col gap-1 z-10 w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
              {userProfile?.name || config.agentName}
            </h2>
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm font-medium truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                {userProfile?.email || "Loading email..."}
              </span>
              <span className="text-muted-foreground text-[10px] sm:text-xs font-semibold tracking-widest uppercase opacity-70">
                PIN: {userProfile?.pin ? "••••" : "Not Set"}
              </span>
              {(userProfile as any)?.companyName && (
                <span className="text-muted-foreground text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-90 mt-1 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {(userProfile as any).companyName}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="md:col-span-7 flex flex-col gap-6">

          {/* Company Profile Settings */}
          <section>
            <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Company Profile</h3>
            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <form onSubmit={handleSaveCompanySettings} className="flex flex-col gap-5">

                  {/* Logo Uploader */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-border/50 pb-5">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide sm:w-1/3">Company Logo</span>

                    <div className="relative group sm:w-2/3">
                      <div
                        onClick={() => document.getElementById("logo-input")?.click()}
                        className="w-32 h-16 sm:w-40 sm:h-20 rounded-xl border border-dashed border-gray-300 dark:border-border hover:border-primary dark:hover:border-primary overflow-hidden bg-secondary/35 flex items-center justify-center transition-all shadow-inner group-hover:scale-[1.02] cursor-pointer"
                      >
                        {companyLogoPreview ? (
                          <img src={companyLogoPreview} alt="Company Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-white/30 group-hover:text-primary transition-colors text-center p-2">
                            <span className="text-[10px] font-black uppercase tracking-wider">No Logo Selected</span>
                            <span className="text-[8px] text-muted-foreground/80 mt-0.5">Click to Upload</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="file"
                      id="logo-input"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />

                    {companyLogoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompanyLogoPreview("");
                          setCompanyLogo("");
                        }}
                        className="text-xs text-red-500 hover:underline font-bold transition-colors cursor-pointer self-start sm:self-center"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  {/* Removed Company Name Input */}

                  <button
                    type="submit"
                    disabled={isSavingCompany}
                    className="h-11 w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer border-none mt-2 shadow-md"
                  >
                    {isSavingCompany ? "Saving Company Profile..." : "Save Company Profile"}
                  </button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Villages Management */}
          <section>
            <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Villages & Routes</h3>
            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-0 flex flex-col">
                <Link
                  href="/villages"
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-sm">
                      📍
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-foreground font-semibold text-base">Route Villages Registry</span>
                      <span className="text-muted-foreground text-sm mt-0.5">Manage ({villages.length}) collection villages and schedules</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              </CardContent>
            </Card>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-5 flex flex-col gap-6">

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
                    <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
                    <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-foreground font-semibold text-sm">Notifications</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* App Installation Section */}
          <section>
            <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Mobile Application</h3>
            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-semibold text-sm">Standalone App</span>
                      <span className="text-muted-foreground text-xs mt-0.5">Run without browser borders</span>
                    </div>
                  </div>
                  <div>
                    {isInstalled ? (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full uppercase tracking-wider">Installed</span>
                    ) : (
                      <span className="text-[10px] font-bold text-destructive-foreground bg-destructive px-3 py-1.5 rounded-full uppercase tracking-wider">Not Installed</span>
                    )}
                  </div>
                </div>

                {!isInstalled && deferredPrompt && (
                  <button
                    onClick={handleInstallApp}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2 active:scale-95"
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
                      <HelpCircle className="w-3.5 h-3.5" /> Can&apos;t Install?
                    </button>
                  </div>
                )}

                {!isInstalled && showTroubleshooting && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2 text-left flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                      <Info className="w-4 h-4" /> Why is &quot;Install&quot; hidden?
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

          {/* Preferences */}
          <section>
            <h3 className="text-muted-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Preferences</h3>
            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-0 flex flex-col">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary border border-border p-2.5 rounded-xl text-foreground">
                      {themeMounted && theme === "dark" ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Sun className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-foreground font-semibold text-sm">
                      {themeMounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <ThemeToggle />
                </div>
                <div
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setOfflineSyncEnabled(!offlineSyncEnabled)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border transition-colors ${offlineSyncEnabled ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary border-border text-muted-foreground'}`}>
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-foreground font-semibold text-sm">Offline Sync</span>
                      <span className="text-muted-foreground text-[11px] mt-0.5">Download data for field</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${offlineSyncEnabled ? 'bg-primary' : 'bg-secondary border border-border'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${offlineSyncEnabled ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="mt-2">
            <h3 className="text-destructive-foreground text-xs font-bold mb-3 uppercase tracking-widest px-2">Danger Zone</h3>
            <Card className="border-destructive-foreground/30 bg-destructive rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-foreground font-bold text-sm">Clear All Data</span>
                    <span className="text-muted-foreground text-xs mt-1 max-w-[200px]">Permanently delete all customers and local caches.</span>
                  </div>
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-4 h-10 bg-destructive-foreground hover:bg-destructive-foreground/90 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-destructive-foreground/20"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Data
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={handleClearAllData}
                        disabled={isClearing}
                        className="px-4 h-10 bg-destructive-foreground hover:bg-destructive-foreground/90 text-white font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-destructive-foreground/20"
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
          <section className="mt-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-card hover:bg-secondary text-destructive-foreground font-bold transition-colors border border-border shadow-sm disabled:opacity-50 active:scale-[0.98] text-sm"
            >
              {isSigningOut ? (
                <div className="w-5 h-5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </>
              )}
            </button>
          </section>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
