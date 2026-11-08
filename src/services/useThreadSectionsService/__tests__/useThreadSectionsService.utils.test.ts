import { describe, it, expect, afterEach, vi } from "vitest";
import { threadSectionFixtures } from "@/__test-fixtures__";
import {
  buildSection,
  isThreadSectionList,
} from "../useThreadSectionsService.utils";

const TEST_THREAD_ID = "thread-1";
const TEST_COLOR = "#A3BE8C";
const FIXED_NOW = new Date("2026-06-20T12:00:00Z");

const validSection = threadSectionFixtures[0];

describe("useThreadSectionsService.utils", () => {
  describe("buildSection", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("trims the name and keeps the threadId and color", () => {
      const section = buildSection({
        threadId: TEST_THREAD_ID,
        name: "  Ideas  ",
        color: TEST_COLOR,
      });

      expect(section.name).toBe("Ideas");
      expect(section.threadId).toBe(TEST_THREAD_ID);
      expect(section.color).toBe(TEST_COLOR);
    });

    it("sets createdAt to the current time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const section = buildSection({
        threadId: TEST_THREAD_ID,
        name: "Ideas",
        color: TEST_COLOR,
      });

      expect(section.createdAt).toBe(FIXED_NOW.toISOString());
    });

    it("returns a different id on every call", () => {
      const firstSection = buildSection({
        threadId: TEST_THREAD_ID,
        name: "Ideas",
        color: TEST_COLOR,
      });

      const secondSection = buildSection({
        threadId: TEST_THREAD_ID,
        name: "Ideas",
        color: TEST_COLOR,
      });

      expect(firstSection.id).not.toBe(secondSection.id);
    });
  });

  describe("isThreadSectionList", () => {
    it("returns true for a list of valid sections", () => {
      const isValid = isThreadSectionList(threadSectionFixtures);
      expect(isValid).toBe(true);
    });

    it("returns true for an empty list", () => {
      const isValid = isThreadSectionList([]);
      expect(isValid).toBe(true);
    });

    it("returns false for a value that is not an array", () => {
      const isValid = isThreadSectionList(validSection);
      expect(isValid).toBe(false);
    });

    it("returns false when an item is null", () => {
      const isValid = isThreadSectionList([validSection, null]);
      expect(isValid).toBe(false);
    });

    it.each([
      ["id", { id: 1 }],
      ["threadId", { threadId: null }],
      ["name", { name: undefined }],
      ["color", { color: 123 }],
      ["createdAt", { createdAt: 0 }],
    ])(
      "returns false when %s is missing or has the wrong type",
      (_field, override) => {
        const invalidSection = { ...validSection, ...override };
        const isValid = isThreadSectionList([invalidSection]);

        expect(isValid).toBe(false);
      }
    );
  });
});
