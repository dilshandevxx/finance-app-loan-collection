"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type TopBarProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
};

export function TopBar({ title, backHref, onBack }: TopBarProps) {
  const BackButton = (
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#1f1f21] transition-colors shadow-sm cursor-pointer relative z-10"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  );

  return (
    <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2">
      {backHref ? (
        <Link href={backHref}>{BackButton}</Link>
      ) : onBack ? (
        BackButton
      ) : (
        <div className="w-10" />
      )}
      
      <span className="text-sm font-semibold tracking-tight text-foreground">{title}</span>
      <div className="w-10" /> {/* Spacer to center the title */}
    </header>
  );
}
