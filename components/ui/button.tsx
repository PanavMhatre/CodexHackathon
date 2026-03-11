import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "soft";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-moss text-cream shadow-sm hover:bg-ink disabled:bg-moss/40 disabled:text-cream/80",
  secondary:
    "border border-moss/15 bg-white/80 text-ink hover:border-moss/30 hover:bg-white",
  ghost: "text-ink/80 hover:bg-moss/8 hover:text-ink",
  soft: "bg-moss/8 text-moss hover:bg-moss/12"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 rounded-2xl px-4 text-sm",
  md: "h-11 rounded-2xl px-5 text-sm",
  lg: "h-12 rounded-2xl px-6 text-sm",
  icon: "h-11 w-11 rounded-2xl"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
});
