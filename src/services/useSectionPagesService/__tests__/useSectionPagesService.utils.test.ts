import { describe, it, expect, afterEach, vi } from "vitest";
import { buildNewPage, sectionPageFixtures } from "@/__test-fixtures__";
import { buildPage, isSectionPageList } from "../useSectionPagesService.utils";

const TEST_THREAD_ID = "thread-1";
const TEST_SECTION_ID = "section-1";
const TEST_COLOR = "#A3BE8C";
const FIXED_NOW = new Date("2026-06-25T12:00:00Z");

const validPage = sectionPageFixtures[0];

describe("useSectionPagesService.utils", () => {
  describe("buildPage", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("trims the name and keeps the thread, section, type, and color", () => {
      const page = buildPage(buildNewPage({ name: "  Ideas  " }));

      expect(page.name).toBe("Ideas");
      expect(page.threadId).toBe(TEST_THREAD_ID);
      expect(page.sectionId).toBe(TEST_SECTION_ID);
      expect(page.type).toBe("chat");
      expect(page.color).toBe(TEST_COLOR);
    });

    it("sets createdAt to the current time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_NOW);

      const page = buildPage(buildNewPage());

      expect(page.createdAt).toBe(FIXED_NOW.toISOString());
    });

    it("returns a different id on every call", () => {
      const firstPage = buildPage(buildNewPage());
      const secondPage = buildPage(buildNewPage());

      expect(firstPage.id).not.toBe(secondPage.id);
    });
  });

  describe("isSectionPageList", () => {
    it("returns true for a list of valid pages", () => {
      const isValid = isSectionPageList(sectionPageFixtures);
      expect(isValid).toBe(true);
    });

    it("returns true for an empty list", () => {
      const isValid = isSectionPageList([]);
      expect(isValid).toBe(true);
    });

    it("returns false for a value that is not an array", () => {
      const isValid = isSectionPageList(validPage);
      expect(isValid).toBe(false);
    });

    it("returns false when an item is null", () => {
      const isValid = isSectionPageList([validPage, null]);
      expect(isValid).toBe(false);
    });

    it("returns false when the type is not a known page type", () => {
      const invalidPage = { ...validPage, type: "note" };
      const isValid = isSectionPageList([invalidPage]);

      expect(isValid).toBe(false);
    });

    it.each([
      ["id", { id: 1 }],
      ["threadId", { threadId: null }],
      ["sectionId", { sectionId: undefined }],
      ["name", { name: 42 }],
      ["color", { color: 123 }],
      ["createdAt", { createdAt: 0 }],
    ])(
      "returns false when %s is missing or has the wrong type",
      (_field, override) => {
        const invalidPage = { ...validPage, ...override };
        const isValid = isSectionPageList([invalidPage]);

        expect(isValid).toBe(false);
      }
    );
  });
});
