import { AppShell } from "@/components/app-shell";
import { FilesSection } from "@/components/files-section";
import { SectionHeader } from "@/components/section-header";
import { Card } from "@/components/ui/card";

export default function FilesPage() {
  return (
    <AppShell currentPath="/files">
      <Card className="bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Study Files"
          title="Your notes & assignments"
          description="Upload, organize, and share your study files with classmates. Keep all your course materials in one place."
        />
      </Card>

      <section className="mt-8">
        <FilesSection />
      </section>
    </AppShell>
  );
}
