export type AttemptLike = { topic: string; score: number; total: number; created_at: string; difficulty?: string | null; mode?: string | null };

/** A topic is weak when accuracy is below this, once enough questions are answered. */
export const WEAK_THRESHOLD = 60;
export const MIN_QUESTIONS_FOR_WEAK = 3;

export type TopicStat = { topic: string; correct: number; total: number; attempts: number; accuracy: number };

export function topicStats(attempts: AttemptLike[]): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const a of attempts) {
    const s = map.get(a.topic) ?? { topic: a.topic, correct: 0, total: 0, attempts: 0, accuracy: 0 };
    s.correct += a.score;
    s.total += a.total;
    s.attempts += 1;
    map.set(a.topic, s);
  }
  return [...map.values()]
    .map((s) => ({ ...s, accuracy: s.total ? Math.round((s.correct / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
}

export function weakTopics(stats: TopicStat[]): TopicStat[] {
  return stats.filter((s) => s.total >= MIN_QUESTIONS_FOR_WEAK && s.accuracy < WEAK_THRESHOLD).sort((a, b) => a.accuracy - b.accuracy);
}

export function groupAccuracy(attempts: AttemptLike[], key: "difficulty" | "mode") {
  const m = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    const k = a[key];
    if (!k) continue;
    const s = m.get(k) ?? { correct: 0, total: 0 };
    s.correct += a.score;
    s.total += a.total;
    m.set(k, s);
  }
  return [...m.entries()].map(([label, s]) => ({ label, accuracy: Math.round((s.correct / s.total) * 100), total: s.total }));
}

/** Chronological per-attempt accuracy plus a running overall accuracy. */
export function trend(attempts: AttemptLike[]) {
  const sorted = [...attempts].sort((a, b) => a.created_at.localeCompare(b.created_at));
  let c = 0, t = 0;
  return sorted.map((a) => {
    c += a.score; t += a.total;
    return { date: a.created_at, accuracy: Math.round((a.score / a.total) * 100), cumulative: Math.round((c / t) * 100) };
  });
}

export function quizMinutes(count: number, difficulty: string) {
  const per = difficulty === "Hard" ? 3 : difficulty === "Easy" ? 1.5 : 2;
  return Math.ceil(count * per);
}
