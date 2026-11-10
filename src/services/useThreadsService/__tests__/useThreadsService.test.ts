import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MALFORMED_JSON,
  mindThreadFixture,
  mindThreadFixtures,
  mindThreadFixturesWithSingleItem,
  seedThreads,
} from "@/__test-fixtures__";
import { seedSections, threadSectionFixtures } from "@/__test-fixtures__";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import type { MindThread, ThreadSection } from "@/types";
import { useThreadsService } from "../useThreadsService";
import {
  INVALID_THREADS_DATA_ERROR,
  THREAD_NOT_FOUND_ERROR,
  THREADS_STORAGE_KEY,
} from "../useThreadsService.constants";

const TEST_COLOR = "#A8E6CF";
const FIXED_NOW = new Date("2026-06-20T12:00:00Z");
const LATER_NOW = new Date("2026-06-21T09:30:00Z");

const setup = () => {
  return renderHook(() => useThreadsService());
};

const readStoredThreads = (): MindThread[] => {
  return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
};

const readStoredSections = (): ThreadSection[] => {
  return JSON.parse(localStorage.getItem(SECTIONS_STORAGE_KEY) ?? "[]");
};

const buildNewSection = (threadId: string) => {
  return { threadId, name: "  Ideas  ", color: TEST_COLOR };
};

describe("useThreadsService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getThreads", () => {
    it("resolves an empty list when nothing is stored", async () => {
      const { result } = setup();

      await expect(result.current.getThreads()).resolves.toStrictEqual([]);
    });

    it("resolves the stored threads in stored order", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      await expect(result.current.getThreads()).resolves.toStrictEqual(
        mindThreadFixtures
      );
    });

    it("rejects when the stored value is malformed JSON", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = setup();

      localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

      await expect(result.current.getThreads()).rejects.toThrow(SyntaxError);
    });

    it("rejects when the stored value is not a list of threads", async () => {
      const { result } = setup();

      localStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify({ id: "thread-1" })
      );

      await expect(result.current.getThreads()).rejects.toThrow(
        INVALID_THREADS_DATA_ERROR
      );
    });

    it("rejects when localStorage.getItem fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

      const { result } = setup();

      await expect(result.current.getThreads()).rejects.toThrow(
        "Storage unavailable"
      );
    });
  });

  describe("getThread", () => {
    it("resolves the stored thread with the given id", async () => {
      const { result } = setup();
      const expectedThread = mindThreadFixtures[1];

      seedThreads(mindThreadFixtures);

      const thread = await result.current.getThread(expectedThread.id);
      expect(thread).toStrictEqual(expectedThread);
    });

    it("resolves null for an unknown id", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      const thread = await result.current.getThread("unknown-thread-id");
      expect(thread).toBeNull();
    });

    it("resolves null when nothing is stored", async () => {
      const { result } = setup();

      const thread = await result.current.getThread("thread-1");
      expect(thread).toBeNull();
    });

    it("rejects when the stored value is malformed JSON", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = setup();

      localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

      await expect(result.current.getThread("thread-1")).rejects.toThrow(
        SyntaxError
      );
    });

    it("rejects when the stored value is not a list of threads", async () => {
      const { result } = setup();

      localStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify({ id: "thread-1" })
      );

      await expect(result.current.getThread("thread-1")).rejects.toThrow(
        INVALID_THREADS_DATA_ERROR
      );
    });
  });

  describe("createThread", () => {
    it("resolves the created thread with a trimmed title and zero counts", async () => {
      const { result } = setup();

      const createdThread = await result.current.createThread({
        title: "  New thread  ",
        color: TEST_COLOR,
      });

      expect(createdThread).toMatchObject({
        title: "New thread",
        color: TEST_COLOR,
        totalSections: 0,
        totalPages: 0,
      });

      expect(createdThread.id).toEqual(expect.any(String));
    });

    it("prepends the created thread to the stored threads", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      const createdThread = await result.current.createThread({
        title: "New thread",
        color: TEST_COLOR,
      });

      expect(readStoredThreads()).toStrictEqual([
        createdThread,
        ...mindThreadFixtures,
      ]);
    });

    it("stores two threads with the same title as two items, newest first", async () => {
      const { result } = setup();

      const firstThread = await result.current.createThread({
        title: "Testing Strategy",
        color: TEST_COLOR,
      });
      const secondThread = await result.current.createThread({
        title: "Testing Strategy",
        color: TEST_COLOR,
      });

      const storedThreads = readStoredThreads();

      expect(firstThread.id).not.toBe(secondThread.id);
      expect(storedThreads.map((thread) => thread.id)).toStrictEqual([
        secondThread.id,
        firstThread.id,
      ]);
    });

    it("rejects when localStorage.setItem fails and leaves the storage unchanged", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(
        result.current.createThread({ title: "New thread", color: TEST_COLOR })
      ).rejects.toThrow("Storage quota exceeded");

      expect(readStoredThreads()).toStrictEqual(mindThreadFixtures);
    });
  });

  describe("updateThread", () => {
    const threadsToUpdate: MindThread[] = [
      mindThreadFixtures[0],
      mindThreadFixtures[1],
      mindThreadFixture,
    ];

    const threadToUpdate = threadsToUpdate[1];

    const threadUpdate = {
      id: threadToUpdate.id,
      title: "  QA Strategy  ",
      color: TEST_COLOR,
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resolves the updated thread and stores all threads in order with only that thread changed", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const { result } = setup();

      seedThreads(threadsToUpdate);

      const updatedThread = await result.current.updateThread(threadUpdate);

      const expectedThread = {
        ...threadToUpdate,
        title: "QA Strategy",
        color: TEST_COLOR,
        lastUpdated: FIXED_NOW.toISOString(),
      };

      expect(updatedThread).toStrictEqual(expectedThread);

      expect(readStoredThreads()).toStrictEqual([
        threadsToUpdate[0],
        expectedThread,
        threadsToUpdate[2],
      ]);
    });

    it("rejects with the not-found error for an unknown id and leaves the storage unchanged", async () => {
      const { result } = setup();

      seedThreads(threadsToUpdate);

      await expect(
        result.current.updateThread({
          ...threadUpdate,
          id: "unknown-thread-id",
        })
      ).rejects.toThrow(THREAD_NOT_FOUND_ERROR);

      expect(readStoredThreads()).toStrictEqual(threadsToUpdate);
    });

    it("rejects when localStorage.setItem fails and leaves the storage unchanged", async () => {
      const { result } = setup();

      seedThreads(threadsToUpdate);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(result.current.updateThread(threadUpdate)).rejects.toThrow(
        "Storage quota exceeded"
      );

      expect(readStoredThreads()).toStrictEqual(threadsToUpdate);
    });

    it("rejects when the stored value is not a list of threads", async () => {
      const { result } = setup();

      localStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify({ id: "thread-1" })
      );

      await expect(result.current.updateThread(threadUpdate)).rejects.toThrow(
        INVALID_THREADS_DATA_ERROR
      );
    });
  });

  describe("addThreadSection", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("stores the trimmed section in the sections key and returns it", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      const createdSection = await result.current.addThreadSection(
        buildNewSection(mindThreadFixtures[0].id)
      );

      const expectedSections = [createdSection];

      expect(createdSection.name).toBe("Ideas");
      expect(readStoredSections()).toStrictEqual(expectedSections);
    });

    it("sets the thread's totalSections to 1, then 2, and its lastUpdated to each section's createdAt", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const { result } = setup();
      const emptyThread = { ...mindThreadFixtures[0], totalSections: 0 };

      seedThreads([emptyThread]);

      await result.current.addThreadSection(buildNewSection(emptyThread.id));

      const threadAfterFirstSection = readStoredThreads()[0];

      expect(threadAfterFirstSection.totalSections).toBe(1);
      expect(threadAfterFirstSection.lastUpdated).toBe(FIXED_NOW.toISOString());

      vi.setSystemTime(LATER_NOW);

      await result.current.addThreadSection(buildNewSection(emptyThread.id));

      const threadAfterSecondSection = readStoredThreads()[0];

      expect(threadAfterSecondSection.totalSections).toBe(2);

      expect(threadAfterSecondSection.lastUpdated).toBe(
        LATER_NOW.toISOString()
      );
    });

    it("leaves the other threads unchanged", async () => {
      const { result } = setup();
      const emptyThread = { ...mindThreadFixtures[0], totalSections: 0 };

      seedThreads([emptyThread, mindThreadFixtures[1]]);

      await result.current.addThreadSection(buildNewSection(emptyThread.id));

      expect(readStoredThreads()[1]).toStrictEqual(mindThreadFixtures[1]);
    });

    it("rejects with the not-found error for an unknown threadId and stores no section", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      await expect(
        result.current.addThreadSection(buildNewSection("unknown-thread"))
      ).rejects.toThrow(THREAD_NOT_FOUND_ERROR);

      expect(readStoredSections()).toStrictEqual([]);
    });

    it("rejects with the not-found error when another tab removed the thread after it was read", async () => {
      const { result } = setup();
      const removedThread = mindThreadFixtures[0];

      seedThreads(mindThreadFixtures);
      await result.current.getThreads();

      seedThreads([mindThreadFixtures[1]]);

      window.dispatchEvent(
        new StorageEvent("storage", { key: THREADS_STORAGE_KEY })
      );

      await expect(
        result.current.addThreadSection(buildNewSection(removedThread.id))
      ).rejects.toThrow(THREAD_NOT_FOUND_ERROR);

      expect(readStoredSections()).toStrictEqual([]);
    });
  });

  describe("removeThreadSection", () => {
    const threadWithSections = { ...mindThreadFixtures[0], totalSections: 2 };
    const removedSectionId = threadSectionFixtures[0].id;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("removes the section, drops totalSections by one, sets lastUpdated to the deletion time, and leaves other threads unchanged", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(LATER_NOW);

      const { result } = setup();

      seedThreads([threadWithSections, mindThreadFixtures[1]]);
      seedSections(threadSectionFixtures);

      await result.current.removeThreadSection({
        threadId: threadWithSections.id,
        sectionId: removedSectionId,
      });

      const expectedThread = {
        ...threadWithSections,
        totalSections: 1,
        lastUpdated: LATER_NOW.toISOString(),
      };

      expect(readStoredThreads()).toStrictEqual([
        expectedThread,
        mindThreadFixtures[1],
      ]);

      expect(readStoredSections()).toStrictEqual(
        threadSectionFixtures.slice(1)
      );
    });

    it("leaves the stored thread strictly equal to before when the section is no longer in storage", async () => {
      const { result } = setup();

      seedThreads([threadWithSections]);
      seedSections(threadSectionFixtures.slice(1));

      await result.current.removeThreadSection({
        threadId: threadWithSections.id,
        sectionId: removedSectionId,
      });

      expect(readStoredThreads()).toStrictEqual([threadWithSections]);
    });

    it("removes the section and leaves the threads untouched when the thread was deleted elsewhere", async () => {
      const { result } = setup();

      const storedThreads = [mindThreadFixtures[1]];

      seedThreads(storedThreads);
      seedSections(threadSectionFixtures);

      await result.current.removeThreadSection({
        threadId: threadWithSections.id,
        sectionId: removedSectionId,
      });

      expect(readStoredThreads()).toStrictEqual(storedThreads);

      expect(readStoredSections()).toStrictEqual(
        threadSectionFixtures.slice(1)
      );
    });

    it("resolves and writes nothing when the section is already gone and the thread was deleted elsewhere", async () => {
      const { result } = setup();

      seedThreads([mindThreadFixtures[1]]);
      seedSections(threadSectionFixtures.slice(2));

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      await result.current.removeThreadSection({
        threadId: threadWithSections.id,
        sectionId: removedSectionId,
      });

      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it("rejects and leaves sections and threads unchanged when the localStorage write fails", async () => {
      const { result } = setup();

      seedThreads([threadWithSections]);
      seedSections(threadSectionFixtures);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(
        result.current.removeThreadSection({
          threadId: threadWithSections.id,
          sectionId: removedSectionId,
        })
      ).rejects.toThrow("Storage quota exceeded");

      expect(readStoredThreads()).toStrictEqual([threadWithSections]);
      expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
    });

    it("rejects and does not remove the section when the stored threads data is invalid", async () => {
      const { result } = setup();

      seedSections(threadSectionFixtures);
      localStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify({ id: "thread-1" })
      );

      await expect(
        result.current.removeThreadSection({
          threadId: threadWithSections.id,
          sectionId: removedSectionId,
        })
      ).rejects.toThrow(INVALID_THREADS_DATA_ERROR);

      expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
    });
  });

  describe("deleteThread", () => {
    const threadsToDelete: MindThread[] = [
      mindThreadFixtures[0],
      mindThreadFixtures[1],
      mindThreadFixture,
    ];

    it("removes only the thread with the given id and keeps the rest in stored order", async () => {
      const { result } = setup();

      seedThreads(threadsToDelete);

      await result.current.deleteThread(mindThreadFixtures[1].id);

      expect(readStoredThreads()).toStrictEqual([
        mindThreadFixtures[0],
        mindThreadFixture,
      ]);
    });

    it("resolves and leaves the storage unchanged for an unknown id", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      await result.current.deleteThread("unknown-thread-id");

      expect(readStoredThreads()).toStrictEqual(mindThreadFixtures);
    });

    it("resolves with an empty stored list when the only thread is deleted", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixturesWithSingleItem);

      await result.current.deleteThread(mindThreadFixture.id);

      expect(readStoredThreads()).toStrictEqual([]);
    });

    it("rejects when localStorage.setItem fails and leaves the storage unchanged", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(
        result.current.deleteThread(mindThreadFixtures[0].id)
      ).rejects.toThrow("Storage quota exceeded");

      expect(readStoredThreads()).toStrictEqual(mindThreadFixtures);
    });

    it("rejects when the stored value is not a list of threads", async () => {
      const { result } = setup();

      localStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify({ id: "thread-1" })
      );

      await expect(
        result.current.deleteThread(mindThreadFixtures[0].id)
      ).rejects.toThrow(INVALID_THREADS_DATA_ERROR);
    });

    it("removes the thread's sections from the sections key and keeps the other sections", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      await result.current.deleteThread(mindThreadFixtures[0].id);

      const expectedSections = threadSectionFixtures.filter((section) => {
        return section.threadId === mindThreadFixtures[1].id;
      });

      expect(readStoredSections()).toStrictEqual(expectedSections);
    });

    it("rejects and leaves the threads unchanged when the stored sections are malformed", async () => {
      const { result } = setup();

      seedThreads(mindThreadFixtures);
      localStorage.setItem(SECTIONS_STORAGE_KEY, MALFORMED_JSON);

      await expect(
        result.current.deleteThread(mindThreadFixtures[0].id)
      ).rejects.toThrow(SyntaxError);

      expect(readStoredThreads()).toStrictEqual(mindThreadFixtures);
    });
  });
});
