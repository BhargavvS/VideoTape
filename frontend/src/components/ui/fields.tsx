import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-white/[0.04] px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-[#737373] hover:border-white/20 focus:border-white/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-white/[0.04] px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-[#737373] focus:border-white/30 focus:ring-2 focus:ring-white/10",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="font-medium tracking-tight text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-400">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
