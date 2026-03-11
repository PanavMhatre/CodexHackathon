import { AuthCard } from "@/components/auth-card";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[32px] bg-moss p-8 text-cream shadow-panel lg:block">
          <p className="eyebrow !text-cream/70">Study Better at UT</p>
          <h1 className="mt-2 font-serif text-5xl">Turn study sessions into momentum.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-cream/80">
            StudyMon combines focus timers, campus study spots, XP rewards, and collectible creatures into a lightweight student accountability loop.
          </p>
        </section>

        <AuthCard />
      </div>
    </main>
  );
}
