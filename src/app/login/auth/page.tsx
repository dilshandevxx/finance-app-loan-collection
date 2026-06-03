"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Key } from "lucide-react";
import { loginWithPassword } from "@/app/auth-actions";
import { config } from "@/lib/config";
import { CredFlowLogo } from "@/components/CredFlowLogo";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 overflow-hidden relative">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-[150px] mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }} />

      <div className="w-full max-w-md flex flex-col items-center z-10 p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-3xl border border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.2)]">
        
        {/* Header with New Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center rounded-[2rem] bg-black/80 border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:blur-2xl transition-all duration-500" />
            <CredFlowLogo className="w-12 h-12 relative z-10 drop-shadow-[0_0_15px_rgba(255,184,0,0.5)] group-hover:scale-105 transition-transform" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{config.appName}</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center font-light">Welcome back. Please sign in to continue.</p>
        </div>

        {error && (
          <div className="w-full bg-destructive/20 text-destructive-foreground text-sm font-semibold p-4 rounded-2xl mb-8 border border-destructive/30 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/50 border border-white/10 focus:border-primary focus:bg-black outline-none transition-all text-base text-foreground placeholder:text-muted-foreground/50"
                placeholder="agent@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Password</label>
              <Link
                href="/login/forgot-password"
                className="text-xs font-bold text-primary hover:brightness-110 transition-all cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/50 border border-white/10 focus:border-primary focus:bg-black outline-none transition-all text-base text-foreground placeholder:text-muted-foreground/50 tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-8 rounded-2xl bg-primary text-black font-extrabold text-base tracking-wide shadow-[0_0_20px_rgba(255,184,0,0.2)] hover:shadow-[0_0_30px_rgba(255,184,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
