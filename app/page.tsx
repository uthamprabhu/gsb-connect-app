"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
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
  const [loading, setLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);

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
    if (!/^\+91\d{10}$/.test(phone)) {
      return toast.error("Use valid format like +919876543210");
    }
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(firebaseAuth, phone, window.recaptchaVerifier);
      setConfirmResult(result);
      toast.success("OTP sent");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!confirmResult || otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function magicLogin() {
    if (!magicKey.trim()) return toast.error("Enter your magic key");
    setLoading(true);
    try {
      const res = await api("/api/auth/magic-login", null, { method: "POST", body: JSON.stringify({ magicKey }) });
      setToken(res.token);
      setUser(res.user);
      setAttemptsLeft(res.user.attemptsLeft || 0);
      router.push(hasCompletedSetup(res.user) ? "/home" : "/setup");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="space-y-3">
        <p className="text-xs text-slate-300">Phone login (India format)</p>
        <Input placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <p className="text-xs text-slate-400">Required: country code +91 and 10-digit number.</p>
        <Button onClick={sendOtp} className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>
        <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Button onClick={verifyOtp} className="w-full" disabled={loading || !confirmResult}>
          Verify OTP
        </Button>
        <div id="recaptcha-container" />
      </Card>

      <Card className="space-y-3">
        <p className="text-xs text-slate-300">Fast login (already registered users)</p>
        <Input placeholder="Your unique magic key" value={magicKey} onChange={(e) => setMagicKey(e.target.value)} />
        <p className="text-xs text-slate-400">Required: exactly the key you created during setup.</p>
        <Button variant="ghost" className="w-full" onClick={magicLogin}>
          Login with Magic Key
        </Button>
      </Card>
    </AuthShell>
  );
}
