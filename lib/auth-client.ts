"use client";

import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { api } from "@/lib/client-api";
import { firebaseAuth } from "@/lib/firebase-client";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let persistencePromise: Promise<void> | null = null;
let activeExchange: Promise<AuthResponse> | null = null;
let activeExchangeUid: string | null = null;

type AuthResponse = {
  token: string;
  user: Record<string, unknown>;
};

export function ensureFirebasePersistence() {
  if (!persistencePromise) {
    persistencePromise = setPersistence(firebaseAuth, browserLocalPersistence);
  }
  return persistencePromise;
}

export async function exchangeFirebaseUser(user: User): Promise<AuthResponse> {
  if (activeExchange && activeExchangeUid === user.uid) {
    return activeExchange;
  }

  activeExchangeUid = user.uid;
  activeExchange = (async () => {
    const idToken = await user.getIdToken();
    return api("/api/auth/verify", null, {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  })();

  try {
    return await activeExchange;
  } finally {
    if (activeExchangeUid === user.uid) {
      activeExchange = null;
      activeExchangeUid = null;
    }
  }
}

export async function signInWithGoogle() {
  await ensureFirebasePersistence();
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return exchangeFirebaseUser(credential.user);
}

export async function signOutFirebaseAuth() {
  await signOut(firebaseAuth);
}
