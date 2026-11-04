import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileQuestion } from "lucide-react";
import { generateQuiz, type GenQuestion } from "@/lib/quizgen.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/exam-questions")({
  head: () => ({ meta: [{ title: "GATE & JAM Question Generator — MathMentor AI" }, { name: "description", content: "Generate GATE and IIT JAM style maths questions with answers and explanations." }] }),
  component: ExamQuestions,
});

function ExamQuestions() {
  const [mode, setMode] = useState<"GATE" | "IIT JAM">("GATE");
  const [topic, setTopic] = useState("Linear Algebra");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [qs, setQs] = useState<GenQuestion[]>([]);
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true); setError(""); setQs([]); setShown({});
    try {
      const r = await generateQuiz({ data: { topic, difficulty, mode, count: 5 } });
      if (r.error) setError(r.error); else setQs(r.questions);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="GATE & JAM" title="Exam question generator">Fresh exam-style questions with answers and explanations — reveal each when ready.</PageTitle>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 shadow-card">
        <div className="flex rounded-md border p-0.5">
          {(["GATE", "IIT JAM"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1.5 text-sm ${mode === m ? "bg-primary text-primary-foreground" : ""}`}>{m}</button>)}
        </div>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="w-full sm:w-56" />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <Button onClick={go} disabled={loading || !topic.trim()}><FileQuestion /> {loading ? "Generating…" : "Generate 5 questions"}</Button>
      </div>
      {error && <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</div>}
      <div className="mt-6 space-y-4">
        {qs.map((q, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
            <p className="font-mono text-xs text-muted-foreground">Q{i + 1} · {mode} · {difficulty}</p>
            <MathMarkdown>{q.q}</MathMarkdown>
            <ol className="mt-2 space-y-1">
              {q.options.map((o, j) => (
                <li key={j} className={`rounded-md border px-3 py-1.5 text-sm ${shown[i] && j === q.answer ? "border-primary bg-primary/10" : ""}`}>
                  <span className="mr-2 font-mono">{"ABCD"[j]}.</span><MathMarkdown>{o}</MathMarkdown>
                </li>
              ))}
            </ol>
            {shown[i]
              ? <div className="mt-3 rounded-md bg-muted p-3 text-sm"><b>Answer: {"ABCD"[q.answer]}</b><MathMarkdown>{q.explain}</MathMarkdown></div>
              : <Button variant="outline" size="sm" className="mt-3" onClick={() => setShown({ ...shown, [i]: true })}>Show answer & explanation</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
