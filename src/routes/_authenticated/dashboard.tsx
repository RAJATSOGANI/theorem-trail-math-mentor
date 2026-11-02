import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bot, ListChecks, Calculator, ClipboardList, ArrowRight, Trophy, Target, BookOpen } from "lucide-react";
import { attemptsQuery, useCompletedLessons } from "@/lib/progress";
import { COURSES, QUIZZES } from "@/lib/data";
import { PageTitle } from "@/components/PageTitle";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MathMentor AI" }, { name: "description", content: "Your maths learning dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { data: attempts = [] } = useQuery(attemptsQuery);
  const { done } = useCompletedLessons();
  const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const avg = attempts.length ? Math.round((attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100) : 0;
  const name = (user.user_metadata?.full_name as string)?.split(" ")[0] || "there";

  const stats = [
    { label: "Quizzes taken", value: attempts.length, icon: ClipboardList },
    { label: "Average score", value: `${avg}%`, icon: Trophy },
    { label: "Lessons done", value: `${done.length}/${totalLessons}`, icon: BookOpen },
    { label: "Quizzes available", value: QUIZZES.length, icon: Target },
  ];
  const tools = [
    { to: "/tutor", title: "Ask the AI Tutor", text: "Explain any concept", icon: Bot },
    { to: "/solver", title: "Solve step-by-step", text: "Paste a problem", icon: ListChecks },
    { to: "/calculator", title: "Calculator & plotter", text: "Evaluate and graph", icon: Calculator },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Dashboard" title={`Hello, ${name}`}>Here's where your preparation stands today.</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <s.icon className="h-5 w-5 text-accent" />
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="chalkboard group rounded-xl p-6 shadow-card">
            <t.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
            <p className="text-sm opacity-70">{t.text}</p>
            <ArrowRight className="mt-4 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Course progress</h2><Link to="/courses" className="text-sm text-primary">All courses</Link></div>
          <div className="mt-4 space-y-4">
            {COURSES.slice(0, 4).map((c) => {
              const d = c.lessons.filter((l) => done.includes(`${c.id}/${l.id}`)).length;
              return (
                <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="block">
                  <div className="flex justify-between text-sm"><span className="font-medium">{c.title}</span><span className="text-muted-foreground">{d}/{c.lessons.length}</span></div>
                  <Progress value={(d / c.lessons.length) * 100} className="mt-1.5 h-2" />
                </Link>
              );
            })}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Recent attempts</h2><Link to="/progress" className="text-sm text-primary">View progress</Link></div>
          {attempts.length === 0 ? (
            <div className="mt-6 text-sm text-muted-foreground">No quizzes yet. <Link to="/quizzes" className="text-primary">Take your first quiz →</Link></div>
          ) : (
            <ul className="mt-4 divide-y">
              {attempts.slice(0, 5).map((a) => (
                <li key={a.id} className="flex justify-between py-2.5 text-sm">
                  <span>{QUIZZES.find((q) => q.id === a.quiz_id)?.title ?? a.topic}</span>
                  <span className="font-mono">{a.score}/{a.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
