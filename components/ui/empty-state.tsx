import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex min-h-[240px] flex-col items-center justify-center gap-4 bg-hero-grid px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-moss/10 text-moss shadow-sm">
        {icon}
      </div>
      <div className="max-w-md">
        <h3 className="font-serif text-3xl text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/80">{description}</p>
      </div>
      {action}
    </Card>
  );
}
