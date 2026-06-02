"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  WifiOff,
  BarChart3,
  Users,
  CheckCircle2,
  Smartphone,
  FileText,
  Zap,
  TrendingUp,
  MapPin,
  Star,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { config } from "@/lib/config";

const FEATURES = [
  {
    icon: WifiOff,
    color: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    title: "Offline First",
    desc: "Collect payments and register customers with zero internet. Auto-syncs instantly when back online.",
  },
  {
    icon: BarChart3,
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    title: "Live Analytics",
    desc: "Track outstanding balances, collection rates and village breakdowns in real-time.",
  },
  {
    icon: ShieldCheck,
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    title: "PIN Secured",
    desc: "Multi-tenant architecture with RLS. Agents use fast 4-digit PINs for field access.",
  },
  {
    icon: Receipt,
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    title: "Instant Receipts",
    desc: "Generate PDF receipts with full loan details and share via WhatsApp in one tap.",
  },
  {
    icon: MapPin,
    color: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    title: "Route Villages",
    desc: "Organize collections by village routes. See today's schedule at a glance.",
  },
  {
    icon: FileText,
    color: "from-sky-500/20 to-sky-600/10",
    border: "border-sky-500/20",
    iconColor: "text-sky-400",
    title: "Full Reports",
    desc: "Detailed settlement, overdue and weekly reports. Export anytime, anywhere.",
  },
];

const STATS = [
  { value: "100%", label: "Offline Capable" },
  { value: "4-Digit", label: "Quick PIN Login" },
  { value: "Multi", label: "Tenant Isolated" },
  { value: "Real-time", label: "Sync & Reports" },
];

const TESTIMONIALS = [
  {
    name: "Chaminda P.",
    role: "Field Collection Agent",
    stars: 5,
    text: "Finally a system that works in remote villages with no signal. The offline sync is a game changer.",
  },
  {
    name: "Nimal S.",
    role: "Loan Company Owner",
    stars: 5,
    text: "My agents can now send receipts to customers via WhatsApp instantly. Customers love it.",
  },
  {
    name: "Ruwani K.",
    role: "Finance Manager",
    stars: 5,
    text: "The reports dashboard gives me everything I need — overdue tracking, collection rates, village breakdowns.",
  },
];

export default function WelcomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white antialiased overflow-x-hidden selection:bg-violet-500/30">

      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] rounded-full bg-violet-700/15 blur-[160px]" />
        <div className="absolute top-[30%] right-[-15%] w-[50rem] h-[50rem] rounded-full bg-blue-700/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] rounded-full bg-violet-900/10 blur-[120px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#060608]/90 backdrop-blur-2xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <Image src="/icon-192x192.png" alt="Logo" fill className="object-cover" sizes="32px" />
            </div>
            <span className="text-base font-black tracking-tight">{config.appName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login/auth">
              <button className="hidden sm:block px-5 py-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-sm font-semibold transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/login/auth">
              <button className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all active:scale-95">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 pt-24 pb-16">

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8 group hover:bg-violet-500/15 transition-all cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Field-Ready Loan Collection
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(2.8rem,9vw,6.5rem)] font-black tracking-tighter leading-[0.95] mb-6 max-w-4xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30">
            Collect.{" "}
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400">
            Track.
          </span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30">
            Grow.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl font-medium leading-relaxed mb-10">
          The professional loan collection platform built for field agents.{" "}
          <span className="text-white/60">Works offline, syncs instantly, keeps your business running.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link href="/login/auth">
            <button className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.55)] transition-all active:scale-95">
              Start Collecting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold text-base transition-all active:scale-95 bg-white/[0.03]">
            <Smartphone className="w-4 h-4" />
            Install as App
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden border border-white/[0.06] w-full max-w-2xl">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#060608] py-6 px-4 text-center hover:bg-white/[0.03] transition-colors">
              <div className="text-2xl font-black text-white mb-1 tracking-tight">{s.value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-5 sm:px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-4">Everything You Need</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-tight">
            Built for the field.
            <br />
            <span className="text-white/40">Not the office.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-3xl border ${f.border} bg-gradient-to-br ${f.color} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden`}
            >
              {/* Shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.03] to-transparent rounded-3xl" />
              <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${f.iconColor}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-5 sm:px-8 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-4">Simple Workflow</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">How it works</h2>
        </div>

        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-violet-500/50 via-indigo-500/30 to-transparent hidden sm:block" />

          {[
            {
              step: "01",
              title: "Log in with your PIN",
              desc: "Open the app and enter your 4-digit PIN. No typing long passwords in the field.",
              icon: ShieldCheck,
            },
            {
              step: "02",
              title: "View your daily route",
              desc: "See today's collection schedule organized by village. Know exactly who to visit.",
              icon: MapPin,
            },
            {
              step: "03",
              title: "Collect & confirm payment",
              desc: "Mark installments as paid — even offline. The app queues everything safely.",
              icon: Zap,
            },
            {
              step: "04",
              title: "Share receipt instantly",
              desc: "Send a professional PDF receipt to the customer via WhatsApp in one tap.",
              icon: Receipt,
            },
            {
              step: "05",
              title: "Review reports & analytics",
              desc: "Track outstanding balances, daily totals, and overdue accounts from the dashboard.",
              icon: TrendingUp,
            },
          ].map((item, i) => (
            <div key={item.step} className="flex items-start gap-6 p-6 rounded-2xl hover:bg-white/[0.03] transition-colors group">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/15 transition-colors">
                <item.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 pt-2">
                <div className="text-[10px] font-black text-violet-500/60 uppercase tracking-[0.2em] mb-1">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{item.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-violet-500/30 flex-shrink-0 mt-3 group-hover:text-violet-400 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 px-5 sm:px-8 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-4">Loved by Agents</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">What they say</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-7 hover:bg-white/[0.05] transition-all hover:border-white/10 group"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 px-5 sm:px-8 py-12 max-w-5xl mx-auto mb-24">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-[#060608] p-12 sm:p-16 text-center">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-32 bg-violet-500/20 blur-[80px] rounded-full pointer-events-none" />
          <Users className="w-12 h-12 text-violet-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            Ready to modernize<br />your collections?
          </h2>
          <p className="text-gray-400 font-medium mb-10 max-w-xl mx-auto">
            Join loan companies across Sri Lanka using {config.appName} to manage agents, customers, and collections professionally.
          </p>
          <Link href="/login/auth">
            <button className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_50px_rgba(139,92,246,0.45)] hover:shadow-[0_0_70px_rgba(139,92,246,0.6)] transition-all active:scale-95">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-5 bg-[#060608]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/10">
              <Image src="/icon-192x192.png" alt="Logo" fill className="object-cover" sizes="28px" />
            </div>
            <span className="text-sm font-black text-white/60">{config.appName}</span>
          </div>
          <p className="text-xs text-gray-600 font-semibold text-center">
            &copy; {new Date().getFullYear()} {config.appName}. Built for field agents. All rights reserved.
          </p>
          <Link href="/login/auth">
            <button className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Sign In →
            </button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
