import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

type Msg = { role: "user" | "assistant"; content: string };

const TUTOR_PROMPT = `You are MathMentor AI, a patient, rigorous mathematics tutor for Indian university students preparing for GATE (Mathematics / Engineering Maths) and IIT JAM Mathematics.
- Explain concepts clearly, build intuition, then formalise.
- Use LaTeX with $...$ for inline and $$...$$ for display math.
- Use Markdown headings and lists. Ask a short check-for-understanding question when helpful.`;

const SOLVER_PROMPT = `You are a step-by-step math solver. Solve the problem completely.
Format strictly in Markdown:
## Understanding the problem
## Step 1: ... (one heading per step, each with a short explanation and the math)
## Final answer
Use LaTeX with $...$ inline and $$...$$ display. Verify the answer where possible.`;

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  const parts: string[] = [];
  for (const item of r.output ?? []) {
    if (item.type !== "message") continue;
    for (const c of item.content ?? []) if (c.type === "output_text" && c.text) parts.push(c.text);
  }
  return parts.join("\n");
}

async function run(instructions: string, messages: Msg[]) {
  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return { text: extractText(res) || "I couldn't produce an answer. Please try rephrasing.", error: null as string | null };
  } catch (e) {
    console.error(e);
    if (e instanceof GatewayError) {
      if (e.httpStatus === 429) return { text: "", error: "Too many requests right now. Please wait a moment." };
      if (e.httpStatus === 402) return { text: "", error: "AI credits are exhausted. Please add credits to continue." };
    }
    return { text: "", error: "The AI tutor is unavailable right now. Please try again." };
  }
}

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: Msg[] }) => {
    if (!Array.isArray(d?.messages) || d.messages.length === 0) throw new Error("No messages");
    return { messages: d.messages.slice(-30).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 8000) }) as Msg) };
  })
  .handler(async ({ data }) => run(TUTOR_PROMPT, data.messages));

export const solveProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { problem: string }) => {
    const p = String(d?.problem ?? "").trim();
    if (!p) throw new Error("Empty problem");
    return { problem: p.slice(0, 4000) };
  })
  .handler(async ({ data }) => run(SOLVER_PROMPT, [{ role: "user", content: data.problem }]));
