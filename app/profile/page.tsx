"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "@mui/material/Slider";
import { toast } from "sonner";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { TAG_OPTIONS, GENDER_OPTIONS, PREFERENCE_OPTIONS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setUser, setAttemptsLeft, logout } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    instagramInput: "",
    magicKey: "",
    gender: "male",
    preference: "female",
    age: 24,
    ageRange: [20, 30] as number[],
    tags: [] as string[],
  });

  const currentUser = (user || {}) as {
    instagramUsername?: string;
    instagramUrl?: string;
    magicKey?: string;
    phone?: string;
    gender?: string;
    preference?: string;
    age?: number;
    ageRange?: { min?: number; max?: number };
    tags?: string[];
  };

  useEffect(() => {
    if (!token) return router.push("/");
    if (!hasCompletedSetup(user)) return router.push("/setup");
    api("/api/user/me", token)
      .then((res) => {
        setUser(res.user);
        setAttemptsLeft(res.user.attemptsLeft || 0);
        setForm({
          instagramInput: res.user.instagramUrl || res.user.instagramUsername || "",
          magicKey: res.user.magicKey || "",
          gender: res.user.gender || "male",
          preference: res.user.preference || "female",
          age: res.user.age || 24,
          ageRange: [res.user.ageRange?.min || 20, res.user.ageRange?.max || 30],
          tags: Array.isArray(res.user.tags) ? res.user.tags : [],
        });
      })
      .catch(() => {});
  }, [router, setAttemptsLeft, setUser, token, user]);

  async function updateProfile() {
    if (!form.instagramInput.trim()) return toast.error("Instagram is required");
    if (!form.magicKey.trim()) return toast.error("Magic key is required");
    if (form.tags.length < 3 || form.tags.length > 5) return toast.error("Select 3 to 5 tags");
    setLoading(true);
    try {
      const res = await api("/api/user/setup", token, {
        method: "PUT",
        body: JSON.stringify({
          instagramInput: form.instagramInput,
          magicKey: form.magicKey,
          gender: form.gender,
          preference: form.preference,
          age: form.age,
          ageRange: { min: form.ageRange[0], max: form.ageRange[1] },
          tags: form.tags,
        }),
      });
      setUser(res.user);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-shell gap-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-xs text-slate-300">Edit your profile anytime. Changes apply immediately.</p>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Phone (read-only)</label>
        <Input value={currentUser.phone || ""} disabled />
        <label className="text-xs text-slate-300">Instagram Username or URL (required)</label>
        <Input value={form.instagramInput} onChange={(e) => setForm({ ...form, instagramInput: e.target.value })} />
        <label className="text-xs text-slate-300">Magic Key (required, unique)</label>
        <Input value={form.magicKey} onChange={(e) => setForm({ ...form, magicKey: e.target.value })} />
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Your Gender</label>
        <select className="rounded-xl bg-slate-900/70 p-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          {GENDER_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <label className="text-xs text-slate-300">Match Preference</label>
        <select className="rounded-xl bg-slate-900/70 p-2" value={form.preference} onChange={(e) => setForm({ ...form, preference: e.target.value })}>
          {PREFERENCE_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Card>

      <Card className="space-y-4">
        <label className="text-xs text-slate-300">Age: {form.age}</label>
        <Slider min={18} max={60} value={form.age} onChange={(_, value) => setForm({ ...form, age: Number(value) })} sx={{ color: "#22d3ee" }} />
        <label className="text-xs text-slate-300">Preferred age range: {form.ageRange[0]} - {form.ageRange[1]}</label>
        <Slider
          min={18}
          max={60}
          value={form.ageRange}
          onChange={(_, value) => setForm({ ...form, ageRange: value as number[] })}
          valueLabelDisplay="auto"
          sx={{ color: "#a855f7" }}
        />
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Pick 3 to 5 vibes</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const selected = form.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    tags: selected ? prev.tags.filter((t) => t !== tag) : prev.tags.length >= 5 ? prev.tags : [...prev.tags, tag],
                  }))
                }
                className={`rounded-full px-3 py-1 text-xs ${selected ? "bg-cyan-500/40" : "bg-white/10"}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </Card>

      <Button onClick={updateProfile} disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
      <Button
        variant="danger"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        Logout
      </Button>
      <BottomNav />
    </main>
  );
}
