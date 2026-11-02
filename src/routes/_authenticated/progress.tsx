import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { attemptsQuery, useCompletedLessons } from "@/lib/progress";
import { COURSES, QUIZZES } from "@/lib/data";
import { PageTitle } from "@/components/PageTitle";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — MathMentor AI" }, { name: "description", content: "Track your scores and topic mastery." }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { data: attempts = [], isLoading } = useQuery(attemptsQuery);
  const { done } = useCompletedLessons();

  const topics = Array.from(new Set(QUIZZES.map((q) => q.topic))).map((t) => {
    const a = attempts.filter((x) => x.topic === t);
    const pct = a.length ? Math.round((a.reduce((s, x) => s + x.score / x.total, 0) / a.length) * 100) : null;
    return { topic: t, pct, count: a.length };
  });
  const recent = [...attempts].reverse().slice(-12);
  const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const attempted = topics.filter((t) => t.pct !== null);
  const weakest = [...attempted].sort((a, b) => a.pct! - b.pct!)[0];

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Analytics" title="Your progress">Scores by topic, recent trend and course completion.</PageTitle>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold">Topic mastery</h2>
            <div className="mt-5 space-y-4">
              {topics.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between text-sm"><span>{t.topic}</span><span className="font-mono text-muted-foreground">{t.pct === null ? "—" : `${t.pct}%`}</span></div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${t.pct === null ? "" : t.pct >= 75 ? "bg-success" : t.pct >= 50 ? "bg-accent" : "bg-destructive"}`} style={{ width: `${t.pct ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold">Recent scores</h2>
            {recent.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No attempts yet. <Link to="/quizzes" className="text-primary">Take a quiz →</Link></p>
            ) : (
              <div className="mt-5 flex h-48 items-end gap-2 border-b border-l px-2">
                {recent.map((a) => (
                  <div key={a.id} className="group relative flex-1">
                    <div className="rounded-t bg-primary transition-colors group-hover:bg-accent" style={{ height: `${Math.max(4, (a.score / a.total) * 180)}px` }} />
                    <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 font-mono text-xs text-ink-foreground group-hover:block">{a.score}/{a.total}</span>
                  </div>
                ))}
              </div>
            )}
            {weakest && <p className="mt-5 rounded-lg bg-accent/15 p-3 text-sm">Focus area: <b>{weakest.topic}</b> ({weakest.pct}%). Revise it in Courses, then retake the quiz.</p>}
          </section>
          <section className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
            <h2 className="text-xl font-semibold">Course completion · {done.length}/{totalLessons} lessons</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((c) => {
                const d = c.lessons.filter((l) => done.includes(`${c.id}/${l.id}`)).length;
                const pct = Math.round((d / c.lessons.length) * 100);
                return (
                  <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="flex items-center gap-4 rounded-lg border p-4 hover:border-accent">
                    <div className="grid h-14 w-14 place-items-center rounded-full font-mono text-sm" style={{ background: `conic-gradient(var(--primary) ${pct * 3.6}deg, var(--muted) 0)` }}>
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-card">{pct}%</span>
                    </div>
                    <div><p className="font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{d}/{c.lessons.length} lessons</p></div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
