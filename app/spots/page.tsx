import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SpotCard } from "@/components/spot-card";
import { Card } from "@/components/ui/card";
import { studySpots } from "@/lib/mock-data";

export default function StudySpotsPage() {
  return (
    <AppShell currentPath="/spots">
      <Card className="bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Study Spots"
          title="Find the right UT Austin vibe"
          description="Browse quiet libraries, collaborative commons, and hidden-gem corners across campus. Each location has its own featured creature and focus profile."
        />
      </Card>

      <section className="mt-8 grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
        {studySpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </section>
    </AppShell>
  );
}
