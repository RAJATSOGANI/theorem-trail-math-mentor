import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { makeStudyPlan } from "@/lib/ai.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/study-planner")({
  head: () => ({ meta: [{ title: "AI Study Planner — MathMentor AI" }, { name: "description", content: "Personalised GATE and IIT JAM study plans." }] }),
  component: Planner,
});

const KEY = "mm-study-plan";

function Planner() {
  const [exam, setExam] = useState("GATE Mathematics");
  const [weeks, setWeeks] = useState(12);
  const [hours, setHours] = useState(3);
  const [weak, setWeak] = useState("");
  const [strong, setStrong] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPlan(localStorage.getItem(KEY) || ""); }, []);

  async function go() {
    setLoading(true); setError("");
    try {
      const r = await makeStudyPlan({ data: { exam, weeks, hours, weak, strong } });
      if (r.error) setError(r.error); else { setPlan(r.text); localStorage.setItem(KEY, r.text); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Planner" title="AI study planner">Tell us your exam, time and weak spots — get a week-by-week plan.</PageTitle>
      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-2">
        <label className="text-sm">Exam
          <select value={exam} onChange={(e) => setExam(e.target.value)} className="mt-1 h-9 w-full rounded-md border bg-background px-3">
            <option>GATE Mathematics</option><option>GATE Engineering Mathematics</option><option>IIT JAM Mathematics</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Weeks<Input type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(+e.target.value)} className="mt-1" /></label>
          <label className="text-sm">Hours / day<Input type="number" min={1} max={14} value={hours} onChange={(e) => setHours(+e.target.value)} className="mt-1" /></label>
        </div>
        <label className="text-sm">Weak topics<Input value={weak} onChange={(e) => setWeak(e.target.value)} placeholder="e.g. Real analysis, ODEs" className="mt-1" /></label>
        <label className="text-sm">Strong topics<Input value={strong} onChange={(e) => setStrong(e.target.value)} placeholder="e.g. Linear algebra" className="mt-1" /></label>
        <Button onClick={go} disabled={loading} className="sm:col-span-2"><CalendarDays /> {loading ? "Building your plan…" : plan ? "Regenerate plan" : "Create my plan"}</Button>
      </div>
      {error && <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</div>}
      {plan && <div className="mt-6 overflow-x-auto rounded-xl border bg-card p-6 shadow-card"><MathMarkdown>{plan}</MathMarkdown></div>}
    </div>
  );
}
