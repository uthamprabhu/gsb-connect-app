"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Heart, LoaderCircle, Sparkles, Copy, ExternalLink } from "lucide-react";
import { IoGameController } from "react-icons/io5";
import { toast } from "sonner";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { enableFcmAndGetToken } from "@/lib/fcm-client";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomNav } from "@/components/bottom-nav";
import { LegalFooter } from "@/components/legal-footer";

export default function HomePage() {
  const router = useRouter();
  const {
    token,
    user,
    hasHydrated,
    authReady,
    attemptsLeft,
    notifications,
    stats,
    setUser,
    setAttemptsLeft,
    setNotifications,
    setStats,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [matchRevealDismissed, setMatchRevealDismissed] = useState(false);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const meLoadedRef = useRef(false);
  const autoRegisteredTokenRef = useRef<string | null>(null);
  const currentUser = (user || {}) as {
    displayName?: string;
    instagramUsername?: string;
    instagramUrl?: string;
    activeMatch?: { instagramUsername?: string; instagramUrl?: string };
    freezeUntil?: string | null;
    isFreezeActive?: boolean;
    termsAccepted?: boolean;
  };

  useEffect(() => {
    if (!hasHydrated || !authReady) return;
    if (!token) return router.replace("/");
    if (user && !hasCompletedSetup(user)) return router.replace("/setup");
    if (meLoadedRef.current) return;
    meLoadedRef.current = true;

    api("/api/user/me", token)
      .then((res) => {
        setUser(res.user);
        setAttemptsLeft(Number(res.user.attemptsLeft) || 0);
        setStats(
          res.stats || {
            totalUsers: 0,
            maleCount: 0,
            femaleCount: 0,
          },
        );
      })
      .catch(() => {
        meLoadedRef.current = false;
      });
  }, [authReady, hasHydrated, router, setAttemptsLeft, setStats, setUser, token, user]);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        const res = await api("/api/notifications", token);
        setNotifications(res.notifications || []);
        setPendingRequestIds(
          Array.isArray(res.pendingRequests) ? res.pendingRequests.map((id: unknown) => String(id)) : [],
        );
      } catch {}
    };
    void fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [setNotifications, token]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ratio = useMemo(() => (stats.totalUsers ? `${stats.maleCount}/${stats.femaleCount}` : "0/0"), [stats]);
  const canShowPrompt =
    mounted &&
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission !== "granted";
  const freezeActive = !!currentUser.isFreezeActive;
  const canShowRevealModal = !!currentUser.activeMatch && freezeActive && !matchRevealDismissed;

  async function registerFcmTokenWithSessionRetry(fcmToken: string) {
    const firstToken = useAppStore.getState().token;
    if (!firstToken) throw new Error("Unauthorized");

    try {
      await api("/api/notifications/register-token", firstToken, {
        method: "POST",
        body: JSON.stringify({ fcmToken }),
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("unauthorized")) {
        throw error;
      }
    }

    const secondToken = useAppStore.getState().token;
    if (!secondToken || secondToken === firstToken) {
      throw new Error("Unauthorized");
    }

    await api("/api/notifications/register-token", secondToken, {
      method: "POST",
      body: JSON.stringify({ fcmToken }),
    });
  }

  async function enableNotifications() {
    if (!hasHydrated || !authReady || !token) {
      toast.error("Session is still loading. Try again in a moment.");
      return;
    }

    setEnablingPush(true);
    try {
      const fcmToken = await enableFcmAndGetToken();
      await registerFcmTokenWithSessionRetry(fcmToken);
      autoRegisteredTokenRef.current = fcmToken;
      toast.success("Notifications enabled. You will never miss a match.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const lower = message.toLowerCase();

      if (lower.includes("unauthorized")) {
        toast.error("Your session expired. Please sign in again.");
      } else if (lower.includes("denied")) {
        toast.error("Permission denied. Enable notifications from browser settings.");
      } else if (lower.includes("vapid")) {
        toast.error("FCM config issue: invalid VAPID key. Update NEXT_PUBLIC_FIREBASE_VAPID_KEY and restart dev server.");
      } else {
        toast.error(message || "Unable to enable notifications right now.");
      }
    } finally {
      setEnablingPush(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated || !authReady || !token || typeof window === "undefined") return;
    if (Notification.permission !== "granted") return;

    const registerIfGranted = async () => {
      try {
        const fcmToken = await enableFcmAndGetToken();
        if (autoRegisteredTokenRef.current === fcmToken) return;
        await registerFcmTokenWithSessionRetry(fcmToken);
        autoRegisteredTokenRef.current = fcmToken;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("FCM auto-register failed:", message);
      }
    };
    void registerIfGranted();
  }, [authReady, hasHydrated, token]);

  async function findMatch() {
    setLoading(true);
    try {
      const res = await api("/api/match/find", token, { method: "POST" });
      setAttemptsLeft(res.attemptsLeft);
      toast.success("Request sent. Your vibe is now in play.");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.toLowerCase().includes("no users available right now")) {
        toast.info("No users available right now.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onAccept(fromUserId: string) {
    if (!token) return;
    try {
      await api("/api/match/accept", token, { method: "POST", body: JSON.stringify({ fromUserId }) });
      confetti({ particleCount: 130, spread: 90 });
      toast.success("Match success! Reveal unlocked.");
      const me = await api("/api/user/me", token);
      setUser(me.user);
      setAttemptsLeft(Number(me.user.attemptsLeft) || 0);
      setStats(
        me.stats || {
          totalUsers: 0,
          maleCount: 0,
          femaleCount: 0,
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes("no pending request found")) {
        toast.info("This request is no longer pending.");
      } else {
        toast.error(message);
      }
    } finally {
      const latestNotifications = await api("/api/notifications", token).catch(() => null);
      if (latestNotifications) {
        setNotifications(latestNotifications.notifications || []);
        setPendingRequestIds(
          Array.isArray(latestNotifications.pendingRequests)
            ? latestNotifications.pendingRequests.map((id: unknown) => String(id))
            : [],
        );
      }
    }
  }

  async function onReject(fromUserId: string) {
    if (!token) return;
    await api("/api/match/reject", token, { method: "POST", body: JSON.stringify({ fromUserId }) });
    toast.success("Rejected. You will not see this user again.");
    const latestNotifications = await api("/api/notifications", token).catch(() => null);
    if (latestNotifications) {
      setNotifications(latestNotifications.notifications || []);
      setPendingRequestIds(
        Array.isArray(latestNotifications.pendingRequests)
          ? latestNotifications.pendingRequests.map((id: unknown) => String(id))
          : [],
      );
    }
  }

  return (
    <main className="screen-shell gap-4">
      {!hasHydrated || !authReady ? (
        <Card className="flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
          Restoring your session...
        </Card>
      ) : null}

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Home Arena</h1>
          <Sparkles className="h-4 w-4 text-cyan-300" />
        </div>
        <p className="text-xs text-slate-300">Welcome, {currentUser.displayName || currentUser.instagramUsername || "Player"}.</p>
      </Card>

      <Card className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><p className="text-slate-300">Users</p><p className="text-xl font-bold">{stats.totalUsers}</p></div>
        <div><p className="text-slate-300">M/F</p><p className="text-xl font-bold">{ratio}</p></div>
        <div><p className="text-slate-300">Attempts</p><p className="text-xl font-bold">{attemptsLeft}</p></div>
      </Card>

      {canShowPrompt ? (
        <Card className="space-y-2">
          <p className="text-sm text-cyan-100">Enable notifications to never miss a match 🔔</p>
          <Button size="sm" onClick={enableNotifications} disabled={enablingPush}>
            {enablingPush ? "Enabling..." : "Enable Notifications"}
          </Button>
        </Card>
      ) : null}

      <Card className="space-y-3 text-center">
        <IoGameController className="mx-auto h-8 w-8 text-fuchsia-300" />
        <p className="text-sm text-slate-300">Mood check: Ready to meet someone meaningful?</p>
        <Button className="w-full" onClick={findMatch} disabled={loading || attemptsLeft <= 0 || freezeActive}>
          {loading ? <><LoaderCircle className="mr-1 h-4 w-4 animate-spin" />Matching...</> : "Find Match"}
        </Button>
        {attemptsLeft <= 0 ? <p className="text-xs text-rose-300">No attempts left.</p> : null}
        {freezeActive ? (
          <p className="text-xs text-emerald-300">
            Come back after 48 hours. For now, get to know the person you matched with.
          </p>
        ) : null}
        {freezeActive && currentUser.activeMatch ? (
          <Button size="sm" variant="ghost" className="w-full" onClick={() => setMatchRevealDismissed(false)}>
            View Matched Profile Again
          </Button>
        ) : null}
      </Card>

      <Card className="space-y-2">
        <h4 className="font-semibold">Live Requests</h4>
        {!notifications.length ? <p className="text-sm text-slate-400">No notifications yet.</p> : notifications.map((n) => (
          <div key={String(n._id)} className="rounded-xl bg-white/5 p-3 text-sm">
            <p>{n.type === "match_request" ? "Someone requested to match with you." : "Your request got accepted!"}</p>
            {n.type === "match_request" && pendingRequestIds.includes(String(n.fromUserId)) ? (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => onAccept(String(n.fromUserId))}>Accept</Button>
                <Button size="sm" variant="danger" onClick={() => onReject(String(n.fromUserId))}>Reject</Button>
              </div>
            ) : null}
          </div>
        ))}
      </Card>

      {!currentUser.termsAccepted ? (
        <Card className="space-y-2 border border-amber-400/30 bg-amber-500/10">
          <p className="text-xs text-amber-100">Please accept Terms & Conditions from Profile to stay fully compliant.</p>
          <Button size="sm" variant="ghost" onClick={() => router.push("/profile")}>
            Open Profile
          </Button>
        </Card>
      ) : null}

      <Modal open={canShowRevealModal} onClose={() => setMatchRevealDismissed(true)} title="Match Success">
        <div className="space-y-3">
          <p className="text-sm">You both accepted. Instagram reveal is live.</p>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="font-medium">@{currentUser.instagramUsername}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(currentUser.instagramUsername || "")}><Copy className="mr-1 h-4 w-4" />Copy</Button>
              <a className="inline-flex items-center rounded-xl bg-white/10 px-3 text-sm" href={currentUser.instagramUrl} target="_blank"><ExternalLink className="mr-1 h-4 w-4" />Open</a>
            </div>
          </div>
          {currentUser.activeMatch?.instagramUsername ? (
            <div className="rounded-xl bg-white/5 p-3">
              <p className="font-medium">@{currentUser.activeMatch.instagramUsername}</p>
              <a className="mt-2 inline-flex items-center rounded-xl bg-white/10 px-3 py-2 text-sm" href={currentUser.activeMatch.instagramUrl} target="_blank">
                <ExternalLink className="mr-1 h-4 w-4" />Open Match Instagram
              </a>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-emerald-300"><Heart className="h-4 w-4" /> Freeze mode active for 48 hours</div>
        </div>
      </Modal>

      <LegalFooter />
      <BottomNav />
    </main>
  );
}
