import Link from "next/link";
import { BookOpen, Bot, Clock3, LayoutDashboard, MapPinned, Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AuthHeader } from "@/components/auth-header";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/spots", label: "Spots", icon: MapPinned },
  { href: "/focus", label: "Focus", icon: Clock3 },
  { href: "/collection", label: "Collection", icon: Sparkles },
  { href: "/tasks", label: "Tasks", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: Bot }
];

export function AppShell({
  children,
  currentPath
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-moss/10 bg-cream/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-moss text-lg font-bold text-cream shadow-panel">
              SM
            </div>
            <div>
              <p className="eyebrow">UT Austin Focus</p>
              <h1 className="font-serif text-2xl text-ink">StudyMon</h1>
            </div>
          </Link>
          <AuthHeader />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="panel hidden h-fit p-3 lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-moss text-cream"
                      : "text-ink/70 hover:bg-moss/8 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="pb-24 lg:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-moss/10 bg-cream/95 p-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold",
                  active ? "bg-moss text-cream" : "text-ink/65"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
