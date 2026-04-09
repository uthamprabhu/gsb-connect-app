"use client";

import { Home, Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: UserCircle, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/85 p-2 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center rounded-xl py-2 text-xs",
                pathname === item.href ? "bg-white/10 text-cyan-300" : "text-slate-300",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
