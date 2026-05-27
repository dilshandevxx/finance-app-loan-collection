"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Delete, ShieldCheck, Lock } from "lucide-react";
import { loginWithPin } from "@/app/auth-actions";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // Simulate slight network delay for premium feel
      await new Promise(r => setTimeout(r, 600));
      
      const result = await loginWithPin(pin);
      if (result.success) {
        router.push("/");
      } else {
        setError(true);
        setPin("");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setPin("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black px-4 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 ease-out z-10">
        
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform transition-transform hover:scale-105">
          <ShieldCheck className="w-10 h-10 text-white dark:text-black" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-black dark:text-white mb-2 text-center">
          LoanTrack <span className="text-emerald-600 dark:text-emerald-400">Pro</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 text-center">
          Enter your Agent PIN to continue
        </p>

        {/* PIN Indicators */}
        <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > index 
                  ? 'bg-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                  : error 
                    ? 'bg-red-500/20'
                    : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={loading}
              className="w-full aspect-square rounded-full bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] text-2xl font-semibold text-black dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-[#222] active:scale-90 transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="w-full aspect-square"></div>
          <button
            onClick={() => handleNumberClick(0)}
            disabled={loading}
            className="w-full aspect-square rounded-full bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] text-2xl font-semibold text-black dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-[#222] active:scale-90 transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="w-full aspect-square rounded-full bg-transparent text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50/80 dark:bg-black/80 backdrop-blur-sm rounded-3xl">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          </div>
        )}

        <div className="mt-12 flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          <Lock className="w-3 h-3" /> Secure Login
        </div>
      </div>
    </div>
  );
}
