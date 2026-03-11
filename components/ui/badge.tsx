import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "moss" | "amber" | "lake" | "cream" | "coral" | "fern";

const variantClasses: Record<BadgeVariant, string> = {
  moss: "bg-moss/8 text-moss",
  amber: "bg-amber/15 text-amber-800",
  lake: "bg-lake/12 text-lake",
  cream: "border border-moss/15 bg-white/80 text-ink/80",
  coral: "bg-coral/10 text-coral",
  fern: "bg-fern/15 text-moss"
};

export function Badge({
  className,
  variant = "moss",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
