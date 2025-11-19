import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/60",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
