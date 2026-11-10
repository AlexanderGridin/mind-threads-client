import type {
  MindThread,
  MindThreadUpdate,
  NewMindThread,
  NewSectionPage,
  NewThreadSection,
  SectionPage,
  ThreadSection,
} from "@/types";

export type UseThreadsServiceReturn = {
  getThreads: () => Promise<MindThread[]>;
  getThread: (threadId: string) => Promise<MindThread | null>;
  createThread: (newThread: NewMindThread) => Promise<MindThread>;
  updateThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
  deleteThread: (threadId: string) => Promise<void>;
  addThreadSection: (newSection: NewThreadSection) => Promise<ThreadSection>;
  removeThreadSection: (params: RemoveThreadSectionParams) => Promise<void>;
  addSectionPage: (newPage: NewSectionPage) => Promise<SectionPage>;
};

export type RemoveThreadSectionParams = {
  threadId: string;
  sectionId: string;
};

export type ApplyDeletedSectionParams = {
  thread: MindThread;
  deletedPageCount: number;
  deletedAt: string;
};

export type ApplyThreadUpdateParams = {
  thread: MindThread;
  threadUpdate: MindThreadUpdate;
};

export type ApplyNewSectionParams = {
  thread: MindThread;
  createdAt: string;
};

export type ApplyNewPageParams = {
  thread: MindThread;
  createdAt: string;
};

export type FindThreadParams = {
  threads: MindThread[];
  threadId: string;
};
