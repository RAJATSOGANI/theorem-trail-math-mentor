import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Bot, Sparkle, ListChecks, Calculator, BookOpen, GraduationCap, ClipboardList, LineChart, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tutor", label: "AI Tutor", icon: Bot },
  { to: "/solver", label: "Step Solver", icon: ListChecks },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/exam-prep", label: "GATE & JAM", icon: GraduationCap },
  { to: "/quiz-generator", label: "AI Quiz Generator", icon: Sparkle },
  { to: "/quizzes", label: "Quizzes & Tests", icon: ClipboardList },
  { to: "/progress", label: "Analytics", icon: LineChart },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const name = (user.user_metadata?.["full_name"] as string) || user.email?.split("@")[0] || "Student";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/dashboard" onClick={() => setOpen(false)}><Logo inverted /></Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-sidebar-primary font-medium" }}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs opacity-60">{user.email}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <Logo />
        </header>
        <main className="graph-paper flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
