"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  className,
  delay = 0,
  animateOnMount = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { delay?: number; animateOnMount?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animateOnMount) {
      const timer = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(timer);
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animateOnMount]);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    />
  );
}
