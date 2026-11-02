import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, Bot } from "lucide-react";
import { COURSES, QUIZZES } from "@/lib/data";
import { useCompletedLessons } from "@/lib/progress";
import { MathMarkdown } from "@/components/MathMarkdown";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  loader: ({ params }) => {
    const course = COURSES.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.course.title ?? "Course"} — MathMentor AI` }] }),
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  const { done, toggle } = useCompletedLessons();
  const quiz = QUIZZES.find((q) => q.topic === course.title);
  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All courses</Link>
      <div className="chalkboard mt-4 rounded-2xl p-8 shadow-card">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{course.exams.join(" · ")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{course.title}</h1>
        <p className="mt-2 opacity-80">{course.blurb}</p>
      </div>
      <ol className="mt-6 space-y-3">
        {course.lessons.map((l, i) => {
          const id = `${course.id}/${l.id}`;
          const isDone = done.includes(id);
          return (
            <li key={l.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-start gap-4">
                <button onClick={() => toggle(id)} aria-label={isDone ? "Mark incomplete" : "Mark complete"} className="mt-1">
                  {isDone ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                </button>
                <div className="flex-1">
                  <p className="font-mono text-xs text-muted-foreground">Lesson {i + 1}</p>
                  <h3 className="text-lg font-semibold">{l.title}</h3>
                  <p className="text-sm text-muted-foreground">{l.summary}</p>
                  {l.formula && <div className="mt-3 rounded-lg bg-muted px-4 py-1"><MathMarkdown>{`$$${l.formula}$$`}</MathMarkdown></div>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to="/tutor"><Bot /> Ask tutor about {course.title}</Link></Button>
        {quiz && <Button asChild><Link to="/quizzes/$quizId" params={{ quizId: quiz.id }}>Take the {course.title} quiz</Link></Button>}
      </div>
    </div>
  );
}
