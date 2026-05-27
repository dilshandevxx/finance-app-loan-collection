"use client";

import Link from "next/link";
import { ChevronLeft, Shield, KeyRound, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecuritySettingsPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#111] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-gray-600 dark:text-white/70 font-medium tracking-tight">Security & Password</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-gray-100 dark:border-[#111] flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Account Security</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Manage your password and security preferences to keep your account safe.</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gray-400" /> Password
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-white/50">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-white/50">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password" 
                    className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <Button className="w-full mt-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl h-12">
                  Update Password
                </Button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-[#111]" />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-400" /> Two-Factor Authentication
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#111]">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black dark:text-white">Authenticator App</span>
                  <span className="text-xs text-gray-500 dark:text-white/50">Not configured</span>
                </div>
                <Button variant="outline" className="rounded-lg h-9 border-gray-300 dark:border-[#333]">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
