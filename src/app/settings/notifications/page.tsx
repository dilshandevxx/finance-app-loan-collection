"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft, Bell, MessageSquare, Mail, Smartphone,
  MapPin, User, Phone, AlertCircle, CheckCircle2, Loader2,
  CalendarClock, ChevronRight, Banknote
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTomorrowsWork } from "@/app/actions";
import { formatLKR } from "@/lib/format";

type CustomerDue = {
  id: string;
  name: string;
  phone: string;
  amount: number;
  status: string;
};

type VillageGroup = {
  village: string;
  customers: CustomerDue[];
};

export default function NotificationsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [tomorrowDate, setTomorrowDate] = useState("");
  const [groups, setGroups] = useState<VillageGroup[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expandedVillage, setExpandedVillage] = useState<string | null>(null);

  useEffect(() => {
    fetchTomorrowsWork().then((res) => {
      if (res.success && res.groups) {
        setGroups(res.groups as VillageGroup[]);
        setTomorrowDate(res.tomorrowDate || "");
        const total = (res.groups as VillageGroup[]).reduce(
          (sum, g) => sum + g.customers.reduce((s, c) => s + c.amount, 0), 0
        );
        setTotalAmount(total);
        // Auto-expand first village
        if ((res.groups as VillageGroup[]).length > 0) {
          setExpandedVillage((res.groups as VillageGroup[])[0].village);
        }
      }
      setLoading(false);
    });
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <div className="flex flex-col gap-5 pb-28 max-w-lg mx-auto w-full min-h-screen px-4">

      {/* Header */}
      <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-1 mt-2">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-border transition-colors shadow-sm cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-foreground">Notifications</span>
        <div className="w-10" />
      </header>

      {/* Tomorrow's Work Section */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tomorrow&apos;s Work Plan
          </h2>
        </div>

        {loading ? (
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading tomorrow&apos;s schedule...</p>
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="bg-card border-border rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">All Clear!</p>
                <p className="text-muted-foreground text-xs mt-1">No installments due tomorrow.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Banner */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {formatDate(tomorrowDate)}
                </p>
                <p className="text-2xl font-black mt-0.5 text-foreground">{groups.reduce((s, g) => s + g.customers.length, 0)} customers</p>
                <p className="text-xs text-muted-foreground mt-0.5">across {groups.length} village{groups.length > 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expected</p>
                <p className="text-xl font-black mt-0.5 text-primary">{formatLKR(totalAmount)}</p>
              </div>
            </div>

            {/* Village Groups */}
            <div className="flex flex-col gap-3">
              {groups.map((group) => {
                const isOpen = expandedVillage === group.village;
                const groupTotal = group.customers.reduce((s, c) => s + c.amount, 0);
                const missedCount = group.customers.filter(c => c.status === "MISSED").length;

                return (
                  <Card key={group.village} className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Village Header — clickable to expand */}
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors text-left"
                      onClick={() => setExpandedVillage(isOpen ? null : group.village)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground font-bold text-sm">{group.village}</p>
                          <p className="text-muted-foreground text-xs">
                            {group.customers.length} customer{group.customers.length > 1 ? "s" : ""} · {formatLKR(groupTotal)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {missedCount > 0 && (
                          <span className="text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
                            {missedCount} overdue
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded Customer List */}
                    {isOpen && (
                      <div className="border-t border-border">
                        {group.customers.map((customer, idx) => (
                          <Link key={customer.id} href={`/customers/${customer.id}`}>
                            <div className={`flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 transition-colors ${idx < group.customers.length - 1 ? "border-b border-border/50" : ""}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${customer.status === "MISSED" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-foreground font-semibold text-sm leading-tight">{customer.name}</p>
                                  {customer.phone && (
                                    <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                                      <Phone className="w-2.5 h-2.5" /> {customer.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-foreground font-bold text-sm">{formatLKR(customer.amount)}</span>
                                {customer.status === "MISSED" && (
                                  <span className="text-[9px] font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">Overdue</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Notification Preferences Section */}
      <section className="mt-2">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Alert Preferences
          </h2>
        </div>
        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 flex flex-col">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/40 transition-colors border-b border-border/50"
              onClick={() => setPushEnabled(!pushEnabled)}
            >
              <div className="flex items-center gap-3">
                <div className={`border p-2.5 rounded-xl transition-colors ${pushEnabled ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">Push Notifications</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Alerts sent directly to your device</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors ${pushEnabled ? "bg-primary" : "bg-secondary"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${pushEnabled ? "left-6" : "left-1"}`} />
              </div>
            </div>

            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/40 transition-colors border-b border-border/50"
              onClick={() => setSmsEnabled(!smsEnabled)}
            >
              <div className="flex items-center gap-3">
                <div className={`border p-2.5 rounded-xl transition-colors ${smsEnabled ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">SMS Messages</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Text alerts for important updates</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors ${smsEnabled ? "bg-primary" : "bg-secondary"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${smsEnabled ? "left-6" : "left-1"}`} />
              </div>
            </div>

            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/40 transition-colors"
              onClick={() => setEmailEnabled(!emailEnabled)}
            >
              <div className="flex items-center gap-3">
                <div className={`border p-2.5 rounded-xl transition-colors ${emailEnabled ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground"}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">Email Summaries</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Daily collection reports via email</p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative shadow-inner transition-colors ${emailEnabled ? "bg-primary" : "bg-secondary"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-md transition-all ${emailEnabled ? "left-6" : "left-1"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
