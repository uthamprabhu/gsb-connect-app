"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "@mui/material/Slider";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { TAG_OPTIONS, GENDER_OPTIONS, PREFERENCE_OPTIONS } from "@/lib/constants";
import { api, hasCompletedSetup } from "@/lib/client-api";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  const router = useRouter();
  const { token, user, hasHydrated, authReady, setUser } = useAppStore();
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
  const selectClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/80 p-3 text-sm text-slate-100 outline-none ring-fuchsia-500 focus:ring-2";

  useEffect(() => {
    if (!hasHydrated || !authReady) return;
    if (!token) return router.replace("/");
    if (hasCompletedSetup(user)) router.replace("/home");
  }, [authReady, hasHydrated, router, token, user]);

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
      {!hasHydrated || !authReady ? (
        <Card className="flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
          Restoring your session...
        </Card>
      ) : null}

      <Card className="space-y-2">
        <h1 className="text-xl font-bold">Profile Setup</h1>
        <p className="text-xs text-slate-300">Complete all required fields to unlock matchmaking.</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="primary-gradient h-full w-2/3" />
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Instagram Username or URL (required)</label>
        <Input placeholder="@username or https://instagram.com/username" value={form.instagramInput} onChange={(e) => setForm((prev) => ({ ...prev, instagramInput: e.target.value }))} />
        <label className="text-xs text-slate-300">Magic Key (required, unique)</label>
        <Input placeholder="Example: moonTiger27" value={form.magicKey} onChange={(e) => setForm((prev) => ({ ...prev, magicKey: e.target.value }))} />
        <p className="text-xs text-slate-400">Hint: this is your quick login key. Keep it memorable.</p>
      </Card>

      <Card className="space-y-3">
        <label className="text-xs text-slate-300">Your Gender (required)</label>
        <select className={selectClass} value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
          {GENDER_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <label className="text-xs text-slate-300">Match Preference (required)</label>
        <select className={selectClass} value={form.preference} onChange={(e) => setForm((prev) => ({ ...prev, preference: e.target.value }))}>
          {PREFERENCE_OPTIONS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Card>

      <Card className="space-y-4 border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-600/10 to-cyan-500/10">
        <label className="text-xs font-semibold tracking-wide text-cyan-200">Age (required): {form.age}</label>
        <Slider
          min={18}
          max={60}
          value={form.age}
          onChange={(_, value) => setForm((prev) => ({ ...prev, age: Number(value) }))}
          valueLabelDisplay="auto"
          sx={{ color: "#22d3ee", "& .MuiSlider-thumb": { boxShadow: "0 0 0 8px rgba(34,211,238,0.15)" } }}
        />
        <label className="text-xs text-slate-300">Preferred age range (required): {form.ageRange[0]} - {form.ageRange[1]}</label>
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
        <label className="text-xs text-slate-300">Pick 3 to 5 vibes (required)</label>
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

      <Button className="w-full" onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Complete Setup"}
      </Button>
    </main>
  );
}
