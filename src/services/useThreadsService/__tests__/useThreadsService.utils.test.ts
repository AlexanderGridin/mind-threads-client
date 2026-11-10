import { describe, it, expect, afterEach, vi } from "vitest";
import { mindThreadFixtures } from "@/__test-fixtures__";
import {
  applyDeletedSection,
  applyNewSection,
  applyThreadUpdate,
  buildThread,
  findThread,
  isMindThreadList,
} from "../useThreadsService.utils";

const TEST_COLOR = "#A8E6CF";
const FIXED_NOW = new Date("2026-06-20T12:00:00Z");

describe("useThreadsService.utils", () => {
  describe("buildThread", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("trims the title and keeps the color", () => {
      const thread = buildThread({ title: "  My thread  ", color: TEST_COLOR });

      expect(thread.title).toBe("My thread");
      expect(thread.color).toBe(TEST_COLOR);
    });

    it("sets totalSections and totalPages to 0", () => {
      const thread = buildThread({ title: "My thread", color: TEST_COLOR });

      expect(thread.totalSections).toBe(0);
      expect(thread.totalPages).toBe(0);
    });

    it("sets lastUpdated to the current time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const thread = buildThread({ title: "My thread", color: TEST_COLOR });

      expect(thread.lastUpdated).toBe(FIXED_NOW.toISOString());
    });

    it("returns a different id on every call", () => {
      const firstThread = buildThread({
        title: "My thread",
        color: TEST_COLOR,
      });
      const secondThread = buildThread({
        title: "My thread",
        color: TEST_COLOR,
      });

      expect(firstThread.id).not.toBe(secondThread.id);
    });
  });

  describe("applyThreadUpdate", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns the thread with the trimmed title, the new color and the current lastUpdated", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const thread = mindThreadFixtures[0];
      const updatedThread = applyThreadUpdate({
        thread,
        threadUpdate: {
          id: thread.id,
          title: "  QA Strategy  ",
          color: TEST_COLOR,
        },
      });

      expect(updatedThread).toStrictEqual({
        ...thread,
        title: "QA Strategy",
        color: TEST_COLOR,
        lastUpdated: FIXED_NOW.toISOString(),
      });
    });

    it("does not mutate the input thread", () => {
      const originalThread = { ...mindThreadFixtures[0] };

      const updatedThread = applyThreadUpdate({
        thread: originalThread,
        threadUpdate: {
          id: originalThread.id,
          title: "QA Strategy",
          color: TEST_COLOR,
        },
      });

      expect(updatedThread).not.toBe(originalThread);
    });
  });

  describe("applyNewSection", () => {
    it("increments totalSections from 0 to 1", () => {
      const thread = { ...mindThreadFixtures[0], totalSections: 0 };

      const updatedThread = applyNewSection({
        thread,
        createdAt: FIXED_NOW.toISOString(),
      });

      expect(updatedThread.totalSections).toBe(1);
    });

    it("increments totalSections from 1 to 2", () => {
      const thread = { ...mindThreadFixtures[0], totalSections: 1 };

      const updatedThread = applyNewSection({
        thread,
        createdAt: FIXED_NOW.toISOString(),
      });

      expect(updatedThread.totalSections).toBe(2);
    });

    it("sets lastUpdated to createdAt and keeps the other fields", () => {
      const thread = mindThreadFixtures[0];
      const createdAt = FIXED_NOW.toISOString();

      const updatedThread = applyNewSection({ thread, createdAt });

      expect(updatedThread).toStrictEqual({
        ...thread,
        totalSections: thread.totalSections + 1,
        lastUpdated: createdAt,
      });
    });
  });

  describe("applyDeletedSection", () => {
    it("decrements totalSections by one", () => {
      const thread = { ...mindThreadFixtures[0], totalSections: 3 };

      const updatedThread = applyDeletedSection({
        thread,
        deletedAt: FIXED_NOW.toISOString(),
      });

      expect(updatedThread.totalSections).toBe(2);
    });

    it("sets lastUpdated to deletedAt and keeps the other fields", () => {
      const thread = mindThreadFixtures[0];
      const deletedAt = FIXED_NOW.toISOString();

      const updatedThread = applyDeletedSection({ thread, deletedAt });

      expect(updatedThread).toStrictEqual({
        ...thread,
        totalSections: thread.totalSections - 1,
        lastUpdated: deletedAt,
      });
    });

    it("does not mutate the input thread", () => {
      const thread = { ...mindThreadFixtures[0], totalSections: 3 };

      applyDeletedSection({
        thread,
        deletedAt: FIXED_NOW.toISOString(),
      });

      expect(thread.totalSections).toBe(3);
      expect(thread.lastUpdated).toBe(mindThreadFixtures[0].lastUpdated);
    });
  });

  describe("findThread", () => {
    it("returns the thread with the given id", () => {
      const expectedThread = mindThreadFixtures[1];

      const thread = findThread({
        threads: mindThreadFixtures,
        threadId: expectedThread.id,
      });

      expect(thread).toStrictEqual(expectedThread);
    });

    it("returns undefined when no thread has the given id", () => {
      const thread = findThread({
        threads: mindThreadFixtures,
        threadId: "unknown-thread",
      });

      expect(thread).toBeUndefined();
    });
  });

  describe("isMindThreadList", () => {
    it("returns true for a list of threads", () => {
      expect(isMindThreadList(mindThreadFixtures)).toBe(true);
    });

    it("returns true for an empty list", () => {
      expect(isMindThreadList([])).toBe(true);
    });

    it("returns false for an object", () => {
      expect(isMindThreadList({ id: "thread-1", title: "Thread" })).toBe(false);
    });

    it("returns false for a string", () => {
      expect(isMindThreadList("not-a-list")).toBe(false);
    });

    it("returns false when an item is missing its id", () => {
      const threadWithoutId = {
        title: "Thread without id",
        color: TEST_COLOR,
        totalSections: 0,
        totalPages: 0,
        lastUpdated: FIXED_NOW.toISOString(),
      };

      expect(isMindThreadList([...mindThreadFixtures, threadWithoutId])).toBe(
        false
      );
    });

    it.each(["color", "totalSections", "totalPages", "lastUpdated"] as const)(
      "returns false when an item is missing %s",
      (field) => {
        const incompleteThread = {
          ...mindThreadFixtures[0],
          [field]: undefined,
        };

        expect(isMindThreadList([incompleteThread])).toBe(false);
      }
    );
  });
});
