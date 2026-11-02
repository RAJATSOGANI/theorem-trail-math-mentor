import type { ReactNode } from "react";

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>}
    </div>
  );
}
