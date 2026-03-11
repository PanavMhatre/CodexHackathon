import { AppShell } from "@/components/app-shell";
import { FocusTimer } from "@/components/focus-timer";

export default function FocusPage({
  searchParams
}: {
  searchParams?: { spot?: string };
}) {
  return (
    <AppShell currentPath="/focus">
      <FocusTimer initialSpotSlug={searchParams?.spot} />
    </AppShell>
  );
}
