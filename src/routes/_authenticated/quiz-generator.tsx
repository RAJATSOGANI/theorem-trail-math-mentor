import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkle, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { generateQuiz, type GenQuestion, type GenInput } from "@/lib/quizgen.functions";
import { quizMinutes } from "@/lib/analytics";
import { COURSES } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { MathMarkdown } from "@/components/MathMarkdown";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/quiz-generator")({
  head: () => ({ meta: [{ title: "AI Quiz Generator — MathMentor AI" }, { name: "description", content: "Generate timed maths quizzes on any topic." }] }),
  component: QuizGenerator,
});

const TOPICS = [...COURSES.map((c) => c.title), "Complex Analysis", "Numerical Methods", "Vector Calculus"];
const DIFFS: GenInput["difficulty"][] = ["Easy", "Medium", "Hard"];
const MODES: GenInput["mode"][] = ["GATE", "IIT JAM", "Practice"];

type Phase = "setup" | "taking" | "result";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-4 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-accent"}`}>{children}</button>
  );
}

function QuizGenerator() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const gen = useServerFn(generateQuiz);
  const [cfg, setCfg] = useState<GenInput>({ topic: "Linear Algebra", difficulty: "Medium", mode: "GATE", count: 5 });
  const [custom, setCustom] = useState("");
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const savedRef = useRef(false);

  const topic = custom.trim() || cfg.topic;

  async function start() {
    setLoading(true);
    try {
      const r = await gen({ data: { ...cfg, topic } });
      if (r.error) { toast.error(r.error); return; }
      setQuestions(r.questions);
      setAnswers(r.questions.map(() => null));
      setIdx(0);
      const secs = quizMinutes(r.questions.length, cfg.difficulty) * 60;
      setLeft(secs); setElapsed(0);
      savedRef.current = false;
      setPhase("taking");
    } catch { toast.error("Couldn't generate the quiz. Please try again."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (phase !== "taking") return;
    if (left <= 0) { toast.info("Time's up — quiz submitted."); void submit(); return; }
    const t = setTimeout(() => { setLeft((s) => s - 1); setElapsed((s) => s + 1); }, 1000);
    return () => clearTimeout(t);
  });

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  async function submit() {
    if (savedRef.current) return;
    savedRef.current = true;
    setPhase("result");
    const s = answers.filter((a, i) => a === questions[i]?.answer).length;
    const { error } = await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: `ai:${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      topic,
      score: s,
      total: questions.length,
      difficulty: cfg.difficulty,
      mode: cfg.mode,
      source: "ai",
      duration_seconds: elapsed,
      details: { questions, answers },
    });
    if (error) toast.error("Couldn't save your result: " + error.message);
    else { toast.success("Result saved to your analytics"); qc.invalidateQueries({ queryKey: ["attempts"] }); }
  }

  if (phase === "setup") {
    const mins = quizMinutes(cfg.count, cfg.difficulty);
    return (
      <div className="mx-auto max-w-4xl">
        <PageTitle eyebrow="AI Practice" title="AI Quiz Generator">Fresh questions on any topic, tuned to your exam and level. Every answer comes with an explanation.</PageTitle>
        <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-card">
          <div>
            <Label>Topic</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => <Chip key={t} active={!custom.trim() && cfg.topic === t} onClick={() => { setCustom(""); setCfg({ ...cfg, topic: t }); }}>{t}</Chip>)}
            </div>
            <Input className="mt-3" placeholder="…or type your own, e.g. Cauchy–Riemann equations" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div><Label>Difficulty</Label><div className="mt-2 flex flex-wrap gap-2">{DIFFS.map((d) => <Chip key={d} active={cfg.difficulty === d} onClick={() => setCfg({ ...cfg, difficulty: d })}>{d}</Chip>)}</div></div>
            <div><Label>Exam mode</Label><div className="mt-2 flex flex-wrap gap-2">{MODES.map((m) => <Chip key={m} active={cfg.mode === m} onClick={() => setCfg({ ...cfg, mode: m })}>{m}</Chip>)}</div></div>
            <div><Label>Questions: {cfg.count}</Label><input type="range" min={3} max={15} value={cfg.count} onChange={(e) => setCfg({ ...cfg, count: Number(e.target.value) })} className="mt-4 w-full accent-primary" /></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Time limit: {mins} min · {topic}</p>
            <Button size="lg" onClick={start} disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Generating…</> : <><Sparkle /> Generate quiz</>}</Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-3xl">
        <div className="chalkboard rounded-2xl p-8 text-center shadow-card">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{cfg.mode} · {cfg.difficulty} · {topic}</p>
          <p className="mt-2 font-display text-6xl font-semibold">{score}/{questions.length}</p>
          <p className="mt-2 opacity-80">{pct}% accuracy · {Math.floor(elapsed / 60)}m {elapsed % 60}s</p>
        </div>
        <div className="mt-6 space-y-4">
          {questions.map((q, i) => {
            const ok = answers[i] === q.answer;
            const mine = answers[i];
            return (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex gap-2">{ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}<MathMarkdown>{q.q}</MathMarkdown></div>
                <div className="mt-2 space-y-1 pl-7 text-sm">
                  <MathMarkdown>{`**Correct:** ${q.options[q.answer]}${mine == null ? " · *Not answered*" : !ok ? ` · **Yours:** ${q.options[mine]}` : ""}`}</MathMarkdown>
                  <div className="rounded-lg bg-muted p-3 text-muted-foreground"><MathMarkdown>{q.explain}</MathMarkdown></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => setPhase("setup")}>New quiz</Button>
          <Button variant="outline" onClick={start} disabled={loading}>{loading ? "Generating…" : "Same settings, new questions"}</Button>
          <Button variant="ghost" asChild><Link to="/progress">View analytics</Link></Button>
        </div>
      </div>
    );
  }

  const q = questions[idx]!;
  const answered = answers.filter((a) => a !== null).length;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">{topic}</h1><p className="text-sm text-muted-foreground">{cfg.mode} · {cfg.difficulty}</p></div>
        <span className={`flex items-center gap-1 rounded-full border bg-card px-3 py-1 font-mono text-sm ${left < 60 ? "text-destructive" : ""}`}><Clock className="h-4 w-4" /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
      </div>
      <Progress value={(answered / questions.length) * 100} className="mt-4 h-1.5" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-8 w-8 rounded-md border font-mono text-xs ${i === idx ? "border-primary bg-primary text-primary-foreground" : answers[i] !== null ? "bg-accent/30" : "bg-card"}`}>{i + 1}</button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border bg-card p-6 shadow-card">
        <p className="font-mono text-xs text-muted-foreground">Question {idx + 1} of {questions.length}</p>
        <div className="mt-2 text-lg"><MathMarkdown>{q.q}</MathMarkdown></div>
        <div className="mt-5 grid gap-2">
          {q.options.map((o, oi) => (
            <button key={oi} onClick={() => setAnswers((a) => a.map((v, i) => (i === idx ? oi : v)))} className={`flex items-center gap-3 rounded-lg border p-3 text-left ${answers[idx] === oi ? "border-primary bg-primary/10" : "hover:border-accent"}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-xs">{String.fromCharCode(65 + oi)}</span>
              <MathMarkdown>{o}</MathMarkdown>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</Button>
        {idx < questions.length - 1 ? <Button onClick={() => setIdx(idx + 1)}>Next</Button> : <Button onClick={submit}>Submit quiz</Button>}
      </div>
    </div>
  );
}
