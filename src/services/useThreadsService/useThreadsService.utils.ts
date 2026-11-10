import type { MindThread, NewMindThread } from "@/types";
import type {
  ApplyDeletedSectionParams,
  ApplyNewPageParams,
  ApplyNewSectionParams,
  ApplyThreadUpdateParams,
  FindThreadParams,
} from "./useThreadsService.types";

export const buildThread = ({ title, color }: NewMindThread): MindThread => ({
  id: crypto.randomUUID(),
  title: title.trim(),
  color,
  totalSections: 0,
  totalPages: 0,
  lastUpdated: new Date().toISOString(),
});

export const applyNewSection = ({
  thread,
  createdAt,
}: ApplyNewSectionParams): MindThread => {
  return {
    ...thread,
    totalSections: thread.totalSections + 1,
    lastUpdated: createdAt,
  };
};

export const applyNewPage = ({
  thread,
  createdAt,
}: ApplyNewPageParams): MindThread => {
  return {
    ...thread,
    totalPages: thread.totalPages + 1,
    lastUpdated: createdAt,
  };
};

export const applyDeletedSection = ({
  thread,
  deletedPageCount,
  deletedAt,
}: ApplyDeletedSectionParams): MindThread => {
  return {
    ...thread,
    totalSections: thread.totalSections - 1,
    totalPages: thread.totalPages - deletedPageCount,
    lastUpdated: deletedAt,
  };
};

export const findThread = ({ threads, threadId }: FindThreadParams) => {
  return threads.find((thread) => {
    return thread.id === threadId;
  });
};

export const applyThreadUpdate = ({
  thread,
  threadUpdate,
}: ApplyThreadUpdateParams): MindThread => {
  return {
    ...thread,
    title: threadUpdate.title.trim(),
    color: threadUpdate.color,
    lastUpdated: new Date().toISOString(),
  };
};

const isMindThread = (value: unknown): value is MindThread => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

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
