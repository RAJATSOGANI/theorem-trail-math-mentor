import { queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Attempt = { id: string; quiz_id: string; topic: string; score: number; total: number; created_at: string };

export const attemptsQuery = queryOptions({
  queryKey: ["attempts"],
  queryFn: async (): Promise<Attempt[]> => {
    const { data, error } = await supabase.from("quiz_attempts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const KEY = "mm-completed-lessons";
export function useCompletedLessons() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setDone([]); }
  }, []);
  const toggle = (id: string) =>
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  return { done, toggle };
}

export function PageHeader() { return null; }
