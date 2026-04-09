"use client";

export async function api(path: string, token: string | null, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export function hasCompletedSetup(user: Record<string, unknown> | null) {
  if (!user) return false;
  const u = user as {
    magicKey?: string;
    instagramUsername?: string;
    age?: number;
    preference?: string;
    gender?: string;
    tags?: string[];
  };
  return !!(
    u.magicKey &&
    u.instagramUsername &&
    u.age &&
    u.preference &&
    u.gender &&
    Array.isArray(u.tags) &&
    u.tags.length >= 3
  );
}
