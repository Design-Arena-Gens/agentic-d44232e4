import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "glow";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
        variant === "default" &&
          "border-transparent bg-accent/20 text-accent hover:bg-accent/30",
        variant === "outline" &&
          "border-slate-700/70 bg-transparent text-slate-300",
        variant === "glow" &&
          "border-transparent bg-gradient-to-r from-accent via-sky-500 to-cyan-400 text-slate-900 shadow-lg shadow-sky-500/40",
        className
      )}
      {...props}
    />
  );
}
