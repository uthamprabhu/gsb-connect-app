"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "@mui/material/Slider";
import { toast } from "sonner";
import { TAG_OPTIONS, GENDER_OPTIONS, PREFERENCE_OPTIONS } from "@/lib/constants";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  const router = useRouter();
  const { token, user, setUser } = useAppStore();
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

  useEffect(() => {
    if (!token) return router.push("/");
    if (hasCompletedSetup(user)) router.push("/home");
  }, [router, token, user]);

  async function save() {
    if (!form.instagramInput.trim()) return toast.error("Instagram is required");
    if (!form.magicKey.trim()) return toast.error("Magic key is required");
    if (form.tags.length < 3 || form.tags.length > 5) return toast.error("Select 3 to 5 tags");
    setLoading(true);
    try {
      const res = await api("/api/user/setup", token, {
        method: "POST",
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
      toast.success("Setup complete! You unlocked matching mode.");
      router.push("/home");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-shell gap-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-bold">Profile Setup</h1>
        <p className="text-xs text-slate-300">Complete all required fields to unlock matchmaking.</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="primary-gradient h-full w-2/3" />
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Instagram Username or URL (required)</label>
        <Input placeholder="@username or https://instagram.com/username" value={form.instagramInput} onChange={(e) => setForm({ ...form, instagramInput: e.target.value })} />
        <label className="text-xs text-slate-300">Magic Key (required, unique)</label>
        <Input placeholder="Example: moonTiger27" value={form.magicKey} onChange={(e) => setForm({ ...form, magicKey: e.target.value })} />
        <p className="text-xs text-slate-400">Hint: this is your quick login key. Keep it memorable.</p>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Your Gender (required)</label>
        <select className="rounded-xl bg-slate-900/70 p-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          {GENDER_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <label className="text-xs text-slate-300">Match Preference (required)</label>
        <select className="rounded-xl bg-slate-900/70 p-2" value={form.preference} onChange={(e) => setForm({ ...form, preference: e.target.value })}>
          {PREFERENCE_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Card>

      <Card className="space-y-4">
        <label className="text-xs text-slate-300">Age (required): {form.age}</label>
        <Slider min={18} max={60} value={form.age} onChange={(_, value) => setForm({ ...form, age: Number(value) })} sx={{ color: "#22d3ee" }} />
        <label className="text-xs text-slate-300">Preferred age range (required): {form.ageRange[0]} - {form.ageRange[1]}</label>
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
        <label className="text-xs text-slate-300">Pick 3 to 5 vibes (required)</label>
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

      <Button className="w-full" onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Complete Setup"}
      </Button>
    </main>
  );
}
