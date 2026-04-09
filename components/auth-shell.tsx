"use client";

import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const slotAnimation = { v: "5.7.4", fr: 30, ip: 0, op: 30, w: 200, h: 200, nm: "pulse", ddd: 0, assets: [], layers: [] };

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="screen-shell gap-4">
      <Card className="mt-8 space-y-3 text-center">
        <motion.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-3xl font-black tracking-tight">
          GSB Connect
        </motion.h1>
        <p className="text-sm text-slate-300">Play to connect, reveal only on mutual vibe.</p>
        <div className="mx-auto w-24 text-cyan-300">
          <Lottie animationData={slotAnimation} loop />
        </div>
      </Card>
      {children}
    </main>
  );
}
