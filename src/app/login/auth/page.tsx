"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Key } from "lucide-react";
import { loginWithPassword } from "@/app/auth-actions";
import { config } from "@/lib/config";

export default function AuthLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithPassword(email, password);
      if (result.success) {
        router.push("/login/pin");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 overflow-hidden relative">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }} />

      <div className="w-full max-w-md flex flex-col items-center z-10 p-8 rounded-[2.5rem] bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
        
        {/* Header with New Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-20 h-20 mb-6 group">
            <div className="absolute inset-0 bg-primary/40 rounded-[1.5rem] blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden border border-white/20 shadow-xl bg-black">
              <Image 
                src="/icon-192x192.png" 
                alt="Logo" 
                fill 
                className="object-cover"
                sizes="80px"
              />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{config.appName || "LoanTrack Pro"}</h2>
          <p className="text-sm text-gray-400 mt-2 text-center font-medium">Welcome back. Please sign in to continue.</p>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 text-red-400 text-sm font-semibold p-4 rounded-2xl mb-8 border border-red-500/20 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-base text-white placeholder:text-gray-600"
                placeholder="agent@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <Link
                href="/login/forgot-password"
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-base text-white placeholder:text-gray-600 tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-base tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
