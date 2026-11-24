import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  buildNewMessage,
  chatMessageFixtures,
  firstPageMessageFixtures,
  MALFORMED_JSON,
  messagesAfterPageDelete,
  messagesAfterSectionDelete,
  messagesAfterThreadDelete,
  readStoredMessages,
  seedMessages,
  sectionPageFixtures,
} from "@/__test-fixtures__";
import type { ChatMessage } from "@/types";
import { usePageMessagesService } from "../usePageMessagesService";
import {
  INVALID_MESSAGES_DATA_ERROR,
  MESSAGES_STORAGE_KEY,
} from "../usePageMessagesService.constants";

const STORAGE_WRITE_ERROR = "Storage quota exceeded";
const UNKNOWN_PAGE_ID = "page-that-does-not-exist";

const FIRST_PAGE_ID = sectionPageFixtures[0].id;

const DELETE_CASES: [
  "deletePageMessages" | "deleteSectionMessages" | "deleteThreadMessages",
  string,
  ChatMessage[],
][] = [
  ["deletePageMessages", FIRST_PAGE_ID, messagesAfterPageDelete],
  [
    "deleteSectionMessages",
    sectionPageFixtures[0].sectionId,
    messagesAfterSectionDelete,
  ],
  [
    "deleteThreadMessages",
    sectionPageFixtures[0].threadId,
    messagesAfterThreadDelete,
  ],
];

const setupHook = () => {
  return renderHook(() => {
    return usePageMessagesService();
  });
};

describe("usePageMessagesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPageMessages", () => {
    it("resolves only the given page's messages, newest first", async () => {
      const { result } = setupHook();

      seedMessages(chatMessageFixtures);

      const pageMessages = await result.current.getPageMessages(FIRST_PAGE_ID);
      expect(pageMessages).toStrictEqual(firstPageMessageFixtures);
    });

    it("resolves an empty list when nothing is stored", async () => {
      const { result } = setupHook();

      const expectedMessages: ChatMessage[] = [];
      const pageMessages = await result.current.getPageMessages(FIRST_PAGE_ID);

      expect(pageMessages).toStrictEqual(expectedMessages);
    });

    it("rejects when the stored value is not a list of messages", async () => {
      const { result } = setupHook();

      localStorage.setItem(
        MESSAGES_STORAGE_KEY,
        JSON.stringify([{ id: "message-1" }])
      );

      await expect(
        result.current.getPageMessages(FIRST_PAGE_ID)
      ).rejects.toThrow(INVALID_MESSAGES_DATA_ERROR);
    });

    it("rejects when the stored value is malformed JSON", async () => {
      const { result } = setupHook();

      localStorage.setItem(MESSAGES_STORAGE_KEY, MALFORMED_JSON);

      await expect(
        result.current.getPageMessages(FIRST_PAGE_ID)
      ).rejects.toThrow(SyntaxError);
    });
  });

  describe("createMessage", () => {
    it("stores the new message first and returns it", async () => {
      const { result } = setupHook();

      seedMessages(chatMessageFixtures);

      const createdMessage = await result.current.createMessage(
        buildNewMessage({ content: "<p>Fresh idea</p>" })
      );

      const expectedMessages = [createdMessage, ...chatMessageFixtures];
      expect(readStoredMessages()).toStrictEqual(expectedMessages);
    });

    it("rejects when the storage write fails", async () => {
      const { result } = setupHook();

      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error(STORAGE_WRITE_ERROR);
      });

      await expect(
        result.current.createMessage(buildNewMessage())
      ).rejects.toThrow(STORAGE_WRITE_ERROR);
    });
  });

  describe("deleteMessages", () => {
    it.each(DELETE_CASES)(
      "%s removes only the matching messages",
      async (methodName, targetId, expectedMessages) => {
        const { result } = setupHook();

        seedMessages(chatMessageFixtures);

        await result.current[methodName](targetId);

        expect(readStoredMessages()).toStrictEqual(expectedMessages);
      }
    );

    it.each(DELETE_CASES)(
      "%s writes nothing when no message matches",
      async (methodName) => {
        const { result } = setupHook();

        seedMessages(chatMessageFixtures);

        const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

        await result.current[methodName](UNKNOWN_PAGE_ID);

        expect(setItemSpy).not.toHaveBeenCalled();
      }
    );
  });
});
