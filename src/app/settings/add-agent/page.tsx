"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User, Building2, Mail, Key, ShieldCheck } from "lucide-react";
import { adminCreateAgent } from "@/app/auth-actions";

export default function AddAgentPage() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminCreateAgent(fullName, companyName, email, tempPassword);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/settings");
        }, 3000);
      } else {
        setError(result.error || "Failed to create agent");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full flex flex-col gap-6 pb-32 md:pb-12 max-w-2xl mx-auto px-4 pt-8">
        <div className="bg-card border border-border rounded-3xl p-8 text-center flex flex-col items-center shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Agent Created!</h2>
          <p className="text-muted-foreground mt-2 font-medium">
            The new agent account and company workspace have been provisioned successfully.
          </p>
          <p className="text-sm text-foreground mt-4 font-bold p-4 bg-secondary rounded-xl border border-border">
            Please share the temporary password with the agent. They will set their own PIN upon first login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-32 md:pb-12 max-w-2xl mx-auto px-4 pt-8">
      {/* Header */}
      <header className="flex items-center gap-4 bg-card p-4 rounded-[1.75rem] border border-border shadow-sm mb-2">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-secondary hover:bg-border/50 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Create New Agent</h1>
      </header>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="bg-primary/10 p-3 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black">Superadmin Provisioning</h2>
            <p className="text-xs text-muted-foreground">Create a new isolated company workspace for an agent.</p>
          </div>
        </div>

        {error && (
          <div className="w-full bg-destructive/10 text-destructive text-sm font-semibold p-4 rounded-xl mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateAgent} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Agent Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary border border-border focus:border-primary focus:bg-background outline-none transition-all text-sm text-foreground"
                placeholder="Agent Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Company / Organization</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary border border-border focus:border-primary focus:bg-background outline-none transition-all text-sm text-foreground"
                placeholder="Their Loan Company Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address (Login ID)</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary border border-border focus:border-primary focus:bg-background outline-none transition-all text-sm text-foreground"
                placeholder="agent@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Temporary Password</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                minLength={6}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary border border-border focus:border-primary focus:bg-background outline-none transition-all text-sm text-foreground tracking-wide font-mono"
                placeholder="TempPass123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 rounded-xl bg-primary text-primary-foreground font-black text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Provisioning...</span>
              </>
            ) : (
              <span>Create Agent Workspace</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
