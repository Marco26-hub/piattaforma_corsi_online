import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30",
        className
      )}
      {...props}
    />
  );
}
