import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-border-subtle bg-surface px-4 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30",
        className
      )}
      {...props}
    />
  );
}
