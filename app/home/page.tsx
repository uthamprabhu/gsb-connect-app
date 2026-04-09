"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Heart, LoaderCircle, Sparkles, Copy, ExternalLink } from "lucide-react";
import { IoGameController } from "react-icons/io5";
import { toast } from "sonner";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomNav } from "@/components/bottom-nav";

export default function HomePage() {
  const router = useRouter();
  const { token, user, attemptsLeft, notifications, setUser, setAttemptsLeft, setNotifications } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, maleCount: 0, femaleCount: 0 });
  const currentUser = (user || {}) as {
    instagramUsername?: string;
    instagramUrl?: string;
    activeMatch?: { instagramUsername?: string; instagramUrl?: string };
    freezeUntil?: string | null;
  };

  useEffect(() => {
    if (!token) return router.push("/");
    if (!hasCompletedSetup(user)) return router.push("/setup");
    api("/api/user/me", token)
      .then((res) => {
        setUser(res.user);
        setAttemptsLeft(res.user.attemptsLeft || 0);
        setStats(res.stats);
      })
      .catch(() => {});
  }, [router, setAttemptsLeft, setUser, token, user]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await api("/api/notifications", token);
        setNotifications(res.notifications || []);
      } catch {}
    }, 6000);
    return () => clearInterval(id);
  }, [setNotifications, token]);

  const ratio = useMemo(() => (stats.totalUsers ? `${stats.maleCount}/${stats.femaleCount}` : "0/0"), [stats]);

  async function findMatch() {
    setLoading(true);
    try {
      const res = await api("/api/match/find", token, { method: "POST" });
      setAttemptsLeft(res.attemptsLeft);
      toast.success("Request sent. Your vibe is now in play.");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onAccept(fromUserId: string) {
    await api("/api/match/accept", token, { method: "POST", body: JSON.stringify({ fromUserId }) });
    confetti({ particleCount: 130, spread: 90 });
    toast.success("Match success! Reveal unlocked.");
    const me = await api("/api/user/me", token);
    setUser(me.user);
  }

  async function onReject(fromUserId: string) {
    await api("/api/match/reject", token, { method: "POST", body: JSON.stringify({ fromUserId }) });
    toast.success("Rejected. You will not see this user again.");
  }

  return (
    <main className="screen-shell gap-4">
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Home Arena</h1>
          <Sparkles className="h-4 w-4 text-cyan-300" />
        </div>
        <p className="text-xs text-slate-300">Welcome, {currentUser.instagramUsername || "Player"}.</p>
      </Card>

      <Card className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><p className="text-slate-300">Users</p><p className="text-xl font-bold">{stats.totalUsers}</p></div>
        <div><p className="text-slate-300">M/F</p><p className="text-xl font-bold">{ratio}</p></div>
        <div><p className="text-slate-300">Attempts</p><p className="text-xl font-bold">{attemptsLeft}</p></div>
      </Card>

      <Card className="space-y-3 text-center">
        <IoGameController className="mx-auto h-8 w-8 text-fuchsia-300" />
        <p className="text-sm text-slate-300">Mood check: Ready to meet someone meaningful?</p>
        <Button className="w-full" onClick={findMatch} disabled={loading || attemptsLeft <= 0 || !!currentUser.freezeUntil}>
          {loading ? <><LoaderCircle className="mr-1 h-4 w-4 animate-spin" />Matching...</> : "Find Match"}
        </Button>
        {attemptsLeft <= 0 ? <p className="text-xs text-rose-300">No attempts left.</p> : null}
      </Card>

      <Card className="space-y-2">
        <h4 className="font-semibold">Live Requests</h4>
        {!notifications.length ? <p className="text-sm text-slate-400">No notifications yet.</p> : notifications.map((n) => (
          <div key={String(n._id)} className="rounded-xl bg-white/5 p-3 text-sm">
            <p>{n.type === "match_request" ? "Someone requested to match with you." : "Your request got accepted!"}</p>
            {n.type === "match_request" ? (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => onAccept(String(n.fromUserId))}>Accept</Button>
                <Button size="sm" variant="danger" onClick={() => onReject(String(n.fromUserId))}>Reject</Button>
              </div>
            ) : null}
          </div>
        ))}
      </Card>

      <Modal open={!!currentUser.activeMatch} onClose={() => {}} title="Match Success">
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

      <BottomNav />
    </main>
  );
}
