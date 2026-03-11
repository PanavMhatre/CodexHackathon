import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { TaskBoard } from "@/components/task-board";
import { Card } from "@/components/ui/card";
import { dashboardSnapshot } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <AppShell currentPath="/tasks">
      <Card className="bg-hero-grid p-6 sm:p-8">
        <SectionHeader
          eyebrow="Tasks"
          title="Break work into winnable pieces"
          description="Create task cards, mark them complete, and use them to frame what each focus session is actually meant to accomplish."
        />
      </Card>

      <section className="mt-8">
        <TaskBoard initialTasks={dashboardSnapshot.tasks} />
      </section>
    </AppShell>
  );
}
