import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SpotCard } from "@/components/spot-card";
import { studySpots } from "@/lib/mock-data";

export default function StudySpotsPage() {
  return (
    <AppShell currentPath="/spots">
      <section className="panel p-6 sm:p-8">
        <SectionHeader
          eyebrow="Study Spots"
          title="Find the right UT Austin vibe"
          description="Browse quiet libraries, collaborative commons, and hidden-gem corners across campus. Each location has its own featured creature and focus profile."
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studySpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </section>
    </AppShell>
  );
}
