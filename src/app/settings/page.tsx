"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Shield, Moon, DownloadCloud, LogOut, ChevronRight, CheckCircle2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  const router = useRouter();
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleSignOut = () => {
    setIsSigningOut(true);
    // Simulate sign out process
    setTimeout(() => {
      // In a real app, we'd clear auth tokens here
      router.push("/");
    }, 1000);
  };

  const handleActionClick = (actionName: string) => {
    setShowToast(`${actionName} settings coming soon!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full relative min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-500" /> {showToast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Settings</h1>
      </header>

      {/* Profile Section */}
      <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#111] overflow-hidden relative border-2 border-gray-200 dark:border-[#222]">
            <Image src="https://i.pravatar.cc/150?u=dilshan" alt="Agent Profile" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Dilshan</h2>
            <span className="text-gray-500 dark:text-white/50 text-sm font-medium">ID: AGT-84729</span>
            <span className="text-green-600 dark:text-green-400 text-xs font-semibold mt-1 bg-green-100 dark:bg-green-400/10 w-fit px-2 py-0.5 rounded-md">Active</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-8 mt-2">
        {/* Account Settings */}
        <section>
          <h3 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-3 uppercase tracking-wider px-2">Account</h3>
          <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <button 
                onClick={() => handleActionClick("Security")}
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border-b border-gray-200 dark:border-[#222] group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] p-2 rounded-xl text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white font-medium text-sm">Security & Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </button>
              <button 
                onClick={() => handleActionClick("Notifications")}
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] p-2 rounded-xl text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white font-medium text-sm">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </button>
            </CardContent>
          </Card>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-3 uppercase tracking-wider px-2">App Preferences</h3>
          <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#222]">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] p-2 rounded-xl text-black dark:text-white">
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
                  <div className={`border p-2 rounded-xl transition-colors ${offlineSyncEnabled ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#222] text-black dark:text-white'}`}>
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-black dark:text-white font-medium text-sm">Offline Sync</span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">Download data for field collection</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${offlineSyncEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#222]'}`}>
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
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-[#0a0a0a] text-red-600 dark:text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-gray-200 dark:border-[#222] shadow-sm disabled:opacity-50"
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
