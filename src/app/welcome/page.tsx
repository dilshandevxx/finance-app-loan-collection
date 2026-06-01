import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, WifiOff, BarChart3, Users } from "lucide-react";
import { config } from "@/lib/config";

export default function WelcomePage() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black flex flex-col antialiased selection:bg-primary/30">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-primary/20 rounded-full blur-[150px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" style={{ animation: 'pulse 8s infinite alternate' }} />
      
      {/* Navbar */}
      <nav className="w-full relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
            <Image src="/icon-192x192.png" alt="Logo" fill className="object-cover" sizes="40px" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">{config.appName}</span>
        </div>
        <Link href="/login/auth" className="hidden sm:flex items-center justify-center">
          <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white font-semibold text-sm transition-all active:scale-95 backdrop-blur-md">
            Sign In
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-12 pb-24 md:pt-20 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Ready for the Field
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 tracking-tighter mb-6 leading-[1.1]">
          Modernize Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Loan Collections</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-medium mb-12">
          {config.appDescription}. Built specifically for field agents operating in remote areas with seamless offline-first capabilities.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login/auth" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 group">
              Start Collecting 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-4 pb-32 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl hover:bg-white/10 transition-colors">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30">
              <WifiOff className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Offline First</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Continue collecting payments and registering customers even without internet access. Auto-syncs when you're back online.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl hover:bg-white/10 transition-colors">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
              <BarChart3 className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Live Analytics</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Track outstanding balances, collection rates, and village breakdowns instantly. Generate ledgers on the fly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl hover:bg-white/10 transition-colors">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Secure Access</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Multi-tenant architecture with Row Level Security. Agents use quick PINs for fast, secure daily access.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center bg-black/50 backdrop-blur-xl">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
