"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Bell, MessageSquare, Mail, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#111] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-gray-600 dark:text-white/70 font-medium tracking-tight">Notifications</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-gray-100 dark:border-[#111] flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-2">
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Notification Preferences</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Choose how you want to be notified about payments and account activity.</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border-b border-gray-100 dark:border-[#111]"
              onClick={() => setPushEnabled(!pushEnabled)}
            >
              <div className="flex items-center gap-4">
                <div className={`border p-2.5 rounded-xl transition-colors ${pushEnabled ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#222] text-gray-500 dark:text-white/50'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-black dark:text-white font-medium text-sm">Push Notifications</span>
                  <span className="text-gray-400 dark:text-white/40 text-xs mt-0.5">Alerts sent directly to your device</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${pushEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#222]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${pushEnabled ? 'left-7' : 'left-1 dark:bg-[#666]'}`} />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border-b border-gray-100 dark:border-[#111]"
              onClick={() => setSmsEnabled(!smsEnabled)}
            >
              <div className="flex items-center gap-4">
                <div className={`border p-2.5 rounded-xl transition-colors ${smsEnabled ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#222] text-gray-500 dark:text-white/50'}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-black dark:text-white font-medium text-sm">SMS Messages</span>
                  <span className="text-gray-400 dark:text-white/40 text-xs mt-0.5">Text alerts for important updates</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${smsEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#222]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${smsEnabled ? 'left-7' : 'left-1 dark:bg-[#666]'}`} />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
              onClick={() => setEmailEnabled(!emailEnabled)}
            >
              <div className="flex items-center gap-4">
                <div className={`border p-2.5 rounded-xl transition-colors ${emailEnabled ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#222] text-gray-500 dark:text-white/50'}`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-black dark:text-white font-medium text-sm">Email Summaries</span>
                  <span className="text-gray-400 dark:text-white/40 text-xs mt-0.5">Daily collection reports via email</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${emailEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#222]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${emailEnabled ? 'left-7' : 'left-1 dark:bg-[#666]'}`} />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
