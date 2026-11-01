import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MALFORMED_JSON,
  mindThreadFixture,
  mindThreadFixtures,
  mindThreadFixturesWithSingleItem,
  seedThreads,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";
import { useThreadsService } from "../useThreadsService";
import {
  INVALID_THREADS_DATA_ERROR,
  THREAD_NOT_FOUND_ERROR,
  THREADS_STORAGE_KEY,
} from "../useThreadsService.constants";

const TEST_COLOR = "#A8E6CF";
const FIXED_NOW = new Date("2026-06-20T12:00:00Z");

const setup = () => {
  return renderHook(() => useThreadsService());
};

const readStoredThreads = (): MindThread[] => {
  return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
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
  });
});
