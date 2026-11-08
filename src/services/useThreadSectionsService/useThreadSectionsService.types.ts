import type { NewThreadSection, ThreadSection } from "@/types";

export type UseThreadSectionsServiceReturn = {
  getThreadSections: (threadId: string) => Promise<ThreadSection[]>;
  createThreadSection: (newSection: NewThreadSection) => Promise<ThreadSection>;
  deleteThreadSections: (threadId: string) => Promise<void>;
};
