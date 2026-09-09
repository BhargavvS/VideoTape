import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function Avatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className={cn("inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-xs font-medium", className)}>
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : <span aria-hidden>{initials || "U"}</span>}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} {...props} />;
}

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn("h-px w-full bg-white/[0.08]", className)} />;
}

export function FormError({ message, onDismiss }: { message?: string | null; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2.5"
    >
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-red-400">Request failed</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-red-200">{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 rounded px-1 font-mono text-xs text-red-400/70 transition-colors hover:text-red-200"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/10 bg-card px-6 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Empty state</p>
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
