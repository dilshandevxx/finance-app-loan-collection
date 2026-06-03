import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, WifiOff, BarChart3, MapPin, Circle, PlayCircle, Star } from "lucide-react";
import { config } from "@/lib/config";
import { CredFlowLogo } from "@/components/CredFlowLogo";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* ── Nav ── */}
      <header className="w-full border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CredFlowLogo className="w-8 h-8" />
            <span className="text-sm font-semibold tracking-tight">{config.appName}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login/auth" className="text-xs font-semibold uppercase tracking-widest hover:text-white/70 transition-colors">
              Sign In
            </Link>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors shrink-0">
              <div className="w-3 h-px bg-current shadow-[0_4px_0_0_currentColor,0_-4px_0_0_currentColor]"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full">
        
        {/* ── Hero ── */}
        <section className="w-full border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 pt-20 pb-32 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div>
              <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-bold tracking-tighter leading-[1.0] text-white mb-8">
                Collect.<br />
                Track.<br />
                <span className="text-primary">Grow.</span>
              </h1>
            </div>
            
            <div className="max-w-xs md:max-w-sm flex flex-col items-start gap-8">
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Think of this as the world's most advanced loan collection platform. Built for field agents, blending modern mobility with the reassurance of professional design.
              </p>
              <Link href="/login/auth">
                <button className="px-6 py-3 bg-primary text-black hover:bg-transparent hover:text-primary border border-primary transition-colors text-xs font-bold uppercase tracking-widest">
                  Start Collecting
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── What We Do ── */}
        <section className="w-full border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
              <div className="md:col-span-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">What We Do</h2>
              </div>
              
              <div className="md:col-span-4 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-white mb-4">Field Collection</h3>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Offline Mode</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Route Areas</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">PDF Receipts</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Quick Search</p>
                
                <Link href="/login/auth" className="mt-8 inline-block">
                  <button className="px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest">
                    See Details
                  </button>
                </Link>
              </div>
              
              <div className="md:col-span-4 flex flex-col gap-3 mt-8 md:mt-0">
                <h3 className="text-sm font-bold text-white mb-4">Management</h3>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Live Analytics</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Full Reports</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">PIN Access</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Agent Tracking</p>
              </div>
            </div>
            
            <div className="mt-32 flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8 text-center">We are honored to work with leading brands</p>
              <div className="flex flex-wrap justify-center gap-12 items-center opacity-50 grayscale">
                <span className="text-xl font-black tracking-tighter">F I N C O</span>
                <span className="text-xl font-serif italic tracking-wide">Nexus</span>
                <span className="text-xl font-bold uppercase tracking-widest flex items-center gap-2"><Circle className="w-4 h-4 fill-current"/> Orbit</span>
                <span className="text-lg font-medium tracking-tight">C R E D I T O</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Work (Features Visuals) ── */}
        <section className="w-full border-b border-white/10 bg-[#0a0a0a]">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-32">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">Our Platform</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="aspect-square sm:aspect-[4/5] bg-[#111] p-8 flex flex-col justify-between group cursor-pointer border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-opacity" />
                <WifiOff className="w-8 h-8 text-white/30 group-hover:text-white transition-colors relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Offline First</h3>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Collect anywhere. Auto-sync later when you have internet.</p>
                </div>
              </div>
              <div className="aspect-square sm:aspect-[4/5] bg-[#111] p-8 flex flex-col justify-between group cursor-pointer border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-[url('/mobile_ui.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-[#111]/80" />
                <MapPin className="w-8 h-8 text-white/30 group-hover:text-white transition-colors relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Smart Routing</h3>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Organize customers by area and focus on the daily target.</p>
                </div>
              </div>
              <div className="aspect-square sm:aspect-[4/5] bg-[#111] p-8 flex flex-col justify-between group cursor-pointer border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-50 transition-opacity duration-500 bg-[url('/finance_dashboard.png')] bg-cover bg-left" />
                <div className="absolute inset-0 bg-[#111]/80" />
                <BarChart3 className="w-8 h-8 text-white/30 group-hover:text-primary transition-colors relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 text-white">Real-time Analytics</h3>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Know your numbers instantly without any manual work.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/login/auth">
                <button className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-black transition-colors text-xs font-bold uppercase tracking-widest bg-[#111]">
                  View All Features
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats & Awards ── */}
        <section className="w-full border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
              <div className="md:col-span-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Our Scale</h2>
                <p className="text-sm text-white/60 font-light leading-relaxed max-w-sm">
                  You get results, we get records. Built to scale seamlessly with your growing collection business across any region.
                </p>
              </div>
              
              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
                  <h3 className="font-bold text-lg">Performance</h3>
                  <span className="text-sm font-bold text-white/50">99.9%</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-white/60 font-light">Uptime</span>
                    <span className="font-medium">99.99%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-white/60 font-light">Sync Speed</span>
                    <span className="font-medium">&lt; 1s</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-white/60 font-light">Data Security</span>
                    <span className="font-medium">AES-256</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-4 mt-8 md:mt-0">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
                  <h3 className="font-bold text-lg">Milestones</h3>
                  <span className="text-sm font-bold text-white/50">2026</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-white/60 font-light">Collections</span>
                    <span className="font-medium">1M+</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                    <span className="text-white/60 font-light">Active Agents</span>
                    <span className="font-medium">5,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Video/Image Placeholder ── */}
        <section className="w-full border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-24">
            <div className="w-full aspect-video md:aspect-[21/9] bg-[#111] flex items-center justify-center relative overflow-hidden group cursor-pointer border border-white/10">
              <div className="absolute inset-0 bg-[#111]/60 z-10" />
              <div className="absolute inset-0 opacity-40 bg-[url('/finance_dashboard.png')] bg-cover bg-center group-hover:scale-105 transition-transform duration-[2000ms] ease-out" />
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/30 flex items-center justify-center z-20 group-hover:bg-white group-hover:text-black transition-colors backdrop-blur-sm">
                <PlayCircle className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="w-full border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
              <div className="lg:col-span-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">What They Think</h2>
              </div>
              
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "Kamal Perera", role: "Field Agent", quote: "This platform is more familiar with field work than good internet." },
                  { name: "Nuwan Silva", role: "Collection Manager", quote: "It is so resilient, unbothered by patchy connections. Because that's what it lives with." },
                  { name: "Ruwan Dias", role: "Finance Director", quote: "A designed beauty the loan software industry has not asked for. There is nothing left to add." },
                  { name: "Asela Fernando", role: "Field Supervisor", quote: "The platform is more familiar with field design than good design." },
                ].map((t, i) => (
                  <div key={i} className="p-8 border border-white/10 bg-[#0a0a0a] flex flex-col gap-6 hover:border-white/20 hover:bg-[#111] transition-all cursor-default">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-white/90">"{t.quote}"</p>
                    <div className="flex items-center gap-3 mt-auto pt-5 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full bg-[#222] overflow-hidden shrink-0 border border-white/10 relative">
                         <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.replace(' ', '')}`} alt={t.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">{t.name}</h4>
                        <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="w-full bg-[#0a0a0a]">

          {/* Top CTA block */}
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 pt-24 pb-20 border-b border-white/10">
            <p className="text-[clamp(1.6rem,4vw,3.2rem)] font-bold leading-snug text-white max-w-3xl mb-10">
              Smart collection software that turns your field agents into a
              high-performance team.
            </p>
            <Link href="/login/auth">
              <button className="px-8 py-4 bg-primary text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors">
                Get Started →
              </button>
            </Link>
          </div>

          {/* Middle: logo + start a project + addresses */}
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-16 border-b border-white/10">

            {/* Logo row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-14">
              <div className="flex items-center gap-3">
                <CredFlowLogo className="w-10 h-10" />
                <span className="text-xl font-black tracking-tighter text-white">{config.appName}</span>
              </div>
              <Link href="/login/auth" className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-widest hover:text-primary transition-colors">
                Start a Project <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Office addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-sm text-white/50 font-light">
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-3">Colombo</p>
                <p className="leading-loose">
                  Level 4, Access Tower<br />
                  Union Place, Colombo 02<br />
                  Sri Lanka<br />
                  Tel: +94 11 234 5678
                </p>
              </div>
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-3">Kandy</p>
                <p className="leading-loose">
                  No. 12, Dalada Veediya<br />
                  Kandy, 20000<br />
                  Sri Lanka<br />
                  Tel: +94 81 223 4567
                </p>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-3">Contact</p>
                  <p className="leading-loose">
                    hello@credflow.com<br />
                    support@credflow.com
                  </p>
                </div>
                {/* Social icons */}
                <div className="flex items-center gap-4 mt-8">
                  <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-primary hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-primary hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <Link href="#" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Cookie Policy</Link>
              <Link href="#" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Terms of Service</Link>
            </div>
            <span className="text-[10px] text-white/20 uppercase tracking-widest">
              © {new Date().getFullYear()} {config.appName} Ltd
            </span>
          </div>

        </footer>
        
      </main>
    </div>
  );
}
