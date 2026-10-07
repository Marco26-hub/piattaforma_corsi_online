import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-sans font-bold", className)}>
      <span className="inline-flex h-10 w-20 shrink-0 items-center justify-center rounded bg-[#0f6b4f]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/academy/brand/swa-logo.png" alt="SWA" className="h-6 w-auto" />
      </span>
      SWA Academy
    </span>
  );
}
