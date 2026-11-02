import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { QUIZZES } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { MathMarkdown } from "@/components/MathMarkdown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/quizzes/$quizId")({
  loader: ({ params }) => {
    const quiz = QUIZZES.find((q) => q.id === params.quizId);
    if (!quiz) throw notFound();
    return { quiz };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.quiz.title ?? "Quiz"} — MathMentor AI` }] }),
  component: QuizPage,
});

function QuizPage() {
  const { quiz } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [left, setLeft] = useState(quiz.minutes * 60);

  useEffect(() => {
    if (submitted) return;
    if (left <= 0) { void submit(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  });

  const score = answers.filter((a, i) => a === quiz.questions[i].answer).length;

  async function submit() {
    if (submitted) return;
    setSubmitted(true);
    const s = answers.filter((a, i) => a === quiz.questions[i].answer).length;
    const { error } = await supabase.from("quiz_attempts").insert({ user_id: user.id, quiz_id: quiz.id, topic: quiz.topic, score: s, total: quiz.questions.length });
    if (error) toast.error("Couldn't save your score: " + error.message);
    else { toast.success("Score saved to your progress"); qc.invalidateQueries({ queryKey: ["attempts"] }); }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="chalkboard rounded-2xl p-8 text-center shadow-card">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Result</p>
          <p className="mt-2 font-display text-6xl font-semibold">{score}/{quiz.questions.length}</p>
          <p className="mt-2 opacity-80">{quiz.title}</p>
        </div>
        <div className="mt-6 space-y-4">
          {quiz.questions.map((q, i) => {
            const ok = answers[i] === q.answer;
            return (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex gap-2">{ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}<MathMarkdown>{q.q}</MathMarkdown></div>
                <div className="mt-2 pl-7 text-sm">
                  <MathMarkdown>{`**Correct:** ${q.options[q.answer]}${answers[i] !== null && !ok ? ` · **Yours:** ${q.options[answers[i]!]}` : ""}`}</MathMarkdown>
                  <div className="text-muted-foreground"><MathMarkdown>{q.explain}</MathMarkdown></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => { setAnswers(quiz.questions.map(() => null)); setIdx(0); setLeft(quiz.minutes * 60); setSubmitted(false); }}>Retake</Button>
          <Button variant="outline" asChild><Link to="/quizzes">All quizzes</Link></Button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[idx];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{quiz.title}</h1>
        <span className={`flex items-center gap-1 rounded-full border bg-card px-3 py-1 font-mono text-sm ${left < 60 ? "text-destructive" : ""}`}>
          <Clock className="h-4 w-4" /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
      </div>
      <Progress value={((idx + 1) / quiz.questions.length) * 100} className="mt-4 h-1.5" />
      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-card">
        <p className="font-mono text-xs text-muted-foreground">Question {idx + 1} of {quiz.questions.length}</p>
        <div className="mt-2 text-lg"><MathMarkdown>{q.q}</MathMarkdown></div>
        <div className="mt-5 grid gap-2">
          {q.options.map((o, oi) => (
            <button
              key={oi}
              onClick={() => setAnswers((a) => a.map((v, i) => (i === idx ? oi : v)))}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left ${answers[idx] === oi ? "border-primary bg-primary/10" : "hover:border-accent"}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full border font-mono text-xs">{String.fromCharCode(65 + oi)}</span>
              <MathMarkdown>{o}</MathMarkdown>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</Button>
        {idx < quiz.questions.length - 1 ? (
          <Button onClick={() => setIdx(idx + 1)}>Next</Button>
        ) : (
          <Button onClick={submit}>Submit test</Button>
        )}
      </div>
    </div>
  );
}
