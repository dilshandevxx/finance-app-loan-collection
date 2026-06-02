import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, WifiOff, BarChart3, ShieldCheck, Receipt, MapPin, FileText } from "lucide-react";
import { config } from "@/lib/config";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white font-sans antialiased overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between border-b border-white/[0.05] bg-[#0c0c0c]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0">
            <Image src="/icon-192x192.png" alt="Logo" fill className="object-cover" sizes="24px" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90 truncate">{config.appName}</span>
        </div>
        <Link href="/login/auth">
          <button className="text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1 group shrink-0 ml-4">
            Sign in
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </Link>
      </header>

      {/* ── Hero ── */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 pt-14">
        <div className="flex flex-col items-start justify-center min-h-[calc(100vh-3.5rem)] py-20 sm:py-28">

          <p className="text-[10px] sm:text-xs font-mono text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8">
            Loan Collection · Field Agent Platform
          </p>

          <h1 className="text-[clamp(2.6rem,10vw,5.5rem)] font-black tracking-[-0.04em] leading-[1.0] text-white mb-6 sm:mb-8">
            Collect.<br />
            Track.<br />
            <span className="text-white/25">Grow.</span>
          </h1>

          <p className="text-white/40 text-sm sm:text-base lg:text-lg font-normal max-w-xs sm:max-w-md leading-relaxed mb-10 sm:mb-12">
            Professional loan collection management for field agents. Works offline, syncs instantly.
          </p>

          <Link href="/login/auth">
            <button className="group flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-all active:scale-95">
              Get Started
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </main>

      {/* ── Features ── */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 pb-20 sm:pb-28">
        <p className="text-[11px] font-mono text-white/20 uppercase tracking-[0.2em] mb-8 sm:mb-10">
          Features
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] overflow-hidden rounded-sm">
          {[
            { icon: WifiOff,     title: "Offline First",   desc: "Collect payments without internet. Auto-syncs when back online." },
            { icon: BarChart3,   title: "Live Analytics",  desc: "Track balances, collection rates and overdue loans in real-time." },
            { icon: ShieldCheck, title: "PIN Access",      desc: "4-digit PIN for fast, secure daily login in the field." },
            { icon: Receipt,     title: "PDF Receipts",    desc: "Share professional receipts via WhatsApp in one tap." },
            { icon: MapPin,      title: "Route Villages",  desc: "Organize collections by village. See today's schedule instantly." },
            { icon: FileText,    title: "Full Reports",    desc: "Settlement, overdue and weekly reports. Export anytime." },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[#0c0c0c] p-6 sm:p-7 hover:bg-white/[0.03] transition-colors group"
            >
              <f.icon className="w-5 h-5 text-white/25 group-hover:text-white/50 mb-4 sm:mb-5 transition-colors" />
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 pb-24 sm:pb-32">
        <div className="border-t border-white/[0.06] pt-12 sm:pt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 sm:gap-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white mb-3 leading-tight">
              Ready to run your<br />collections professionally?
            </h2>
            <p className="text-white/30 text-sm max-w-sm">
              Built for Sri Lankan loan companies and field agents.
            </p>
          </div>
          <Link href="/login/auth" className="shrink-0">
            <button className="group flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-all active:scale-95">
              Sign In
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-white/20 font-mono">
          © {new Date().getFullYear()} {config.appName}
        </span>
        <span className="text-xs text-white/15 font-mono">
          v1.0
        </span>
      </footer>

    </div>
  );
}
