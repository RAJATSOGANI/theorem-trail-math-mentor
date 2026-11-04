import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Wand2 } from "lucide-react";
import { solvePhoto } from "@/lib/ai.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/photo-solver")({
  head: () => ({ meta: [{ title: "Photo Math Solver — MathMentor AI" }, { name: "description", content: "Upload a photo of a maths question and get a step-by-step solution." }] }),
  component: PhotoSolver,
});

async function toDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.85);
}

function PhotoSolver() {
  const [image, setImage] = useState("");
  const [note, setNote] = useState("");
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function pick(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image file.");
    setError(""); setSolution("");
    try { setImage(await toDataUrl(f)); } catch { setError("Couldn't read that image."); }
  }

  async function solve() {
    setLoading(true); setError(""); setSolution("");
    try {
      const r = await solvePhoto({ data: { image, note } });
      if (r.error) setError(r.error); else setSolution(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Solver" title="Photo math solver">Snap or upload a question — printed or handwritten — and get a full worked solution.</PageTitle>
      <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-card md:grid-cols-2">
        <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background p-4 text-center text-sm text-muted-foreground hover:border-accent">
          {image ? <img src={image} alt="Uploaded question" className="max-h-72 rounded object-contain" /> : (<><Camera className="mb-2 h-8 w-8 text-primary" />Tap to take a photo or choose an image</>)}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <div className="flex flex-col gap-3">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note, e.g. 'only part (b)'" />
          <Button onClick={solve} disabled={!image || loading}><Wand2 /> {loading ? "Reading & solving…" : "Solve from photo"}</Button>
          {image && <Button variant="ghost" onClick={() => { setImage(""); setSolution(""); }}>Clear image</Button>}
          <p className="text-xs text-muted-foreground">Clear, well-lit photos of a single question work best.</p>
        </div>
      </div>
      {loading && <div className="mt-6 animate-pulse rounded-xl border bg-card p-6 text-muted-foreground">Reading the question…</div>}
      {error && <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{error}</div>}
      {solution && <div className="mt-6 rounded-xl border bg-card p-6 shadow-card"><MathMarkdown>{solution}</MathMarkdown></div>}
    </div>
  );
}
