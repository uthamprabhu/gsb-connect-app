"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setUser, setAttemptsLeft, logout } = useAppStore();
  const currentUser = (user || {}) as {
    instagramUsername?: string;
    phone?: string;
    gender?: string;
    preference?: string;
    age?: number;
    tags?: string[];
  };

  useEffect(() => {
    if (!token) return router.push("/");
    if (!hasCompletedSetup(user)) return router.push("/setup");
    api("/api/user/me", token)
      .then((res) => {
        setUser(res.user);
        setAttemptsLeft(res.user.attemptsLeft || 0);
      })
      .catch(() => {});
  }, [router, setAttemptsLeft, setUser, token, user]);

  return (
    <main className="screen-shell gap-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-xs text-slate-300">Your current matchmaking identity.</p>
      </Card>
      <Card className="space-y-2 text-sm">
        <p><span className="text-slate-400">Instagram:</span> @{currentUser.instagramUsername || "-"}</p>
        <p><span className="text-slate-400">Phone:</span> {currentUser.phone || "-"}</p>
        <p><span className="text-slate-400">Gender:</span> {currentUser.gender || "-"}</p>
        <p><span className="text-slate-400">Preference:</span> {currentUser.preference || "-"}</p>
        <p><span className="text-slate-400">Age:</span> {currentUser.age || "-"}</p>
        <p><span className="text-slate-400">Vibes:</span> {(currentUser.tags || []).join(", ") || "-"}</p>
      </Card>
      <Button
        variant="danger"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Logout
      </Button>
      <BottomNav />
    </main>
  );
}
