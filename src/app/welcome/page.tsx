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
                <span className="text-white/50">Grow.</span>
              </h1>
            </div>
            
            <div className="max-w-xs md:max-w-sm flex flex-col items-start gap-8">
              <p className="text-sm text-white/60 leading-relaxed font-light">
                Think of this as the world's most advanced loan collection platform. Built for field agents, blending modern mobility with the reassurance of professional design.
              </p>
              <Link href="/login/auth">
                <button className="px-6 py-3 bg-white text-black hover:bg-transparent hover:text-white border border-white transition-colors text-xs font-bold uppercase tracking-widest">
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
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Route Villages</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">PDF Receipts</p>
                <p className="text-sm text-white/60 font-light hover:text-white transition-colors cursor-default">Quick Search</p>
                
                <Link href="/login/auth" className="mt-8 inline-block">
                  <button className="px-5 py-2.5 border border-white/20 hover:border-white transition-colors text-[10px] font-bold uppercase tracking-widest">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80" />
                <MapPin className="w-8 h-8 text-white/30 group-hover:text-white transition-colors relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Smart Routing</h3>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Organize customers by village and focus on the daily target.</p>
                </div>
              </div>
              <div className="aspect-square sm:aspect-[4/5] bg-[#111] p-8 flex flex-col justify-between group cursor-pointer border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-50 transition-opacity duration-500 bg-[url('/finance_dashboard.png')] bg-cover bg-left" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80" />
                <BarChart3 className="w-8 h-8 text-white/30 group-hover:text-[#FFB800] transition-colors relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 text-white">Real-time Analytics</h3>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Know your numbers instantly without any manual work.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/login/auth">
                <button className="px-6 py-3 border border-white/20 hover:border-white transition-colors text-xs font-bold uppercase tracking-widest bg-[#111]">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
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
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />)}
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

        {/* ── Footer / Let's Work ── */}
        <footer className="w-full bg-[#030303]">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 pt-32 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 mb-24 md:mb-32 border-b border-white/10 pb-16 text-center md:text-left">
              <h2 className="text-[clamp(3rem,10vw,7rem)] font-bold tracking-tighter leading-none">Let's Work</h2>
              <Link href="/login/auth">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-white/50 flex flex-col items-center justify-center hover:bg-white hover:text-black hover:scale-105 transition-all cursor-pointer group relative overflow-hidden shrink-0">
                  <div className="absolute inset-2 rounded-full border border-dashed border-current animate-[spin_15s_linear_infinite] opacity-50 group-hover:opacity-100" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center leading-tight z-10">Start<br/>Now</span>
                </div>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-xs font-light">
              <div className="flex flex-col gap-3">
                <h4 className="font-bold mb-2">Sitemap</h4>
                <Link href="#" className="text-white/50 hover:text-white transition-colors">Home</Link>
                <Link href="#" className="text-white/50 hover:text-white transition-colors">About</Link>
                <Link href="#" className="text-white/50 hover:text-white transition-colors">Features</Link>
                <Link href="#" className="text-white/50 hover:text-white transition-colors">Pricing</Link>
              </div>
              
              <div className="flex flex-col gap-3">
                <h4 className="font-bold mb-2">Contact</h4>
                <p className="text-white/50 leading-relaxed">123 Colombo Road<br/>Colombo 00300, Sri Lanka</p>
                <p className="text-white/50 mt-2">T: +94 11 234 5678</p>
                <p className="text-white/50 hover:text-white transition-colors cursor-pointer">E: hello@domain.com</p>
              </div>
              
              <div className="sm:col-span-2">
                <h4 className="font-bold mb-4">Subscribe to our newsletter</h4>
                <div className="flex items-center border-b border-white/20 pb-2 focus-within:border-white transition-colors">
                  <input type="email" placeholder="Email Address" className="bg-transparent outline-none flex-1 text-xs placeholder:text-white/30" />
                  <button className="hover:scale-110 transition-transform p-1"><ArrowUpRight className="w-4 h-4 text-white hover:text-white" /></button>
                </div>
              </div>
            </div>
            
            <div className="mt-24 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">
                © {new Date().getFullYear()} {config.appName} Platform
              </span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">
                Built for Sri Lanka
              </span>
            </div>
          </div>
        </footer>
        
      </main>
    </div>
  );
}
