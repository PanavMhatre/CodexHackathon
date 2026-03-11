import { AppShell } from "@/components/app-shell";
import { CollectionGrid } from "@/components/collection-grid";
import { SectionHeader } from "@/components/section-header";
import { dashboardSnapshot } from "@/lib/mock-data";

export default function CollectionPage() {
  return (
    <AppShell currentPath="/collection">
      <section className="panel p-6 sm:p-8">
        <SectionHeader
          eyebrow="Creature Collection"
          title="Your caught campus creatures"
          description="Every study spot has a featured creature. Finish focus sessions, build your streak, and fill out the collection over time."
        />
      </section>

      <section className="mt-6">
        <CollectionGrid entries={dashboardSnapshot.collection} />
      </section>
    </AppShell>
  );
}
