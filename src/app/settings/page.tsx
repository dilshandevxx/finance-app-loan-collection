import Image from "next/image";
import { Bell, Shield, Moon, DownloadCloud, LogOut, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      {/* Profile Section */}
      <Card className="bg-gradient-to-tr from-[#1c1c1f] to-[#121214] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-black/10 overflow-hidden relative border-2 border-white/20 shadow-xl">
            <Image src="https://i.pravatar.cc/150?u=admin" alt="Agent Profile" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white">Agent 007</h2>
            <span className="text-white/50 text-sm font-medium">ID: AGT-84729</span>
            <span className="text-green-400 text-xs font-semibold mt-1 bg-green-400/10 w-fit px-2 py-0.5 rounded-full">Active</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-8 mt-2">
        {/* Account Settings */}
        <section>
          <h3 className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider px-2">Account</h3>
          <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-0 flex flex-col">
              <button className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-full text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium">Security & Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </button>
              <button className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-full text-white">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </button>
            </CardContent>
          </Card>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider px-2">App Preferences</h3>
          <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-0 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-full text-white">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium">Dark Mode</span>
                </div>
                {/* Toggle switch mock */}
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-md" />
                </div>
              </div>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-full text-white">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-medium">Offline Sync</span>
                    <span className="text-white/40 text-xs">Download data for field collection</span>
                  </div>
                </div>
                <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white/50 rounded-full absolute left-1 top-1 shadow-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Actions */}
        <section className="mt-4">
          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-full bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors border border-red-500/20">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
