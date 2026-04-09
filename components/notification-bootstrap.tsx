"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import { listenForegroundMessages } from "@/lib/fcm-client";

export function NotificationBootstrap() {
  const { token } = useAppStore();

  useEffect(() => {
    if (!token) return;
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      unsubscribe = await listenForegroundMessages((payload) => {
        const title = payload.notification?.title || "New update";
        const body = payload.notification?.body || "You have a new notification.";
        toast.info(`${title} - ${body}`);
      });
    };

    void setup();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [token]);

  return null;
}
