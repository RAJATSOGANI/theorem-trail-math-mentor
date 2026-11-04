import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { compile } from "mathjs";
import { Plus, X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/graph-plotter")({
  head: () => ({ meta: [{ title: "Graph Plotter — MathMentor AI" }, { name: "description", content: "Plot and compare mathematical functions interactively." }] }),
  component: Plotter,
});

const COLORS = ["var(--primary)", "var(--accent)", "var(--destructive)", "var(--chart-4, var(--foreground))"];

function Plotter() {
  const [fns, setFns] = useState(["sin(x)", "x^2/4 - 1"]);
  const [xmin, setXmin] = useState(-6);
  const [xmax, setXmax] = useState(6);

  const { data, errors } = useMemo(() => {
    const errors: string[] = [];
    const compiled = fns.map((f, i) => { try { return compile(f.replace(/ln\(/g, "log(")); } catch { errors[i] = "Invalid expression"; return null; } });
    const lo = Math.min(xmin, xmax - 0.1), hi = Math.max(xmax, lo + 0.1);
    const data = Array.from({ length: 301 }, (_, k) => {
      const x = lo + ((hi - lo) * k) / 300;
      const row: Record<string, number | null> = { x: +x.toFixed(4) };
      compiled.forEach((c, i) => {
        let y: number | null = null;
        try { const v = c?.evaluate({ x }); if (typeof v === "number" && isFinite(v) && Math.abs(v) < 1e6) y = +v.toFixed(5); } catch { errors[i] ||= "Couldn't evaluate"; }
        row[`f${i}`] = y;
      });
      return row;
    });
    return { data, errors };
  }, [fns, xmin, xmax]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Tools" title="Graph plotter">Plot up to four functions of x. Supports sin, cos, exp, log, sqrt, abs, ^ and more.</PageTitle>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
          {fns.map((f, i) => (
            <div key={i}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[i] }} />
                <span className="font-mono text-sm">f{i + 1}(x)=</span>
                <Input value={f} onChange={(e) => setFns(fns.map((v, j) => (j === i ? e.target.value : v)))} className="font-mono" />
                {fns.length > 1 && <button aria-label="Remove function" onClick={() => setFns(fns.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>}
              </div>
              {errors[i] && <p className="mt-1 text-xs text-destructive">{errors[i]}</p>}
            </div>
          ))}
          {fns.length < 4 && <Button variant="outline" size="sm" onClick={() => setFns([...fns, "cos(x)"])}><Plus /> Add function</Button>}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <label className="text-sm">x min<Input type="number" value={xmin} onChange={(e) => setXmin(+e.target.value)} /></label>
            <label className="text-sm">x max<Input type="number" value={xmax} onChange={(e) => setXmax(+e.target.value)} /></label>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setXmin(xmin / 2); setXmax(xmax / 2); }}>Zoom in</Button>
            <Button variant="ghost" size="sm" onClick={() => { setXmin(xmin * 2); setXmax(xmax * 2); }}>Zoom out</Button>
          </div>
        </div>
        <div className="h-[420px] rounded-xl border bg-card p-4 shadow-card md:h-[520px]">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} tickCount={9} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <ReferenceLine x={0} stroke="var(--foreground)" strokeOpacity={0.4} />
              <ReferenceLine y={0} stroke="var(--foreground)" strokeOpacity={0.4} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Legend />
              {fns.map((f, i) => <Line key={i} dataKey={`f${i}`} name={f} stroke={COLORS[i]} dot={false} strokeWidth={2} connectNulls={false} isAnimationActive={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
