import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MALFORMED_JSON,
  mindThreadFixtures,
  seedThreads,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";
import { useThreadsService } from "../useThreadsService";
import {
  INVALID_THREADS_DATA_ERROR,
  THREADS_STORAGE_KEY,
} from "../useThreadsService.constants";

const TEST_COLOR = "#A8E6CF";

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
});
