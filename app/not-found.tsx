import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-5xl text-ink">That study spot wandered off.</h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-ink/70">
        The page you requested does not exist in this MVP. Head back to the dashboard or browse campus study spots.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-cream"
      >
        Return home
      </Link>
    </main>
  );
}
