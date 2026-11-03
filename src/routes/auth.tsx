import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode | undefined } => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? s["mode"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — MathMentor AI" },
      { name: "description", content: "Sign in or create your MathMentor AI account." },
      { property: "og:title", content: "Sign in — MathMentor AI" },
      { property: "og:description", content: "Access your maths tutor, courses and progress." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="chalkboard hidden flex-col justify-between p-12 lg:flex">
        <Link to="/"><Logo inverted /></Link>
        <div>
          <p className="font-display text-4xl leading-tight">"Pure mathematics is, in its way, the poetry of logical ideas."</p>
          <p className="mt-4 text-sm opacity-70">— Albert Einstein</p>
        </div>
        <p className="font-mono text-xs opacity-60">e^(iπ) + 1 = 0</p>
      </div>
      <div className="graph-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-card">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h1 className="text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start preparing for GATE & IIT JAM today." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to continue learning."}
          </p>

          {mode !== "forgot" && (
            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => oauth("google")}>Continue with Google</Button>
              <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>Continue with Lovable</button>
              <div className="flex items-center gap-3 py-2 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {mode !== "forgot" && (
              <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          <div className="mt-5 space-y-1 text-center text-sm">
            {mode === "signin" && (
              <>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>
                <p>New here? <button className="font-medium text-primary" onClick={() => setMode("signup")}>Create an account</button></p>
              </>
            )}
            {mode !== "signin" && (
              <p>Already registered? <button className="font-medium text-primary" onClick={() => setMode("signin")}>Sign in</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
