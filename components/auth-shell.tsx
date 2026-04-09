"use client";

import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import SlotLoader from "@/components/SlotLoader";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="screen-shell gap-4">
      <Card className="mt-8 space-y-3 text-center">
        <motion.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-3xl font-black tracking-tight">
          GSB Connect
        </motion.h1>
        <p className="text-sm text-slate-300">Play to connect, reveal only on mutual vibe.</p>
        <div className="flex items-center justify-center gap-2 text-xs text-cyan-200">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-1">
            <Sparkles className="h-3.5 w-3.5" /> Gamified
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure OTP
          </span>
        </div>

        <SlotLoader />
      </Card>
      {children}
    </main>
  );
}
