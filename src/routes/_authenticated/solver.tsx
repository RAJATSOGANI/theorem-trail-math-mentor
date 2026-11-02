import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { solveProblem } from "@/lib/ai.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/solver")({
  head: () => ({ meta: [{ title: "Step-by-step Solver — MathMentor AI" }, { name: "description", content: "Solve maths problems step by step." }] }),
  component: Solver,
});

const examples = ["Solve y'' - 3y' + 2y = e^{3x}", "Find the eigenvalues of [[4,1],[2,3]]", "Evaluate ∫ x² sin x dx", "Does Σ n/(n²+1) converge?"];

function Solver() {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function solve(p = problem) {
    if (!p.trim()) return;
    setProblem(p);
    setLoading(true); setError(""); setSolution("");
    try {
      const r = await solveProblem({ data: { problem: p } });
      if (r.error) setError(r.error); else setSolution(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Solver" title="Step-by-step solver">Type any problem — calculus, algebra, ODEs, series — and get a full worked solution.</PageTitle>
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={4} placeholder="e.g. Find the maximum of f(x,y) = xy subject to x + y = 10" className="font-mono" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {examples.map((e) => <button key={e} onClick={() => solve(e)} className="rounded-full border px-3 py-1 font-mono text-xs hover:border-accent">{e}</button>)}
          </div>
          <Button onClick={() => solve()} disabled={loading || !problem.trim()}><Wand2 /> {loading ? "Solving…" : "Solve"}</Button>
        </div>
      </div>
      {loading && <div className="mt-6 animate-pulse rounded-xl border bg-card p-6 text-muted-foreground">Working through the steps…</div>}
      {error && <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</div>}
      {solution && <div className="mt-6 rounded-xl border bg-card p-6 shadow-card"><MathMarkdown>{solution}</MathMarkdown></div>}
    </div>
  );
}
