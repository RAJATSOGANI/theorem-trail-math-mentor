import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { COURSES } from "@/lib/data";
import { useCompletedLessons } from "@/lib/progress";
import { PageTitle } from "@/components/PageTitle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({ meta: [{ title: "Courses — MathMentor AI" }, { name: "description", content: "Topic-wise mathematics courses." }] }),
  component: Courses,
});

const filters = ["All", "GATE", "IIT JAM"] as const;

function Courses() {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const { done } = useCompletedLessons();
  const list = COURSES.filter((c) => f === "All" || c.exams.includes(f));
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle eyebrow="Learn" title="Topic-wise courses">Structured lessons with key results for every major exam topic.</PageTitle>
      <div className="mb-6 flex gap-2">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-full border px-4 py-1.5 text-sm ${f === x ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-accent"}`}>{x}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => {
          const d = c.lessons.filter((l) => done.includes(`${c.id}/${l.id}`)).length;
          return (
            <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="flex flex-col rounded-xl border bg-card p-6 shadow-card transition-transform hover:-translate-y-0.5">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{c.level}</Badge>
                {c.exams.map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{c.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.blurb}</p>
              <div className="mt-5 flex justify-between text-xs text-muted-foreground"><span>{c.lessons.length} lessons</span><span>{d} done</span></div>
              <Progress value={(d / c.lessons.length) * 100} className="mt-1.5 h-1.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
