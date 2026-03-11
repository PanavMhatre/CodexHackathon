"use client";

import Link from "next/link";
import {
  BookOpen,
  Bot,
  Clock3,
  LayoutDashboard,
  MapPinned,
  Menu,
  Sparkles,
  X
} from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="border-b border-moss/10 bg-cream/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-moss text-lg font-bold text-cream shadow-panel">
                SM
              </div>
              <div>
                <p className="eyebrow">UT Austin Focus</p>
                <h1 className="font-serif text-2xl text-ink">StudyMon</h1>
              </div>
            </Link>
          </div>
          <AuthHeader />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <Card className="hidden h-fit p-3 lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                    active
                      ? "bg-moss text-cream"
                      : "text-ink/80 hover:bg-moss/8 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Card>

        <main className="pb-24 lg:pb-0">{children}</main>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/25 backdrop-blur-sm transition lg:hidden",
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[290px] max-w-[84vw] border-r border-white/60 bg-cream/95 p-4 shadow-panel backdrop-blur transition-transform duration-300 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Navigate</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">StudyMon</h2>
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex min-h-[52px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active ? "bg-moss text-cream" : "text-ink/80 hover:bg-moss/8"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-moss/10 bg-cream/95 p-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active ? "bg-moss text-cream" : "text-ink/80 hover:bg-moss/8"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
