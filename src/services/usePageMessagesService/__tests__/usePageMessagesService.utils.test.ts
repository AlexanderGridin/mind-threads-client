import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { buildNewMessage, chatMessageFixtures } from "@/__test-fixtures__";
import type { ChatMessage } from "@/types";
import {
  buildMessage,
  isChatMessageList,
} from "../usePageMessagesService.utils";

const FIXED_NOW = new Date("2026-06-20T12:00:00Z");
const MESSAGE_ID = "11111111-1111-4111-8111-111111111111";
const INVALID_CREATED_AT = "not-a-date";

const REQUIRED_MESSAGE_FIELDS = [
  "id",
  "threadId",
  "sectionId",
  "pageId",
  "content",
  "tags",
  "createdAt",
] as const;

describe("usePageMessagesService.utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("buildMessage", () => {
    it("returns the new message fields", () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue(MESSAGE_ID);
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const newMessage = buildNewMessage({
        content: "<p>Idea</p>",
        tags: ["ideas"],
      });

      const expectedMessage = {
        id: MESSAGE_ID,
        ...newMessage,
        createdAt: FIXED_NOW.toISOString(),
      };

      const message = buildMessage(newMessage);
      expect(message).toStrictEqual(expectedMessage);
    });

    it("returns a crypto.randomUUID() id", () => {
      const randomUuidSpy = vi
        .spyOn(crypto, "randomUUID")
        .mockReturnValue(MESSAGE_ID);

      const message = buildMessage(buildNewMessage());

      expect(randomUuidSpy).toHaveBeenCalledTimes(1);
      expect(message.id).toBe(MESSAGE_ID);
    });

    it("sets createdAt to the current ISO time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const message = buildMessage(buildNewMessage());
      expect(message.createdAt).toBe(FIXED_NOW.toISOString());
    });

    it("copies the tags array instead of keeping the same reference", () => {
      const newMessage = buildNewMessage({ tags: ["ideas"] });

      const message = buildMessage(newMessage);

      expect(message.tags).not.toBe(newMessage.tags);
      expect(message.tags).toStrictEqual(newMessage.tags);
    });
  });

  describe("isChatMessageList", () => {
    it("returns true for the message fixtures", () => {
      const isValid = isChatMessageList(chatMessageFixtures);
      expect(isValid).toBe(true);
    });

    it("returns true for an empty list", () => {
      const isValid = isChatMessageList([]);
      expect(isValid).toBe(true);
    });

    it("returns false for a non-array value", () => {
      const isValid = isChatMessageList({ messages: chatMessageFixtures });
      expect(isValid).toBe(false);
    });

    it("returns false when the list contains null items", () => {
      const isValid = isChatMessageList([null]);
      expect(isValid).toBe(false);
    });

    it.each(REQUIRED_MESSAGE_FIELDS)(
      "returns false when a message has no %s",
      (field) => {
        const messageWithoutField: Partial<ChatMessage> = {
          ...chatMessageFixtures[0],
        };

        delete messageWithoutField[field];

        const isValid = isChatMessageList([messageWithoutField]);
        expect(isValid).toBe(false);
      }
    );

    it("returns false when tags contain a non-string item", () => {
      const isValid = isChatMessageList([
        { ...chatMessageFixtures[0], tags: [1] },
      ]);

      expect(isValid).toBe(false);
    });

    it("returns false when createdAt is not a valid date", () => {
      const isValid = isChatMessageList([
        { ...chatMessageFixtures[0], createdAt: INVALID_CREATED_AT },
      ]);

      expect(isValid).toBe(false);
    });
  });
});
