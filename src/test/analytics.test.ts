import { describe, it, expect } from "vitest";
import { topicStats, weakTopics, quizMinutes, trend } from "@/lib/analytics";

const a = (topic: string, score: number, total: number, created_at = "2026-11-01") => ({ topic, score, total, created_at });

describe("analytics", () => {
  it("computes topic accuracy across attempts by questions", () => {
    const s = topicStats([a("Calculus", 3, 4), a("Calculus", 1, 4)]);
    expect(s[0]).toMatchObject({ topic: "Calculus", correct: 4, total: 8, accuracy: 50 });
  });
  it("flags topics below 60% as weak", () => {
    const w = weakTopics(topicStats([a("Algebra", 2, 5), a("Calculus", 3, 5)]));
    expect(w.map((x) => x.topic)).toEqual(["Algebra"]);
  });
  it("does not flag topics with fewer than 3 questions answered", () => {
    expect(weakTopics(topicStats([a("Algebra", 0, 2)]))).toEqual([]);
  });
  it("gives 1.5 / 2 / 3 minutes per question by difficulty", () => {
    expect(quizMinutes(10, "Easy")).toBe(15);
    expect(quizMinutes(10, "Medium")).toBe(20);
    expect(quizMinutes(10, "Hard")).toBe(30);
  });
  it("tracks running accuracy in date order", () => {
    const t = trend([a("X", 4, 4, "2026-11-02"), a("X", 0, 4, "2026-11-01")]);
    expect(t.map((p) => p.cumulative)).toEqual([0, 50]);
  });
});
