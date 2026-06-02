"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/auth-actions";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/welcome");
  };

  return (
    <button 
      onClick={handleLogout}
      className="relative shrink-0 w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-secondary border border-gray-200 dark:border-border flex items-center justify-center text-red-500 dark:text-red-400 dark:hover:bg-muted transition-all active:scale-95 shadow-sm"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
