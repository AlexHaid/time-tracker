"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Timer, AlertCircle, Loader2, Lock, KeyRound } from "lucide-react";

type AuthMode = "loading" | "setup" | "unlock";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("loading");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Setup fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Unlock field
  const [unlockPassword, setUnlockPassword] = useState("");

  // Check if app needs setup on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setMode(data.isSetup ? "unlock" : "setup");
      } catch {
        setMode("unlock"); // fallback
      }
    })();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Setup failed");
        setLoading(false);
        return;
      }

      // Setup done — now auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!loginRes.ok) {
        setError("Password set! Please unlock the app.");
        setMode("unlock");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: unlockPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Wrong password");
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Loading state while checking setup status
  if (mode === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Timer className="h-6 w-6 animate-pulse text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Timer className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Time Tracker</h1>
            <p className="text-xs text-muted-foreground">Track your time across days</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              {mode === "setup" ? (
                <KeyRound className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-lg">
              {mode === "setup" ? "Create your password" : "Unlock"}
            </CardTitle>
            <CardDescription>
              {mode === "setup"
                ? "Set a password to protect your time tracking data. This password is not stored in the code."
                : "Enter your password to access the app."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {mode === "setup" ? (
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Set Password
                </Button>
              </form>
            ) : (
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unlock-password" className="sr-only">Password</Label>
                  <Input
                    id="unlock-password"
                    type="password"
                    placeholder="Enter password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Unlock
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
