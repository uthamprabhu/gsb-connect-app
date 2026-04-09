"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  token: string | null;
  user: Record<string, unknown> | null;
  attemptsLeft: number;
  notifications: Array<Record<string, unknown>>;
  setToken: (token: string | null) => void;
  setUser: (user: Record<string, unknown> | null) => void;
  setAttemptsLeft: (value: number) => void;
  setNotifications: (value: Array<Record<string, unknown>>) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      attemptsLeft: 0,
      notifications: [],
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setAttemptsLeft: (attemptsLeft) => set({ attemptsLeft }),
      setNotifications: (notifications) => set({ notifications }),
      logout: () => set({ token: null, user: null, attemptsLeft: 0, notifications: [] }),
    }),
    { name: "gsb-connect-store" },
  ),
);
