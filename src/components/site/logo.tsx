import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-serif font-medium", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/swa-logo.png" alt="SWA" className="h-6 w-auto" />
      <span className="h-4 w-px bg-border-strong" />
      Formia
    </span>
  );
}
