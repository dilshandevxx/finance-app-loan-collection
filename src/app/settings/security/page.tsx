"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Shield, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateAgentPin } from "@/app/auth-actions";

export default function SecuritySettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPins, setShowPins] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (currentPin.length !== 4 || !/^\d{4}$/.test(currentPin)) {
      setError("Current PIN must be a 4-digit number.");
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("New PIN must be a 4-digit number.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PIN and confirmation do not match.");
      return;
    }
    if (currentPin === newPin) {
      setError("New PIN cannot be the same as the current PIN.");
      return;
    }

    startTransition(async () => {
      const res = await updateAgentPin(currentPin, newPin);
      if (res.success) {
        setSuccess("Agent PIN updated successfully!");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      } else {
        setError(res.error || "Failed to update PIN.");
      }
    });
  };

  const handleNumericInput = (val: string, setter: (v: string) => void) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 4);
    setter(cleaned);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full min-h-screen px-2 sm:px-4">
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-br from-neutral-50/60 via-white to-neutral-100/40 dark:from-[#1a1a1c] dark:via-[#141416] dark:to-[#0c0c0d] p-4 rounded-[1.75rem] border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative overflow-hidden mb-4">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#1f1f21] transition-colors shadow-sm cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-black dark:text-white">Security & PIN Settings</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-gray-100 dark:border-border/60 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">Agent Security PIN</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
                Manage your Agent Login PIN to keep your collection dashboard secure.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleUpdatePin} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-gray-400" /> Update Agent PIN
                  </h3>
                  
                  {/* Show/Hide PIN Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="text-xs font-bold text-black dark:text-neon-lime hover:opacity-80 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                  >
                    {showPins ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide PIN digits
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show PIN digits
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-4 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 text-black dark:text-neon-lime text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-neon-lime" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/50">Current 4-Digit PIN</label>
                    <input
                      type={showPins ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={currentPin}
                      onChange={(e) => handleNumericInput(e.target.value, setCurrentPin)}
                      placeholder={showPins ? "0000" : "••••"}
                      className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/20 transition-colors tracking-widest text-lg font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-white/50">New 4-Digit PIN</label>
                      <input
                        type={showPins ? "text" : "password"}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => handleNumericInput(e.target.value, setNewPin)}
                        placeholder={showPins ? "0000" : "••••"}
                        className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/20 transition-colors tracking-widest text-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 dark:text-white/50">Confirm New PIN</label>
                      <input
                        type={showPins ? "text" : "password"}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => handleNumericInput(e.target.value, setConfirmPin)}
                        placeholder={showPins ? "0000" : "••••"}
                        className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-black dark:text-white focus:outline-none focus:border-neon-lime dark:focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/20 transition-colors tracking-widest text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4}
                  className="w-full mt-4 bg-neon-lime hover:bg-neon-lime/90 text-black rounded-2xl h-14 font-extrabold text-base transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Update Agent PIN"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
