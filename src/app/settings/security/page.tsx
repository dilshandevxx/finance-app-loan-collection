"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Shield, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateAgentPin, updateAuthPassword } from "@/app/auth-actions";

export default function SecuritySettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPins, setShowPins] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isPendingPassword, startTransitionPassword] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    startTransitionPassword(async () => {
      const res = await updateAuthPassword(newPassword);
      if (res.success) {
        setPasswordSuccess("Account password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.error || "Failed to update password.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full min-h-screen px-2 sm:px-4">
      <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-4">
        <Link href="/settings">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-secondary transition-colors shadow-sm cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-foreground">Security & PIN Settings</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-gray-100 dark:border-border/30 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Agent Security PIN</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your Agent Login PIN to keep your collection dashboard secure.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleUpdatePin} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-gray-400" /> Update Agent PIN
                  </h3>
                  
                  {/* Show/Hide PIN Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPins(!showPins)}
                    className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
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
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
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
                      className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors tracking-widest text-lg font-bold"
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
                        className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors tracking-widest text-lg font-bold"
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
                        className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors tracking-widest text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4}
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 font-extrabold text-base transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 border-none"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Update Agent PIN"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Password Update Card */}
      <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm mt-6">
        <CardContent className="p-0">
          <div className="p-8 border-b border-gray-100 dark:border-border/30 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Account Password</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update the master password used to log in with your email.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Update Password
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                  >
                    {showPasswords ? (
                      <>
                        <EyeOff className="w-4 h-4" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" /> Show
                      </>
                    )}
                  </button>
                </div>

                {passwordError && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/50">New Password (min 6 chars)</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={showPasswords ? "new password" : "••••••••"}
                      className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors tracking-wide text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/50">Confirm New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={showPasswords ? "confirm password" : "••••••••"}
                      className="w-full bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors tracking-wide text-sm font-bold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPendingPassword || newPassword.length < 6 || confirmPassword.length < 6}
                  className="w-full mt-4 bg-foreground hover:bg-foreground/90 text-background rounded-2xl h-14 font-extrabold text-base transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 border-none"
                >
                  {isPendingPassword ? (
                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    "Update Password"
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
