"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-client";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.207 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
      <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.96 3.04l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.347 4.337-17.694 10.691Z" />
      <path fill="#4CAF50" d="M24 44c5.168 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.695 36 24 36c-5.186 0-9.625-3.33-11.287-7.96l-6.525 5.025C9.495 39.556 16.227 44 24 44Z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.047 12.047 0 0 1-4.084 5.57h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
    </svg>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("popup-closed-by-user")) return "Google sign-in was canceled before it finished.";
    if (error.message.includes("popup-blocked")) return "Your browser blocked the Google popup. Please allow popups and try again.";
    if (error.message.includes("account-exists-with-different-credential")) {
      return "This Google account is already linked in a different way. Use the existing method first.";
    }
    return error.message;
  }

  return "Authentication failed. Please try again.";
}

export default function LandingPage() {
  const router = useRouter();
  const { token, user, hasHydrated, authReady, setToken, setUser, setAttemptsLeft, setAuthReady } = useAppStore();
  const [magicKey, setMagicKey] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !authReady || !token) return;
    router.replace(hasCompletedSetup(user) ? "/home" : "/setup");
  }, [authReady, hasHydrated, router, token, user]);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      setToken(res.token);
      setUser(res.user);
      setAttemptsLeft(Number(res.user.attemptsLeft) || 0);
      setAuthReady(true);
      router.replace(hasCompletedSetup(res.user) ? "/home" : "/setup");
    } catch (error) {
      const state = useAppStore.getState();
      if (!state.token) {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleMagicLogin() {
    if (!magicKey.trim()) {
      toast.error("Enter your magic key");
      return;
    }

    setMagicLoading(true);
    try {
      const res = await api("/api/auth/magic-login", null, {
        method: "POST",
        body: JSON.stringify({ magicKey }),
      });
      setToken(res.token);
      setUser(res.user);
      setAttemptsLeft(res.user.attemptsLeft || 0);
      setAuthReady(true);
      router.replace(hasCompletedSetup(res.user) ? "/home" : "/setup");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMagicLoading(false);
    }
  }

  const isBusy = googleLoading || magicLoading;
  const isRestoringSession = !hasHydrated || !authReady;

  return (
    <AuthShell>
      <Card className="space-y-4 border border-white/10 bg-slate-900/85">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Primary access</p>
          <h2 className="text-xl font-bold text-white">Continue with Google</h2>
          <p className="text-sm text-slate-300">
            Use your Google account for secure sign-in. We only use the basic profile details Google shares with your consent.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={isBusy || isRestoringSession}
          aria-label="Continue with Google"
          className="flex h-12 w-full items-center cursor-pointer justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#1f1f1f] shadow-sm transition hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? <LoaderCircle className="h-5 w-5 animate-spin text-slate-700" /> : <GoogleIcon />}
          <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        <p className="text-xs leading-5 text-slate-400">
          Your Firebase session persists locally, so you stay signed in across refreshes on this device.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">Alternative access</p>
          <h2 className="text-xl font-bold text-white">Magic Key login</h2>
          <p className="text-sm text-slate-300">Already onboarded? Your Magic Key still works exactly as before.</p>
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleMagicLogin();
          }}
        >
          <Input
            placeholder="Your unique magic key"
            value={magicKey}
            onChange={(event) => setMagicKey(event.target.value)}
            disabled={isBusy || isRestoringSession}
            autoComplete="off"
            aria-label="Magic Key"
          />
          <p className="text-xs text-slate-400">Use the exact key you created during setup.</p>
          <Button type="submit" variant="ghost" className="w-full" disabled={isBusy || isRestoringSession}>
            {magicLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4 text-cyan-300" />}
            {magicLoading ? "Signing in..." : "Continue with Magic Key"}
          </Button>
        </form>
      </Card>

      {isRestoringSession ? (
        <Card className="space-y-2 border border-cyan-400/20 bg-cyan-500/10">
          <div className="flex items-center gap-2 text-cyan-100">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Restoring your session...
          </div>
          <p className="text-xs text-cyan-50/80">Checking saved sign-in state so we can avoid unnecessary re-authentication.</p>
        </Card>
      ) : null}

      {!isRestoringSession && !token ? (
        <Card className="space-y-2 border border-white/10 bg-white/5">
          <p className="text-sm text-slate-200">Choose Google for the fastest sign-in, or use your Magic Key if you already set one up.</p>
          <p className="text-xs text-slate-400">If Google sign-in does not open, check your popup settings and try again.</p>
        </Card>
      ) : null}
    </AuthShell>
  );
}
