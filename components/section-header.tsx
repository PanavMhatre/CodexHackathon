import { Reveal } from "@/components/ui/reveal";

export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Reveal className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/80 sm:text-base">{description}</p>
    </Reveal>
  );
}
