export type ThreadSection = {
  id: string;
  threadId: string;
  name: string;
  color: string;
  createdAt: string;
};

export type ThreadSectionValue = Pick<ThreadSection, "name" | "color">;

export type NewThreadSection = Pick<
  ThreadSection,
  "threadId" | "name" | "color"
>;
