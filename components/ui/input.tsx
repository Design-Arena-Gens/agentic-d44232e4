import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/60",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
