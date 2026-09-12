import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        brand: "bg-brand-900/50 text-brand-300",
        accent: "bg-accent-500/15 text-accent-400",
        success: "bg-emerald-900/40 text-emerald-300",
        neutral: "bg-surface-muted text-foreground/60",
        outline: "border border-border-strong text-foreground/70",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
