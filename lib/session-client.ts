"use client";

import { signOutFirebaseAuth } from "@/lib/auth-client";
import { useAppStore } from "@/store/use-app-store";

export async function logoutClientSession() {
  useAppStore.getState().logout();
  await signOutFirebaseAuth().catch(() => {});
}
