import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { QUIZZES } from "@/lib/data";
import { attemptsQuery } from "@/lib/progress";
import { PageTitle } from "@/components/PageTitle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/quizzes/")({
  head: () => ({ meta: [{ title: "Quizzes & Tests — MathMentor AI" }, { name: "description", content: "Timed practice quizzes and mock tests." }] }),
  component: Quizzes,
});

function Quizzes() {
  const { data: attempts = [] } = useQuery(attemptsQuery);
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Practice" title="Quizzes & tests">Timed quizzes with instant scoring and explanations. Scores are saved to your progress.</PageTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUIZZES.map((q) => {
          const best = attempts.filter((a) => a.quiz_id === q.id).reduce((m, a) => Math.max(m, a.score), -1);
          return (
            <div key={q.id} className="flex flex-col rounded-xl border bg-card p-6 shadow-card">
              <div className="flex gap-1"><Badge variant={q.exam === "Practice" ? "secondary" : "default"}>{q.exam}</Badge><Badge variant="outline">{q.topic}</Badge></div>
              <h3 className="mt-4 flex-1 text-lg font-semibold">{q.title}</h3>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {q.minutes} min · {q.questions.length} questions</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">{best >= 0 ? <>Best: <b className="font-mono">{best}/{q.questions.length}</b></> : <span className="text-muted-foreground">Not attempted</span>}</span>
                <Button size="sm" asChild><Link to="/quizzes/$quizId" params={{ quizId: q.id }}>{best >= 0 ? "Retake" : "Start"}</Link></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
