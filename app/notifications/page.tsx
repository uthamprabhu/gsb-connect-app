"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BottomNav } from "@/components/bottom-nav";
import { LegalFooter } from "@/components/legal-footer";

export default function NotificationsPage() {
  const router = useRouter();
  const { token, user, hasHydrated, authReady, notifications, setNotifications, setUser } = useAppStore();
  const [matchRevealDismissed, setMatchRevealDismissed] = useState(false);
  const currentUser = (user || {}) as {
    instagramUsername?: string;
    instagramUrl?: string;
    activeMatch?: { instagramUsername?: string; instagramUrl?: string };
    freezeUntil?: string | null;
    isFreezeActive?: boolean;
    termsAccepted?: boolean;
  };
  const freezeActive = !!currentUser.isFreezeActive;
  const canShowRevealModal = !!currentUser.activeMatch && freezeActive && !matchRevealDismissed;

  useEffect(() => {
    if (!hasHydrated || !authReady) return;
    if (!token) return router.replace("/");
    if (user && !hasCompletedSetup(user)) return router.replace("/setup");

    void Promise.all([api("/api/notifications", token), api("/api/user/me", token)])
      .then(([notificationsRes, meRes]) => {
        setNotifications(notificationsRes.notifications || []);
        setUser(meRes.user);
      })
      .catch(() => {});
  }, [authReady, hasHydrated, router, setNotifications, setUser, token, user]);

  return (
    <main className="screen-shell gap-4">
      <Card>
        <h1 className="text-xl font-bold">Notifications</h1>
        <p className="mt-1 text-xs text-slate-300">Your match activity timeline.</p>
      </Card>

      {freezeActive && currentUser.activeMatch ? (
        <Card className="space-y-3">
          <p className="text-sm text-emerald-200">
            Come back after 48 hours. For now, get to know the person you matched with.
          </p>
          <Button size="sm" variant="ghost" onClick={() => setMatchRevealDismissed(false)}>
            Open Matched Profile
          </Button>
        </Card>
      ) : null}

      {!currentUser.termsAccepted ? (
        <Card className="space-y-2 border border-amber-400/30 bg-amber-500/10">
          <p className="text-sm text-amber-100">Action required: Please accept Terms & Conditions in your Profile page.</p>
          <Button size="sm" variant="ghost" onClick={() => router.push("/profile")}>
            Go to Profile
          </Button>
        </Card>
      ) : null}

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

      <Modal open={canShowRevealModal} onClose={() => setMatchRevealDismissed(true)} title="Match Success">
        <div className="space-y-3">
          <p className="text-sm">You both accepted. Instagram reveal is live.</p>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="font-medium">@{currentUser.instagramUsername}</p>
            <a className="mt-2 inline-flex items-center rounded-xl bg-white/10 px-3 py-2 text-sm" href={currentUser.instagramUrl} target="_blank">
              <ExternalLink className="mr-1 h-4 w-4" />Open
            </a>
          </div>
          {currentUser.activeMatch?.instagramUsername ? (
            <div className="rounded-xl bg-white/5 p-3">
              <p className="font-medium">@{currentUser.activeMatch.instagramUsername}</p>
              <a className="mt-2 inline-flex items-center rounded-xl bg-white/10 px-3 py-2 text-sm" href={currentUser.activeMatch.instagramUrl} target="_blank">
                <ExternalLink className="mr-1 h-4 w-4" />Open Match Instagram
              </a>
            </div>
          ) : null}
        </div>
      </Modal>

      <LegalFooter />
      <BottomNav />
    </main>
  );
}
