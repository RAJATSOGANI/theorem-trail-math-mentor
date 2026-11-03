import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Sparkle, Target, Trophy, ClipboardList } from "lucide-react";
import { attemptsQuery, useCompletedLessons } from "@/lib/progress";
import { topicStats, weakTopics, groupAccuracy, trend, WEAK_THRESHOLD } from "@/lib/analytics";
import { COURSES } from "@/lib/data";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Performance Analytics — MathMentor AI" }, { name: "description", content: "Topic accuracy, weak topics and progress charts." }] }),
  component: ProgressPage,
});

const FILTERS = ["All", "GATE", "IIT JAM", "Practice"] as const;

function barColor(p: number) {
  return p >= 75 ? "bg-success" : p >= WEAK_THRESHOLD ? "bg-accent" : "bg-destructive";
}

function ProgressPage() {
  const { data: all = [], isLoading } = useQuery(attemptsQuery);
  const { done } = useCompletedLessons();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const attempts = filter === "All" ? all : all.filter((a) => (a.mode ?? "Practice") === filter);
  const stats = topicStats(attempts);
  const weak = weakTopics(stats);
  const points = trend(attempts);
  const byDiff = groupAccuracy(attempts, "difficulty");
  const totalQ = attempts.reduce((s, a) => s + a.total, 0);
  const correct = attempts.reduce((s, a) => s + a.score, 0);
  const overall = totalQ ? Math.round((correct / totalQ) * 100) : 0;
  const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Analytics" title="Performance analytics">Accuracy by topic, weak areas to fix, and how you're trending over time.</PageTitle>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-4 py-1.5 text-sm ${filter === f ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-accent"}`}>{f}</button>
        ))}
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Overall accuracy", value: `${overall}%`, icon: Target },
              { label: "Questions answered", value: totalQ, icon: ClipboardList },
              { label: "Quizzes taken", value: attempts.length, icon: Trophy },
              { label: "Weak topics", value: weak.length, icon: AlertTriangle },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
                <s.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {attempts.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-card p-10 text-center shadow-card">
              <p className="font-display text-xl">No results yet{filter !== "All" ? ` for ${filter}` : ""}.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button asChild><Link to="/quiz-generator"><Sparkle /> Generate an AI quiz</Link></Button>
                <Button variant="outline" asChild><Link to="/quizzes">Quiz library</Link></Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
                <h2 className="text-xl font-semibold">Progress over time</h2>
                <TrendChart points={points} />
              </section>

              <section className="rounded-xl border bg-card p-6 shadow-card">
                <h2 className="text-xl font-semibold">Topic-wise accuracy</h2>
                <div className="mt-5 space-y-4">
                  {stats.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-sm"><span>{t.topic}</span><span className="font-mono text-muted-foreground">{t.accuracy}% · {t.correct}/{t.total}</span></div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${barColor(t.accuracy)}`} style={{ width: `${Math.max(2, t.accuracy)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-xl font-semibold"><AlertTriangle className="h-5 w-5 text-destructive" /> Weak topics</h2>
                <p className="mt-1 text-xs text-muted-foreground">Below {WEAK_THRESHOLD}% accuracy with at least 3 questions answered.</p>
                {weak.length === 0 ? (
                  <p className="mt-5 rounded-lg bg-success/10 p-4 text-sm">No weak topics detected — keep it up!</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {weak.map((w) => {
                      const course = COURSES.find((c) => c.title === w.topic);
                      return (
                        <li key={w.topic} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                          <div className="flex justify-between"><span className="font-medium">{w.topic}</span><span className="font-mono text-sm text-destructive">{w.accuracy}%</span></div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {course && <Button size="sm" variant="outline" asChild><Link to="/courses/$courseId" params={{ courseId: course.id }}>Revise lessons</Link></Button>}
                            <Button size="sm" asChild><Link to="/quiz-generator">Practise with AI</Link></Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {byDiff.length > 0 && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">By difficulty (AI quizzes)</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {["Easy", "Medium", "Hard"].map((d) => {
                        const g = byDiff.find((x) => x.label === d);
                        return <div key={d} className="rounded-lg bg-muted p-3 text-center"><p className="font-mono text-lg">{g ? `${g.accuracy}%` : "—"}</p><p className="text-xs text-muted-foreground">{d}</p></div>;
                      })}
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
                <h2 className="text-xl font-semibold">Recent attempts</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground"><tr><th className="py-2">Topic</th><th>Mode</th><th>Difficulty</th><th>Source</th><th className="text-right">Score</th><th className="text-right">Date</th></tr></thead>
                    <tbody className="divide-y">
                      {attempts.slice(0, 10).map((a) => (
                        <tr key={a.id}><td className="py-2.5">{a.topic}</td><td>{a.mode ?? "—"}</td><td>{a.difficulty ?? "—"}</td><td>{a.source === "ai" ? "AI" : "Library"}</td><td className="text-right font-mono">{a.score}/{a.total}</td><td className="text-right text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          <section className="mt-6 rounded-xl border bg-card p-6 shadow-card">
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
        </>
      )}
    </div>
  );
}

function TrendChart({ points }: { points: { date: string; accuracy: number; cumulative: number }[] }) {
  const W = 800, H = 220, P = 30;
  const n = points.length;
  const x = (i: number) => (n === 1 ? W / 2 : P + (i * (W - 2 * P)) / (n - 1));
  const y = (v: number) => H - P - (v / 100) * (H - 2 * P);
  const line = (k: "accuracy" | "cumulative") => points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p[k])}`).join("");
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}><line x1={P} x2={W - P} y1={y(v)} y2={y(v)} className="stroke-border" /><text x={4} y={y(v) + 4} className="fill-muted-foreground font-mono text-[10px]">{v}</text></g>
        ))}
        <line x1={P} x2={W - P} y1={y(WEAK_THRESHOLD)} y2={y(WEAK_THRESHOLD)} className="stroke-destructive" strokeDasharray="4 4" opacity={0.5} />
        <path d={line("accuracy")} fill="none" className="stroke-accent" strokeWidth={2} />
        <path d={line("cumulative")} fill="none" className="stroke-primary" strokeWidth={3} />
        {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.accuracy)} r={4} className="fill-accent"><title>{`${new Date(p.date).toLocaleDateString()}: ${p.accuracy}%`}</title></circle>)}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary" /> Overall accuracy</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" /> Each quiz</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-destructive opacity-50" /> Weak line ({WEAK_THRESHOLD}%)</span>
      </div>
    </div>
  );
}
