import Link from "next/link";
import { Home, Users, PlusCircle, Settings, FileText } from "lucide-react";

export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:bottom-auto z-50">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-full px-6 py-3 md:px-3 md:py-6 flex md:flex-col items-center justify-between shadow-2xl gap-2 md:gap-8">
        <Link href="/" className="p-2 text-white/50 hover:text-white hover:bg-[#111] rounded-full transition-colors group relative">
          <Home className="w-5 h-5" />
          <span className="hidden md:block absolute left-14 bg-[#111] px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#222]">Dashboard</span>
        </Link>
        <Link href="/customers" className="p-2 text-white/50 hover:text-white hover:bg-[#111] rounded-full transition-colors group relative">
          <Users className="w-5 h-5" />
          <span className="hidden md:block absolute left-14 bg-[#111] px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#222]">Customers</span>
        </Link>
        <Link href="/new" className="p-2 text-white hover:scale-105 transition-transform group relative">
          <div className="bg-white text-black p-2.5 rounded-full shadow-sm">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="hidden md:block absolute left-16 bg-[#111] px-3 py-1 rounded-md text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#222]">New Loan</span>
        </Link>
        <Link href="/reports" className="p-2 text-white/50 hover:text-white hover:bg-[#111] rounded-full transition-colors group relative">
          <FileText className="w-5 h-5" />
          <span className="hidden md:block absolute left-14 bg-[#111] px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#222]">Reports</span>
        </Link>
        <Link href="/settings" className="p-2 text-white/50 hover:text-white hover:bg-[#111] rounded-full transition-colors group relative">
          <Settings className="w-5 h-5" />
          <span className="hidden md:block absolute left-14 bg-[#111] px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[#222]">Settings</span>
        </Link>
      </div>
    </div>
  );
}
