"use client";

import { useEffect, useState, useRef } from "react";
import { Customer } from "@/data/db";
import { Search, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GlobalSearchModalProps {
  customers: Customer[];
}

export function GlobalSearchModal({ customers }: GlobalSearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle modal on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      
      // Close on Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCustomers = customers
    .filter((c) => {
      if (!query) return false;
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.memberId?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5); // Limit to top 5 results

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen || filteredCustomers.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCustomers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCustomers.length) % filteredCustomers.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCustomers[selectedIndex];
        if (selected) {
          setIsOpen(false);
          router.push(`/customers/${selected.id}`);
        }
      }
    };

    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredCustomers, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0A0514]/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0A0514]/90 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {/* Search Input Area */}
        <div className="relative flex items-center px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50 shrink-0 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, or area..."
            className="w-full bg-transparent border-none text-lg text-white font-medium placeholder:text-white/30 focus:outline-none focus:ring-0 px-4"
          />
          <div className="shrink-0 text-xs font-bold text-white/30 bg-white/5 px-2 py-1 rounded-md border border-white/5 mr-2">
            ESC
          </div>
        </div>

        {/* Results Area */}
        <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto">
          {query.length > 0 && filteredCustomers.length === 0 ? (
            <div className="px-6 py-8 text-center text-white/50 text-sm">
              No results found for <span className="text-white font-bold">"{query}"</span>
            </div>
          ) : query.length === 0 ? (
            <div className="px-6 py-6 text-center text-white/30 text-sm">
              Start typing to search your portfolio...
            </div>
          ) : (
            filteredCustomers.map((customer, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={customer.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/customers/${customer.id}`);
                  }}
                  className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-white/10 border-l-2 border-primary" : "hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black tracking-widest text-xs shrink-0 ${
                    isSelected ? "bg-primary text-white" : "bg-white/10 text-white/70"
                  }`}>
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold ${isSelected ? "text-white" : "text-white/90"}`}>
                      {customer.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                        {customer.state || "Unknown Area"}
                      </span>
                      {customer.memberId && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-xs font-medium text-white/40">
                            ID: {customer.memberId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 ml-auto transition-transform ${isSelected ? "text-primary translate-x-1" : "text-transparent"}`} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
