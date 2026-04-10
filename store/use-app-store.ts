"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  token: string | null;
  user: Record<string, unknown> | null;
  attemptsLeft: number;
  notifications: Array<Record<string, unknown>>;
  stats: {
    totalUsers: number;
    maleCount: number;
    femaleCount: number;
  };
  hasHydrated: boolean;
  authReady: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: Record<string, unknown> | null) => void;
  setAttemptsLeft: (value: number) => void;
  setNotifications: (value: Array<Record<string, unknown>>) => void;
  setStats: (value: { totalUsers: number; maleCount: number; femaleCount: number }) => void;
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
      stats: { totalUsers: 0, maleCount: 0, femaleCount: 0 },
      hasHydrated: false,
      authReady: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setAttemptsLeft: (attemptsLeft) => set({ attemptsLeft }),
      setNotifications: (notifications) => set({ notifications }),
      setStats: (stats) => set({ stats }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setAuthReady: (authReady) => set({ authReady }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          attemptsLeft: 0,
          notifications: [],
          stats: { totalUsers: 0, maleCount: 0, femaleCount: 0 },
          authReady: true,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          attemptsLeft: 0,
          notifications: [],
          stats: { totalUsers: 0, maleCount: 0, femaleCount: 0 },
          authReady: true,
        }),
    }),
    {
      name: "gsb-connect-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
