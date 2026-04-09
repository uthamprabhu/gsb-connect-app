"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "@mui/material/Slider";
import { Eye, EyeOff } from "lucide-react";
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
  const hydratedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showMagicKey, setShowMagicKey] = useState(false);
  const [form, setForm] = useState({
    instagramInput: "",
    magicKey: "",
    gender: "male",
    preference: "female",
    age: 24,
    ageRange: [20, 30] as number[],
    tags: [] as string[],
  });
  const selectClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-sm text-slate-100 outline-none ring-fuchsia-500 focus:ring-2";
  const initialFormRef = useRef<{
    instagramInput: string;
    magicKey: string;
    gender: string;
    preference: string;
    age: number;
    ageRange: number[];
    tags: string[];
  } | null>(null);

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
    if (user && !hasCompletedSetup(user)) return router.push("/setup");
    if (hydratedRef.current) return;
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
        initialFormRef.current = {
          instagramInput: res.user.instagramUrl || res.user.instagramUsername || "",
          magicKey: res.user.magicKey || "",
          gender: res.user.gender || "male",
          preference: res.user.preference || "female",
          age: res.user.age || 24,
          ageRange: [res.user.ageRange?.min || 20, res.user.ageRange?.max || 30],
          tags: Array.isArray(res.user.tags) ? res.user.tags : [],
        };
        hydratedRef.current = true;
      })
      .catch(() => {});
  }, [router, setAttemptsLeft, setUser, token]);

  const isDirty =
    !!initialFormRef.current &&
    JSON.stringify({
      ...form,
      tags: [...form.tags].sort(),
    }) !==
      JSON.stringify({
        ...initialFormRef.current,
        tags: [...initialFormRef.current.tags].sort(),
      });

  async function updateProfile() {
    if (!isDirty) {
      toast.info("No changes detected. Update skipped.");
      return;
    }
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
      initialFormRef.current = {
        instagramInput: form.instagramInput,
        magicKey: form.magicKey,
        gender: form.gender,
        preference: form.preference,
        age: form.age,
        ageRange: [...form.ageRange],
        tags: [...form.tags],
      };
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
        <Input value={form.instagramInput} onChange={(e) => setForm((prev) => ({ ...prev, instagramInput: e.target.value }))} />
        <label className="text-xs text-slate-300">Magic Key (required, unique)</label>
        <div className="relative">
          <Input
            type={showMagicKey ? "text" : "password"}
            value={form.magicKey}
            onChange={(e) => setForm((prev) => ({ ...prev, magicKey: e.target.value }))}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowMagicKey((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
          >
            {showMagicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Your Gender</label>
        <select className={selectClass} value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
          {GENDER_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <label className="text-xs text-slate-300">Match Preference</label>
        <select className={selectClass} value={form.preference} onChange={(e) => setForm((prev) => ({ ...prev, preference: e.target.value }))}>
          {PREFERENCE_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Card>

      <Card className="space-y-4 border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-600/10 to-cyan-500/10">
        <label className="text-xs font-semibold tracking-wide text-cyan-200">Age: {form.age}</label>
        <Slider
          min={18}
          max={60}
          value={form.age}
          onChange={(_, value) => setForm((prev) => ({ ...prev, age: Number(value) }))}
          valueLabelDisplay="auto"
          sx={{ color: "#22d3ee", "& .MuiSlider-thumb": { boxShadow: "0 0 0 8px rgba(34,211,238,0.15)" } }}
        />
        <label className="text-xs text-slate-300">Preferred age range: {form.ageRange[0]} - {form.ageRange[1]}</label>
        <Slider
          min={18}
          max={60}
          value={form.ageRange}
          onChange={(_, value) => setForm((prev) => ({ ...prev, ageRange: value as number[] }))}
          valueLabelDisplay="auto"
          sx={{ color: "#a855f7", "& .MuiSlider-thumb": { boxShadow: "0 0 0 8px rgba(168,85,247,0.15)" } }}
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
                type="button"
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
        {loading ? "Updating..." : isDirty ? "Update Profile" : "No Changes Yet"}
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
