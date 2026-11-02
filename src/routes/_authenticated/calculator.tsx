import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { evaluate, compile } from "mathjs";
import { PageTitle } from "@/components/PageTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({ meta: [{ title: "Calculator — MathMentor AI" }, { name: "description", content: "Scientific calculator and function plotter." }] }),
  component: CalculatorPage,
});

const keys = [
  ["sin(", "cos(", "tan(", "log(", "ln("],
  ["sqrt(", "^", "(", ")", "pi"],
  ["7", "8", "9", "/", "e"],
  ["4", "5", "6", "*", "!"],
  ["1", "2", "3", "-", "abs("],
  ["0", ".", "%", "+", "="],
];

function CalculatorPage() {
  const [expr, setExpr] = useState("");
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [fx, setFx] = useState("sin(x) * x / 2");

  const preview = useMemo(() => {
    if (!expr) return "";
    try { const r = evaluate(expr.replace(/ln\(/g, "log(")); return typeof r === "number" || typeof r === "object" ? String(r) : ""; } catch { return ""; }
  }, [expr]);

  function press(k: string) {
    if (k === "=") {
      try {
        const r = String(evaluate(expr.replace(/ln\(/g, "log(")));
        setHistory((h) => [{ expr, result: r }, ...h].slice(0, 12));
        setExpr(r);
      } catch { setExpr("Error"); }
    } else setExpr((e) => (e === "Error" ? "" : e) + k);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Tools" title="Interactive calculator">Scientific evaluation with live preview, plus a function plotter.</PageTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="chalkboard rounded-2xl p-5 shadow-card">
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && press("=")}
            className="w-full bg-transparent text-right font-mono text-3xl outline-none"
            placeholder="0"
            aria-label="Expression"
          />
          <p className="h-6 text-right font-mono text-sm text-accent">{preview && preview !== expr ? `= ${preview}` : ""}</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {keys.flat().map((k) => (
              <button key={k} onClick={() => press(k)} className={`rounded-lg py-3 font-mono text-sm transition-colors ${k === "=" ? "bg-accent text-accent-foreground hover:opacity-90" : /\d|\./.test(k) ? "bg-sidebar-accent hover:bg-sidebar-border" : "bg-ink/40 hover:bg-sidebar-accent"}`}>
                {k.replace("(", "")}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => setExpr((e) => e.slice(0, -1))} className="rounded-lg bg-ink/40 py-2 text-sm hover:bg-sidebar-accent">⌫ Delete</button>
            <button onClick={() => setExpr("")} className="rounded-lg bg-destructive/80 py-2 text-sm hover:bg-destructive">Clear</button>
          </div>
          {history.length > 0 && (
            <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto border-t border-sidebar-border pt-3 font-mono text-xs opacity-80">
              {history.map((h, i) => <li key={i} className="flex cursor-pointer justify-between" onClick={() => setExpr(h.expr)}><span>{h.expr}</span><span>= {h.result}</span></li>)}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="text-xl font-semibold">Function plotter</h2>
          <div className="mt-3 flex gap-2">
            <span className="self-center font-mono text-sm">f(x) =</span>
            <Input value={fx} onChange={(e) => setFx(e.target.value)} className="font-mono" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {["x^2 - 4", "sin(x)", "exp(-x^2)", "1/x", "x^3 - 3x"].map((f) => <Button key={f} size="sm" variant="outline" className="font-mono text-xs" onClick={() => setFx(f)}>{f}</Button>)}
          </div>
          <Plot fx={fx} />
        </div>
      </div>
    </div>
  );
}

function Plot({ fx }: { fx: string }) {
  const W = 500, H = 340, R = 10;
  const { path, err } = useMemo(() => {
    try {
      const f = compile(fx.replace(/(\d)x/g, "$1*x"));
      let d = ""; let pen = false;
      for (let i = 0; i <= 400; i++) {
        const x = -R + (2 * R * i) / 400;
        const y = Number(f.evaluate({ x }));
        if (!Number.isFinite(y) || Math.abs(y) > R * 3) { pen = false; continue; }
        const px = ((x + R) / (2 * R)) * W, py = H / 2 - (y / R) * (H / 2) * (W / H) * (H / W);
        d += `${pen ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`; pen = true;
      }
      return { path: d, err: "" };
    } catch { return { path: "", err: "Invalid function" }; }
  }, [fx]);
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border bg-background">
        {ticks.map((t) => <line key={"v" + t} x1={((t + R) / (2 * R)) * W} x2={((t + R) / (2 * R)) * W} y1={0} y2={H} className="stroke-border" strokeWidth={0.5} />)}
        {ticks.map((t) => <line key={"h" + t} y1={H / 2 - (t / R) * (H / 2)} y2={H / 2 - (t / R) * (H / 2)} x1={0} x2={W} className="stroke-border" strokeWidth={0.5} />)}
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} className="stroke-muted-foreground" />
        <line y1={0} y2={H} x1={W / 2} x2={W / 2} className="stroke-muted-foreground" />
        <path d={path} fill="none" className="stroke-primary" strokeWidth={2.5} />
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">{err || "x ∈ [−10, 10], y ∈ [−10, 10]"}</p>
    </div>
  );
}
