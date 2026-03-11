import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-moss/12 bg-white/80 px-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/40 focus-visible:border-moss/30 focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          className
        )}
        {...props}
      />
    );
  }
);
