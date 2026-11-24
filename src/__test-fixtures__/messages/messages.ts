import type { ChatMessage, NewChatMessage, SectionPage } from "@/types";
import { sectionPageFixtures } from "../pages/pages";

const FIXTURE_BASE_TIME = Date.parse("2026-07-01T12:00:00.000Z");
const ONE_MINUTE_IN_MS = 60_000;

const buildCreatedAt = (index: number) => {
  return new Date(FIXTURE_BASE_TIME - index * ONE_MINUTE_IN_MS).toISOString();
};

export const chatMessageFixtures: ChatMessage[] = [
  {
    id: "message-1",
    threadId: sectionPageFixtures[0].threadId,
    sectionId: sectionPageFixtures[0].sectionId,
    pageId: sectionPageFixtures[0].id,
    content: "<p><strong>Bold</strong> idea for the page</p>",
    tags: ["ideas", "draft"],
    createdAt: buildCreatedAt(0),
  },
  {
    id: "message-2",
    threadId: sectionPageFixtures[0].threadId,
    sectionId: sectionPageFixtures[0].sectionId,
    pageId: sectionPageFixtures[0].id,
    content: "<p>A note without tags</p>",
    tags: [],
    createdAt: buildCreatedAt(1),
  },
  {
    id: "message-3",
    threadId: sectionPageFixtures[1].threadId,
    sectionId: sectionPageFixtures[1].sectionId,
    pageId: sectionPageFixtures[1].id,
    content: "<p>Message on the second page</p>",
    tags: ["shortlist"],
    createdAt: buildCreatedAt(2),
  },
  {
    id: "message-4",
    threadId: sectionPageFixtures[2].threadId,
    sectionId: sectionPageFixtures[2].sectionId,
    pageId: sectionPageFixtures[2].id,
    content: "<p>Message in another section</p>",
    tags: [],
    createdAt: buildCreatedAt(3),
  },
  {
    id: "message-5",
    threadId: sectionPageFixtures[3].threadId,
    sectionId: sectionPageFixtures[3].sectionId,
    pageId: sectionPageFixtures[3].id,
    content: "<p>Message in another thread</p>",
    tags: [],
    createdAt: buildCreatedAt(4),
  },
];

const firstPage = sectionPageFixtures[0];

export const firstPageMessageFixtures = chatMessageFixtures.filter(
  (message) => {
    return message.pageId === firstPage.id;
  }
);

export const messagesAfterPageDelete = chatMessageFixtures.filter((message) => {
  return message.pageId !== firstPage.id;
});

export const messagesAfterSectionDelete = chatMessageFixtures.filter(
  (message) => {
    return message.sectionId !== firstPage.sectionId;
  }
);

export const messagesAfterThreadDelete = chatMessageFixtures.filter(
  (message) => {
    return message.threadId !== firstPage.threadId;
  }
);

export const buildNewMessage = (
  overrides: Partial<NewChatMessage> = {}
): NewChatMessage => {
  return {
    threadId: sectionPageFixtures[0].threadId,
    sectionId: sectionPageFixtures[0].sectionId,
    pageId: sectionPageFixtures[0].id,
    content: "<p>Hello</p>",
    tags: [],
    ...overrides,
  };
};

type BuildPageMessagesParams = {
  page: SectionPage;
  count: number;
};

export const buildPageMessages = ({
  page,
  count,
}: BuildPageMessagesParams): ChatMessage[] => {
  return Array.from({ length: count }, (_value, index) => {
    return {
      id: `message-${index}`,
      threadId: page.threadId,
      sectionId: page.sectionId,
      pageId: page.id,
      content: `<p>Message ${index}</p>`,
      tags: [],
      createdAt: buildCreatedAt(index),
    };
  });
};
