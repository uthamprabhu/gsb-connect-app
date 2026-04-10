"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { api } from "@/lib/client-api";
import { ensureFirebasePersistence, exchangeFirebaseUser } from "@/lib/auth-client";
import { firebaseAuth } from "@/lib/firebase-client";
import { useAppStore } from "@/store/use-app-store";

async function restoreBackendSession(token: string) {
  const res = await api("/api/user/me", token);
  return {
    token,
    user: res.user,
    attemptsLeft: res.user.attemptsLeft || 0,
  };
}

export function AuthSessionBootstrap() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  const setAttemptsLeft = useAppStore((state) => state.setAttemptsLeft);
  const setAuthReady = useAppStore((state) => state.setAuthReady);
  const clearSession = useAppStore((state) => state.clearSession);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    const syncAuthState = async () => {
      await ensureFirebasePersistence();

      const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
        try {
          const state = useAppStore.getState();

          if (firebaseUser) {
            const matchesStoredUser =
              state.token &&
              state.user &&
              typeof state.user.firebaseUid === "string" &&
              state.user.firebaseUid === firebaseUser.uid;

            if (matchesStoredUser) {
              if (!cancelled) setAuthReady(true);
              return;
            }

            const res = await exchangeFirebaseUser(firebaseUser);
            if (cancelled) return;
            setToken(res.token);
            setUser(res.user);
            setAttemptsLeft(res.user.attemptsLeft || 0);
            setAuthReady(true);
            return;
          }

          if (state.token) {
            if (state.user) {
              if (!cancelled) {
                setAttemptsLeft(Number(state.user.attemptsLeft) || 0);
                setAuthReady(true);
              }
              return;
            }

            const restored = await restoreBackendSession(state.token);
            if (cancelled) return;
            setToken(restored.token);
            setUser(restored.user);
            setAttemptsLeft(restored.attemptsLeft);
            setAuthReady(true);
            return;
          }

          if (!cancelled) {
            clearSession();
          }
        } catch {
          const currentState = useAppStore.getState();
          if (!cancelled && !currentState.token) {
            clearSession();
          } else if (!cancelled) {
            setAuthReady(true);
          }
        }
      });

      return unsubscribe;
    };

    let cleanup: (() => void) | undefined;

    void syncAuthState().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [clearSession, hasHydrated, setAttemptsLeft, setAuthReady, setToken, setUser]);

  return null;
}
