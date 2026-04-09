"use client";

import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";
import { firebaseApp } from "@/lib/firebase-client";

export async function enableFcmAndGetToken() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser");
  }

  const supported = await isSupported();
  if (!supported) {
    throw new Error("Firebase messaging is not supported in this browser");
  }

  const permission =
    Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  console.info("[FCM] Notification permission:", permission);

  if (permission === "denied") {
    throw new Error("Notification permission denied");
  }
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing");
  }
  if (vapidKey.length < 60) {
    throw new Error("VAPID key looks invalid or truncated");
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) throw new Error("Unable to get FCM token");
    console.info("[FCM] Token generated:", `${token.slice(0, 12)}...`);
    return token;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`FCM token setup failed: ${msg}`);
  }
}

export async function listenForegroundMessages(onReceive: (payload: MessagePayload) => void) {
  if (typeof window === "undefined") return () => {};
  const supported = await isSupported();
  if (!supported) return () => {};
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, onReceive);
}
