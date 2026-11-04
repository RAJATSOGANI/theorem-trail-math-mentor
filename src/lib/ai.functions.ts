import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

type Msg = { role: "user" | "assistant"; content: string };

const TUTOR_PROMPT = `You are MathMentor AI, a patient, rigorous mathematics tutor for Indian university students preparing for GATE (Mathematics / Engineering Maths) and IIT JAM Mathematics.
- Explain concepts clearly, build intuition, then formalise.
- For any problem or derivation, give a detailed numbered step-by-step explanation: state what each step does and why, show every intermediate line of working, and finish with a clearly marked final answer.
- Point out common mistakes and exam shortcuts (GATE / JAM) where relevant.
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

type Input = NonNullable<Parameters<typeof generateResponse>[0]["input"]>;

async function run(instructions: string, messages: Msg[] | Input) {
  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions,
      input: (Array.isArray(messages) && messages.every((m) => typeof (m as Msg).content === "string") ? (messages as Msg[]).map((m) => ({ role: m.role, content: m.content })) : messages) as Input,
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

export const solvePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { image: string; note?: string }) => {
    const image = String(d?.image ?? "");
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(image)) throw new Error("Invalid image");
    if (image.length > 7_000_000) throw new Error("Image too large");
    return { image, note: String(d?.note ?? "").slice(0, 1000) };
  })
  .handler(async ({ data }) =>
    run(SOLVER_PROMPT + "\nFirst transcribe the question from the image under '## Question (from image)'. If the image is unreadable or contains no maths problem, say so plainly instead of guessing.", [
      { role: "user", content: [
        { type: "input_text", text: data.note ? `Extra note from student: ${data.note}` : "Solve the maths question in this image." },
        { type: "input_image", image_url: data.image, detail: "auto" },
      ] },
    ] as Input),
  );

export const makeStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { exam: string; weeks: number; hours: number; weak: string; strong: string }) => ({
    exam: String(d?.exam ?? "GATE").slice(0, 40),
    weeks: Math.min(52, Math.max(1, Math.round(Number(d?.weeks) || 8))),
    hours: Math.min(14, Math.max(1, Number(d?.hours) || 3)),
    weak: String(d?.weak ?? "").slice(0, 500),
    strong: String(d?.strong ?? "").slice(0, 500),
  }))
  .handler(async ({ data }) =>
    run(
      "You are an expert GATE Mathematics / IIT JAM Mathematics study coach. Produce realistic, structured study plans in Markdown with a short overview, a week-by-week table (Week | Topics | Practice | Target), daily routine guidance, revision and mock-test checkpoints, and tips. Prioritise weak topics.",
      [{ role: "user", content: `Exam: ${data.exam}. Time available: ${data.weeks} weeks, ${data.hours} hours per day. Weak topics: ${data.weak || "not specified"}. Strong topics: ${data.strong || "not specified"}. Create my study plan.` }],
    ),
  );
