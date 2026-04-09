import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-100 outline-none ring-fuchsia-500 placeholder:text-slate-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
