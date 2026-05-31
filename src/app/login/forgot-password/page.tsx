"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { sendPasswordResetEmail } from "@/app/auth-actions";
import { config } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await sendPasswordResetEmail(email.trim());
      if (res.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(res.error || "Failed to send reset email.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 overflow-hidden relative">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }} />

      <div className="w-full max-w-md flex flex-col items-center z-10 p-8 rounded-[2.5rem] bg-white/5 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
        
        {/* Header with New Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative w-20 h-20 mb-6 group">
            <div className="absolute inset-0 bg-primary/40 rounded-[1.5rem] blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden border border-white/20 shadow-xl bg-black flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium max-w-[250px]">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-500/10 text-red-400 text-sm font-semibold p-4 rounded-2xl mb-8 border border-red-500/20 text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="w-full space-y-8 text-center animate-in fade-in zoom-in-95">
            <div className="bg-emerald-500/10 text-emerald-400 text-sm font-semibold p-5 rounded-2xl border border-emerald-500/20 leading-relaxed shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              If that account exists, a password reset link has been sent to your email.
            </div>
            <Link 
              href="/login/auth"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6">
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

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-14 mt-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-base tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center gap-3 relative overflow-hidden border-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link 
                href="/login/auth"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
