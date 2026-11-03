import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

export type GenQuestion = { q: string; options: string[]; answer: number; explain: string };
export type GenInput = { topic: string; difficulty: "Easy" | "Medium" | "Hard"; mode: "GATE" | "IIT JAM" | "Practice"; count: number };

const DIFFS = ["Easy", "Medium", "Hard"];
const MODES = ["GATE", "IIT JAM", "Practice"];

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["q", "options", "answer", "explain"],
        properties: {
          q: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "integer" },
          explain: { type: "string" },
        },
      },
    },
  },
};

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? []).flatMap((i) => (i.type === "message" ? (i.content ?? []) : [])).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("");
}

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: GenInput): GenInput => {
    const topic = String(d?.topic ?? "").trim().slice(0, 120);
    if (!topic) throw new Error("Topic required");
    return {
      topic,
      difficulty: (DIFFS.includes(d.difficulty) ? d.difficulty : "Medium") as GenInput["difficulty"],
      mode: (MODES.includes(d.mode) ? d.mode : "Practice") as GenInput["mode"],
      count: Math.min(15, Math.max(3, Math.round(Number(d.count) || 5))),
    };
  })
  .handler(async ({ data }) => {
    const style =
      data.mode === "GATE" ? "in the style of GATE Mathematics / Engineering Mathematics papers (conceptual + numerical, crisp)"
      : data.mode === "IIT JAM" ? "in the style of IIT JAM Mathematics papers (proof-oriented reasoning, analysis/algebra flavour)"
      : "as general university-level practice";
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: "You write accurate multiple-choice mathematics questions. Every question has exactly 4 options and exactly one correct option. Double-check each answer. Use LaTeX with $...$ for all math in questions, options and explanations. Explanations are 1-3 sentences showing the key step.",
        input: `Create ${data.count} ${data.difficulty} multiple-choice questions on "${data.topic}" ${style}. "answer" is the 0-based index of the correct option. Vary which index is correct.`,
        text: { format: { type: "json_schema", name: "quiz", schema, strict: true } },
      });
      const parsed = JSON.parse(extractText(res)) as { questions: GenQuestion[] };
      const questions = parsed.questions
        .filter((q) => Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer < 4 && q.q)
        .slice(0, data.count);
      if (questions.length === 0) return { questions: [] as GenQuestion[], error: "The AI returned no usable questions. Try again." };
      return { questions, error: null as string | null };
    } catch (e) {
      console.error(e);
      if (e instanceof GatewayError) {
        if (e.httpStatus === 429) return { questions: [] as GenQuestion[], error: "Too many requests right now. Please wait a moment." };
        if (e.httpStatus === 402) return { questions: [] as GenQuestion[], error: "AI credits are exhausted. Please add credits to continue." };
      }
      return { questions: [] as GenQuestion[], error: "Couldn't generate the quiz. Please try again." };
    }
  });
