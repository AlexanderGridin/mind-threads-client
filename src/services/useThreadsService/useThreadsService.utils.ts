import type { MindThread, NewMindThread } from "@/types";

export const buildThread = ({ title, color }: NewMindThread): MindThread => ({
  id: crypto.randomUUID(),
  title: title.trim(),
  color,
  totalSections: 0,
  totalPages: 0,
  lastUpdated: new Date().toISOString(),
});

const isMindThread = (value: unknown): value is MindThread => {
  if (typeof value !== "object" || value === null) return false;

  const thread = value as Partial<Record<keyof MindThread, unknown>>;

  return (
    typeof thread.id === "string" &&
    typeof thread.title === "string" &&
    typeof thread.color === "string" &&
    typeof thread.totalSections === "number" &&
    typeof thread.totalPages === "number" &&
    typeof thread.lastUpdated === "string"
  );
};

export const isMindThreadList = (value: unknown): value is MindThread[] =>
  Array.isArray(value) && value.every(isMindThread);
