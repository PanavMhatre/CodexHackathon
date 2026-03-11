import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { SpotCard } from "@/components/spot-card";
import { Card } from "@/components/ui/card";
import { studySpots } from "@/lib/mock-data";

export default function StudySpotsPage() {
  const quietCount = studySpots.filter((s) => s.noiseLevel === "Quiet").length;
  const moderateCount = studySpots.filter((s) => s.noiseLevel === "Moderate").length;
  const buzzingCount = studySpots.filter((s) => s.noiseLevel === "Buzzing").length;

  return (
    <AppShell currentPath="/spots">
      <Card className="bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Study Spots"
          title="Find the right UT Austin vibe"
          description="Browse quiet libraries, collaborative commons, and hidden-gem corners across campus. Each location has its own featured creature and focus profile."
        />
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-moss/8 px-3 py-1 font-semibold text-moss">
            {studySpots.length} spots total
          </span>
          <span className="rounded-full bg-moss/8 px-3 py-1 text-moss/80">
            {quietCount} quiet
          </span>
          <span className="rounded-full bg-amber/15 px-3 py-1 text-amber-800">
            {moderateCount} moderate
          </span>
          <span className="rounded-full bg-coral/10 px-3 py-1 text-coral">
            {buzzingCount} buzzing
          </span>
        </div>
      </Card>

      <section className="mt-8 grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
        {studySpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </section>
    </AppShell>
  );
}
