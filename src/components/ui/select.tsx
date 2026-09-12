import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-lg border border-border-subtle bg-surface px-4 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
