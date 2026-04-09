import { getMessaging } from "firebase-admin/messaging";
import { adminAuth } from "@/lib/firebase-admin";

export async function sendPushNotification(token: string | null | undefined, title: string, body: string) {
  if (!token) return;
  try {
    // Ensures Firebase Admin app is initialized before messaging usage.
    void adminAuth;
    await getMessaging().send({
      token,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: "/icon.png",
        },
      },
    });
    console.info("[FCM] Push send success:", { title, tokenPreview: `${token.slice(0, 12)}...` });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[FCM] Push send failed:", { title, message });
    // Keep notification failures non-blocking for core app flows.
  }
}
