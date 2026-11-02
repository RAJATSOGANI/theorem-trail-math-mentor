import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, ClipboardList, Lightbulb } from "lucide-react";
import { EXAMS, QUIZZES, COURSES } from "@/lib/data";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/exam-prep")({
  head: () => ({ meta: [{ title: "GATE & IIT JAM Prep — MathMentor AI" }, { name: "description", content: "Exam patterns, syllabus and mock tests." }] }),
  component: ExamPrep,
});

function ExamPrep() {
  const [id, setId] = useState<(typeof EXAMS)[number]["id"]>("GATE");
  const exam = EXAMS.find((e) => e.id === id)!;
  const tests = QUIZZES.filter((q) => q.exam === id);
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Exam preparation" title="GATE & IIT JAM">Know the pattern, cover the syllabus, then test yourself under time pressure.</PageTitle>
      <div className="mb-6 inline-flex rounded-lg border bg-card p-1">
        {EXAMS.map((e) => (
          <button key={e.id} onClick={() => setId(e.id)} className={`rounded-md px-5 py-2 text-sm font-medium ${id === e.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{e.id}</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="chalkboard rounded-2xl p-6 shadow-card lg:col-span-2">
          <h2 className="text-2xl font-semibold">{exam.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm opacity-80"><CalendarDays className="h-4 w-4" /> Expected: {exam.date}</p>
          <p className="mt-1 font-mono text-sm text-accent">{exam.pattern}</p>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider opacity-70">Syllabus</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {exam.syllabus.map((s) => {
              const c = COURSES.find((c) => c.title.includes(s) || s.includes(c.title));
              return c ? (
                <Link key={s} to="/courses/$courseId" params={{ courseId: c.id }} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{s}</Link>
              ) : (
                <span key={s} className="rounded-full bg-sidebar-accent px-3 py-1 text-sm">{s}</span>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-accent" /> Strategy tips</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">{exam.tips.map((t) => <li key={t}>• {t}</li>)}</ul>
        </div>
      </div>
      <h2 className="mt-10 text-2xl font-semibold">{id} mock tests</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {tests.map((q) => (
          <div key={q.id} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card">
            <div>
              <p className="font-semibold">{q.title}</p>
              <p className="text-sm text-muted-foreground">{q.questions.length} questions · {q.minutes} min</p>
            </div>
            <Button asChild><Link to="/quizzes/$quizId" params={{ quizId: q.id }}><ClipboardList /> Start</Link></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
