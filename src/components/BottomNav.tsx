import Link from "next/link";
import { Home, Users, PlusCircle, Settings, FileText } from "lucide-react";

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50">
      <div className="bg-white/90 backdrop-blur-xl dark:bg-[#0a0a0a]/90 border-t md:border border-gray-200 dark:border-[#222] md:rounded-full px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:px-3 md:py-6 flex md:flex-col items-center justify-around shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl">
        
        <Link href="/" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors flex-1 md:flex-none group relative">
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Home</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-[#111] px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-[#222]">Dashboard</span>
        </Link>
        
        <Link href="/customers" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors flex-1 md:flex-none group relative">
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Clients</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-[#111] px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-[#222]">Customers</span>
        </Link>
        
        <Link href="/new" className="flex flex-col items-center gap-1 text-black dark:text-white hover:scale-105 transition-transform flex-1 md:flex-none group relative md:my-2">
          <div className="bg-black text-white dark:bg-white dark:text-black p-3 md:p-3 rounded-full shadow-lg -mt-5 md:mt-0 border-4 border-white dark:border-[#0a0a0a]">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium block md:hidden">New</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-[#111] px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-[#222]">New Loan</span>
        </Link>
        
        <Link href="/reports" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors flex-1 md:flex-none group relative">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Reports</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-[#111] px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-[#222]">Reports</span>
        </Link>
        
        <Link href="/settings" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors flex-1 md:flex-none group relative">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Settings</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-[#111] px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-[#222]">Settings</span>
        </Link>
        
      </div>
    </div>
  );
}
