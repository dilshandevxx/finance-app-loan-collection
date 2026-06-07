"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import { CredFlowLogo } from "@/components/CredFlowLogo";

export default function SplashOnboarding() {
  return (
    <div className="min-h-[100dvh] bg-[#07050F] flex flex-col relative overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <CredFlowLogo className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold tracking-tight">{config.appName}</span>
        </div>
      </header>

      {/* FLOATING 3D COINS / DISCS - CSS ONLY */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        
        {/* Purple Coin (Bottom Left) */}
        <div 
          className="absolute w-[280px] h-[280px] rounded-full top-[25%] -left-[15%] rotate-12 animate-float-slow"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #4c1d95 100%)',
            boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.5), inset 20px 20px 40px rgba(255,255,255,0.4), 0 30px 60px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-white/20" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 mix-blend-overlay" />
        </div>

        {/* Green Coin (Top Right) */}
        <div 
          className="absolute w-[200px] h-[200px] rounded-full -top-[5%] -right-[10%] -rotate-12 animate-float-medium"
          style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #065f46 100%)',
            boxShadow: 'inset -15px -15px 30px rgba(0,0,0,0.5), inset 15px 15px 30px rgba(255,255,255,0.4), 0 20px 40px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="absolute inset-3 rounded-full border border-white/20" style={{ boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 mix-blend-overlay" />
        </div>

        {/* Red/Pink Coin (Middle Right) */}
        <div 
          className="absolute w-[160px] h-[160px] rounded-full top-[50%] -right-[5%] rotate-45 animate-float-fast"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #881337 100%)',
            boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.4), 0 15px 30px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="absolute inset-2.5 rounded-full border border-white/20" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 mix-blend-overlay" />
        </div>

      </div>

      {/* CONTENT AREA (BOTTOM) */}
      <div className="mt-auto relative z-20 px-6 pb-10 pt-32 bg-gradient-to-t from-[#07050F] via-[#07050F]/90 to-transparent">
        <h1 className="text-[42px] leading-[1.1] font-bold text-white tracking-tight mb-4 max-w-[300px]">
          Invest smarter.<br />
          Earn stronger.
        </h1>
        <p className="text-[#8B80A8] text-[15px] leading-relaxed mb-10 max-w-[320px] font-medium">
          Track assets, uncover trends, and grow your portfolio with precision and clarity.
        </p>

        <Link href="/login/auth" className="block w-full">
          <button className="w-full h-14 bg-white text-black font-bold text-[16px] rounded-[1.25rem] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center">
            Get Started
          </button>
        </Link>
      </div>

    </div>
  );
}
