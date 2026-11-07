import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
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
});
