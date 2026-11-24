import type {
  ChatMessage,
  MindThread,
  MindThreadUpdate,
  NewChatMessage,
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
  removeSectionPage: (params: RemoveSectionPageParams) => Promise<void>;
  getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
  addPageMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
};

export type RemoveThreadSectionParams = {
  threadId: string;
  sectionId: string;
};

export type RemoveSectionPageParams = {
  threadId: string;
  pageId: string;
};

export type ApplyDeletedSectionParams = {
  thread: MindThread;
  deletedPageCount: number;
  deletedAt: string;
};

export type ApplyDeletedPageParams = {
  thread: MindThread;
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
