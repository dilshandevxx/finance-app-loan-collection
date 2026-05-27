"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/auth-actions";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <button 
      onClick={handleLogout}
      className="relative shrink-0 w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#222] border border-gray-200 dark:border-[#333] flex items-center justify-center text-red-500 dark:text-red-400 dark:hover:bg-[#333] transition-all active:scale-95 shadow-sm"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
