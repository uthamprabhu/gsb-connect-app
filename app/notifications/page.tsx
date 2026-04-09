"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";

export default function NotificationsPage() {
  const router = useRouter();
  const { token, user, notifications, setNotifications } = useAppStore();

  useEffect(() => {
    if (!token) return router.push("/");
    if (user && !hasCompletedSetup(user)) return router.push("/setup");
    api("/api/notifications", token)
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => {});
  }, [router, setNotifications, token]);

  return (
    <main className="screen-shell gap-4">
      <Card>
        <h1 className="text-xl font-bold">Notifications</h1>
        <p className="mt-1 text-xs text-slate-300">Your match activity timeline.</p>
      </Card>
      <Card className="space-y-2">
        {!notifications.length ? (
          <p className="text-sm text-slate-400">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={String(n._id)} className="rounded-xl bg-white/5 p-3 text-sm">
              <p>{n.type === "match_request" ? "New match request" : "Your match was accepted"}</p>
            </div>
          ))
        )}
      </Card>
      <BottomNav />
    </main>
  );
}
