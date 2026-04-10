"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  token: string | null;
  user: Record<string, unknown> | null;
  attemptsLeft: number;
  notifications: Array<Record<string, unknown>>;
  hasHydrated: boolean;
  authReady: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: Record<string, unknown> | null) => void;
  setAttemptsLeft: (value: number) => void;
  setNotifications: (value: Array<Record<string, unknown>>) => void;
  setHasHydrated: (value: boolean) => void;
  setAuthReady: (value: boolean) => void;
  clearSession: () => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      attemptsLeft: 0,
      notifications: [],
      hasHydrated: false,
      authReady: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setAttemptsLeft: (attemptsLeft) => set({ attemptsLeft }),
      setNotifications: (notifications) => set({ notifications }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setAuthReady: (authReady) => set({ authReady }),
      clearSession: () => set({ token: null, user: null, attemptsLeft: 0, notifications: [], authReady: true }),
      logout: () => set({ token: null, user: null, attemptsLeft: 0, notifications: [], authReady: true }),
    }),
    {
      name: "gsb-connect-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
