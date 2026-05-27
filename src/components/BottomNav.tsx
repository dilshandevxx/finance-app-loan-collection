import Link from "next/link";
import { Home, Users, PlusCircle, Settings } from "lucide-react";

export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:bottom-auto z-50">
      <div className="bg-[#1c1c1f]/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 md:px-3 md:py-6 flex md:flex-col items-center justify-between shadow-2xl gap-2 md:gap-8">
        <Link href="/" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors group relative">
          <Home className="w-6 h-6" />
          <span className="hidden md:block absolute left-14 bg-black/80 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">Dashboard</span>
        </Link>
        <Link href="/customers" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors group relative">
          <Users className="w-6 h-6" />
          <span className="hidden md:block absolute left-14 bg-black/80 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">Customers</span>
        </Link>
        <Link href="/new" className="p-2 text-white hover:scale-110 transition-transform group relative">
          <div className="bg-white text-black p-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="hidden md:block absolute left-16 bg-black/80 px-3 py-1 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">New Loan</span>
        </Link>
        <Link href="/settings" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors group relative">
          <Settings className="w-6 h-6" />
          <span className="hidden md:block absolute left-14 bg-black/80 px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">Settings</span>
        </Link>
      </div>
    </div>
  );
}
