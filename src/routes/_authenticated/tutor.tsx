import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Sigma } from "lucide-react";
import { askTutor } from "@/lib/ai.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — MathMentor AI" }, { name: "description", content: "Chat with your AI mathematics tutor." }] }),
  component: Tutor,
});

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "mm-tutor-chat";
const starters = ["Explain the Cayley–Hamilton theorem with an example", "Why does the harmonic series diverge?", "How do I find eigenvalues of a 3×3 matrix quickly for GATE?", "Explain uniform vs pointwise convergence"];

function Tutor() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { setMessages(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
    taRef.current?.focus();
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function save(m: Msg[]) { setMessages(m); localStorage.setItem(KEY, JSON.stringify(m)); }

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user" as const, content: t }];
    save(next);
    setInput("");
    setLoading(true);
    try {
      const r = await askTutor({ data: { messages: next } });
      save([...next, { role: "assistant", content: r.error ? `⚠️ ${r.error}` : r.text }]);
    } catch {
      save([...next, { role: "assistant", content: "⚠️ Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      taRef.current?.focus();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Sigma className="h-5 w-5" /></span>
          <div><h1 className="text-2xl font-semibold">AI Tutor</h1><p className="text-xs text-muted-foreground">Professor Sigma · explains with intuition, then rigour</p></div>
        </div>
        {messages.length > 0 && <Button variant="ghost" size="sm" onClick={() => save([])}><RotateCcw /> New conversation</Button>}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 shadow-card md:p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-display text-2xl">What shall we learn today?</p>
            <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {starters.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border bg-background p-3 text-left text-sm hover:border-accent">{s}</button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-5">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">{m.content}</div>
            ) : (
              <div key={i} className="max-w-full"><MathMarkdown>{m.content}</MathMarkdown></div>
            ),
          )}
          {loading && <div className="flex gap-1 text-muted-foreground"><span className="animate-bounce">•</span><span className="animate-bounce [animation-delay:150ms]">•</span><span className="animate-bounce [animation-delay:300ms]">•</span></div>}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-end gap-2 rounded-xl border bg-card p-2 shadow-card">
        <Textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask a maths question… (Shift+Enter for new line)"
          rows={2}
          className="min-h-0 resize-none border-0 shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send"><Send /></Button>
      </form>
    </div>
  );
}
