"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { KeyRound, MessageSquareLock, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebase-client";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";

export default function LandingPage() {
  const router = useRouter();
  const { token, setToken, setUser, setAttemptsLeft } = useAppStore();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [magicKey, setMagicKey] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const normalizedPhone = phone.trim();
  const isValidE164 = /^\+[1-9]\d{7,14}$/.test(normalizedPhone);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", { size: "invisible" });
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    api("/api/user/me", token)
      .then((res) => {
        setUser(res.user);
        setAttemptsLeft(res.user.attemptsLeft || 0);
        router.push(hasCompletedSetup(res.user) ? "/home" : "/setup");
      })
      .catch(() => {});
  }, [router, setAttemptsLeft, setUser, token]);

  async function sendOtp() {
    if (!isValidE164) {
      return toast.error("Use international format like +14155552671");
    }
    setSendingOtp(true);
    try {
      const result = await signInWithPhoneNumber(firebaseAuth, normalizedPhone, window.recaptchaVerifier);
      setConfirmResult(result);
      toast.success("OTP sent");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    if (!confirmResult || otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setVerifyingOtp(true);
    try {
      const cred = await confirmResult.confirm(otp);
      const idToken = await cred.user.getIdToken();
      const res = await api("/api/auth/verify", null, { method: "POST", body: JSON.stringify({ idToken }) });
      setToken(res.token);
      setUser(res.user);
      setAttemptsLeft(res.user.attemptsLeft || 0);
      router.push(hasCompletedSetup(res.user) ? "/home" : "/setup");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function magicLogin() {
    if (!magicKey.trim()) return toast.error("Enter your magic key");
    setMagicLoading(true);
    try {
      const res = await api("/api/auth/magic-login", null, { method: "POST", body: JSON.stringify({ magicKey }) });
      setToken(res.token);
      setUser(res.user);
      setAttemptsLeft(res.user.attemptsLeft || 0);
      router.push(hasCompletedSetup(res.user) ? "/home" : "/setup");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="space-y-3">
        <p className="text-xs text-slate-300">Phone login (global)</p>
        <Input placeholder="+14155552671" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <p className="text-xs text-amber-300">
          Enter full country code with no spaces. Examples: India `+919876543210`, UAE `+971501234567`, USA `+14155552671`
        </p>
        {isValidE164 ? (
          <Button onClick={sendOtp} className="w-full" disabled={sendingOtp || verifyingOtp || magicLoading}>
            <PhoneCall className="mr-2 h-4 w-4" />
            {sendingOtp ? "Sending..." : "Send OTP"}
          </Button>
        ) : (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Use valid E.164 format: starts with `+` and country code, no spaces.
          </div>
        )}
        <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Button onClick={verifyOtp} className="w-full" disabled={sendingOtp || verifyingOtp || magicLoading || !confirmResult}>
          <MessageSquareLock className="mr-2 h-4 w-4" />
          {verifyingOtp ? "Verifying..." : "Verify OTP"}
        </Button>
        <div id="recaptcha-container" />
      </Card>

      <Card className="space-y-3">
        <p className="text-xs text-slate-300">Fast login (already registered users)</p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void magicLogin();
          }}
        >
          <Input placeholder="Your unique magic key" value={magicKey} onChange={(e) => setMagicKey(e.target.value)} />
          <p className="text-xs text-slate-400">Required: exactly the key you created during setup.</p>
          <Button type="submit" variant="ghost" className="w-full" disabled={sendingOtp || verifyingOtp || magicLoading}>
            <KeyRound className="mr-2 h-4 w-4 text-cyan-300" />
            {magicLoading ? "Submitting..." : "Login with Magic Key"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
