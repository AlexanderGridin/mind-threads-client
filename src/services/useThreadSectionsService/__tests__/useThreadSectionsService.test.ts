import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  dispatchStorageChange,
  MALFORMED_JSON,
  mindThreadFixtures,
  seedSections,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { NewThreadSection, ThreadSection } from "@/types";
import { useThreadSectionsService } from "../useThreadSectionsService";
import {
  INVALID_SECTIONS_DATA_ERROR,
  SECTIONS_STORAGE_KEY,
} from "../useThreadSectionsService.constants";

const TEST_COLOR = "#A3BE8C";
const TEST_SECTION_NAME = "Ideas";

const FIRST_THREAD_ID = mindThreadFixtures[0].id;
const SECOND_THREAD_ID = mindThreadFixtures[1].id;

const setupHook = () => {
  return renderHook(() => useThreadSectionsService());
};

const readStoredSections = (): ThreadSection[] => {
  return JSON.parse(localStorage.getItem(SECTIONS_STORAGE_KEY) ?? "[]");
};

const buildNewSection = (
  overrides: Partial<NewThreadSection> = {}
): NewThreadSection => {
  return {
    threadId: FIRST_THREAD_ID,
    name: TEST_SECTION_NAME,
    color: TEST_COLOR,
    ...overrides,
  };
};

describe("useThreadSectionsService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getThreadSections", () => {
    it("resolves an empty list when nothing is stored", async () => {
      const { result } = setupHook();

      const expectedSections: ThreadSection[] = [];
      const sections = await result.current.getThreadSections(FIRST_THREAD_ID);

      expect(sections).toStrictEqual(expectedSections);
    });

    it("resolves only the given thread's sections, in stored order", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      const expectedSections = [
        threadSectionFixtures[0],
        threadSectionFixtures[1],
      ];

      const sections = await result.current.getThreadSections(FIRST_THREAD_ID);
      expect(sections).toStrictEqual(expectedSections);
    });

    it("rejects when the stored value is malformed JSON", async () => {
      const { result } = setupHook();

      localStorage.setItem(SECTIONS_STORAGE_KEY, MALFORMED_JSON);

      await expect(
        result.current.getThreadSections(FIRST_THREAD_ID)
      ).rejects.toThrow(SyntaxError);
    });

    it("rejects when the stored value is not a list of sections", async () => {
      const { result } = setupHook();

      localStorage.setItem(
        SECTIONS_STORAGE_KEY,
        JSON.stringify([{ id: "section-1" }])
      );

      await expect(
        result.current.getThreadSections(FIRST_THREAD_ID)
      ).rejects.toThrow(INVALID_SECTIONS_DATA_ERROR);
    });
  });

  describe("createThreadSection", () => {
    it("appends the trimmed section after the existing ones and returns it", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      const createdSection = await result.current.createThreadSection(
        buildNewSection({ name: "  Ideas  " })
      );

      const expectedSections = [...threadSectionFixtures, createdSection];

      expect(createdSection.name).toBe(TEST_SECTION_NAME);
      expect(readStoredSections()).toStrictEqual(expectedSections);
    });

    it("stores two sections with the same name side by side", async () => {
      const { result } = setupHook();

      const firstSection =
        await result.current.createThreadSection(buildNewSection());

      const secondSection =
        await result.current.createThreadSection(buildNewSection());

      const expectedSections = [firstSection, secondSection];
      expect(readStoredSections()).toStrictEqual(expectedSections);
    });
  });

  describe("deleteThreadSections", () => {
    it("removes the given thread's sections and keeps the others", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      await result.current.deleteThreadSections(FIRST_THREAD_ID);

      const expectedSections = threadSectionFixtures.filter((section) => {
        return section.threadId === SECOND_THREAD_ID;
      });

      expect(readStoredSections()).toStrictEqual(expectedSections);
    });
  });

  describe("deleteSection", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("removes only the section with the given id, resolves true, and keeps the rest in order", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      const isDeleted = await result.current.deleteSection("section-2");

      const expectedSections = [
        threadSectionFixtures[0],
        threadSectionFixtures[2],
      ];

      expect(isDeleted).toBe(true);
      expect(readStoredSections()).toStrictEqual(expectedSections);
    });

    it("removes only the targeted section when two sections have the same name", async () => {
      const { result } = setupHook();

      const firstSection = {
        ...threadSectionFixtures[0],
        id: "section-a",
      };

      const secondSection = {
        ...threadSectionFixtures[0],
        id: "section-b",
      };

      seedSections([firstSection, secondSection]);

      await result.current.deleteSection("section-b");

      expect(readStoredSections()).toStrictEqual([firstSection]);
    });

    it("resolves false and does not write when the id is unknown", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      const isDeleted = await result.current.deleteSection("unknown-id");

      expect(isDeleted).toBe(false);
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it("resolves false when another tab already removed the section", async () => {
      const { result } = setupHook();

      seedSections(threadSectionFixtures);

      await result.current.getThreadSections(FIRST_THREAD_ID);

      const sectionsWithoutTarget = threadSectionFixtures.filter((section) => {
        return section.id !== "section-2";
      });

      seedSections(sectionsWithoutTarget);
      dispatchStorageChange(SECTIONS_STORAGE_KEY);

      const isDeleted = await result.current.deleteSection("section-2");

      expect(isDeleted).toBe(false);
      expect(readStoredSections()).toStrictEqual(sectionsWithoutTarget);
    });

    it("rejects and writes nothing when the stored data is invalid", async () => {
      const { result } = setupHook();

      const invalidData = JSON.stringify([{ id: "section-1" }]);
      localStorage.setItem(SECTIONS_STORAGE_KEY, invalidData);

      await expect(result.current.deleteSection("section-1")).rejects.toThrow(
        INVALID_SECTIONS_DATA_ERROR
      );

      expect(localStorage.getItem(SECTIONS_STORAGE_KEY)).toBe(invalidData);
    });
  });
});
