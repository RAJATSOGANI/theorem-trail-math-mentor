export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`grid h-9 w-9 place-items-center rounded-lg font-display text-xl font-bold ${inverted ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>∑</span>
      <span className="font-display text-lg font-semibold tracking-tight">
        MathMentor <span className="text-accent">AI</span>
      </span>
    </span>
  );
}
