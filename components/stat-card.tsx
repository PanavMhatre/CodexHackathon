import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <div className="rounded-2xl bg-moss/8 p-3 text-moss">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold text-ink">{value}</p>
        <p className="mt-2 text-sm text-ink/65">{detail}</p>
      </div>
    </div>
  );
}
