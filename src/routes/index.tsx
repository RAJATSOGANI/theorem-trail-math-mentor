import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Calculator, GraduationCap, LineChart, ListChecks, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { MathMarkdown } from "@/components/MathMarkdown";
import founderPortrait from "@/assets/founder_portrait.png.asset.json";
import founderBg from "@/assets/founder_background.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MathMentor AI — AI Maths Tutor for GATE & IIT JAM" },
      { name: "description", content: "Learn mathematics with an AI tutor, step-by-step solver, calculator, courses and mock tests for GATE and IIT JAM." },
      { property: "og:title", content: "MathMentor AI — AI Maths Tutor for GATE & IIT JAM" },
      { property: "og:description", content: "AI tutor, step-by-step solver, courses and quizzes for GATE and IIT JAM Mathematics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Bot, title: "AI Tutor", text: "Ask anything, get intuition-first explanations with proper notation." },
  { icon: ListChecks, title: "Step-by-step Solver", text: "Every step written out, from setup to verified answer." },
  { icon: Calculator, title: "Scientific Calculator", text: "Evaluate expressions and plot functions instantly." },
  { icon: GraduationCap, title: "GATE & IIT JAM", text: "Syllabus maps, exam patterns and targeted mock tests." },
  { icon: BookOpen, title: "Topic Courses", text: "Calculus to Group Theory, lesson by lesson." },
  { icon: LineChart, title: "Progress Tracking", text: "See scores, strengths and weak topics at a glance." },
];

function Landing() {
  return (
    <div className="graph-paper min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex gap-2">
          <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <span className="rounded-full border border-accent/50 bg-accent/15 px-3 py-1 text-xs font-medium text-foreground">GATE 2027 · IIT JAM 2027</span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] md:text-6xl">
            Mathematics, explained <em className="text-primary">one step</em> at a time.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            MathMentor AI is your personal tutor, solver and exam coach — built for serious mathematics students.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Start learning free <ArrowRight /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild><Link to="/auth">I have an account</Link></Button>
          </div>
        </div>
        <div className="chalkboard rounded-2xl p-8 shadow-card">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Solver · Step 2 of 3</p>
          <div className="mt-4 text-lg">
            <MathMarkdown>{"Integrate by parts with $u=x$, $dv=e^x dx$:\n\n$$\\int_0^1 x e^x\\,dx = \\big[x e^x\\big]_0^1 - \\int_0^1 e^x\\,dx = e-(e-1) = 1$$"}</MathMarkdown>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-sidebar-accent p-3 text-sm">
            <Bot className="h-5 w-5 text-accent" /> Why does u = x make the integral simpler? Ask the tutor.
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <img src={founderBg.url} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sidebar via-sidebar/90 to-sidebar/60" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Rajat Jain</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Founder of MathMentor AI</h2>
            <p className="mt-4 text-xl text-sidebar-foreground/80">Building Smarter Mathematics Learning with AI</p>
            <Button size="lg" className="mt-8" asChild><a href="#founder">Meet the founder <ArrowRight /></a></Button>
          </div>
          <img src={founderPortrait.url} alt="Rajat Jain, founder of MathMentor AI" className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl object-cover object-[45%_center] shadow-card ring-1 ring-sidebar-border" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="founder" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-8 rounded-2xl border bg-card p-6 shadow-card md:grid-cols-[260px_1fr] md:p-10">
          <img src={founderPortrait.url} alt="Rajat Jain" className="mx-auto aspect-square w-56 rounded-full object-cover object-[45%_30%] ring-4 ring-accent/40" />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">The founder</p>
            <h2 className="mt-2 text-3xl font-semibold">Rajat Jain</h2>
            <p className="text-sm text-muted-foreground">Founder of MathMentor AI</p>
            <p className="mt-4 leading-relaxed">I am passionate about mathematics and technology. My vision is to make mathematics easier to understand through AI-powered learning, step-by-step solutions, and smart practice tools.</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">MathMentor AI aims to help students prepare for GATE Mathematics and IIT JAM more effectively.</p>
          </div>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 MathMentor AI</footer>
    </div>
  );
}
