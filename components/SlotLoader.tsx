"use client";

import { motion } from "framer-motion";

const items = ["💙", "🔥", "✨", "🎯", "💫"];

export default function SlotLoader() {
  return (
    <div className="flex justify-center gap-3 mt-4">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl shadow-lg"
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}