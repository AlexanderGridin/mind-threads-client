import type { NewThreadSection, ThreadSection } from "@/types";

export const buildSection = ({
  threadId,
  name,
  color,
}: NewThreadSection): ThreadSection => {
  return {
    id: crypto.randomUUID(),
    threadId,
    name: name.trim(),
    color,
    createdAt: new Date().toISOString(),
  };
};

const isThreadSection = (value: unknown): value is ThreadSection => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const section = value as Partial<Record<keyof ThreadSection, unknown>>;

  return (
    typeof section.id === "string" &&
    typeof section.threadId === "string" &&
    typeof section.name === "string" &&
    typeof section.color === "string" &&
    typeof section.createdAt === "string"
  );
};

export const isThreadSectionList = (
  value: unknown
): value is ThreadSection[] => {
  return Array.isArray(value) && value.every(isThreadSection);
};
