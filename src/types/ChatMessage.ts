export type ChatMessage = {
  id: string;
  threadId: string;
  sectionId: string;
  pageId: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export type NewChatMessage = Pick<
  ChatMessage,
  "threadId" | "sectionId" | "pageId" | "content" | "tags"
>;
