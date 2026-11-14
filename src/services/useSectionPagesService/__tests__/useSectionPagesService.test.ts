import { describe, it, expect, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  buildNewPage,
  MALFORMED_JSON,
  mindThreadFixtures,
  readStoredPages,
  seedPages,
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { SectionPage } from "@/types";
import { useSectionPagesService } from "../useSectionPagesService";
import {
  INVALID_PAGES_DATA_ERROR,
  PAGES_STORAGE_KEY,
} from "../useSectionPagesService.constants";

const TEST_PAGE_NAME = "Ideas";
const EMPTY_SECTION_ID = "section-without-pages";

const FIRST_THREAD_ID = mindThreadFixtures[0].id;
const FIRST_SECTION_ID = threadSectionFixtures[0].id;

const setupHook = () => {
  return renderHook(() => useSectionPagesService());
};

describe("useSectionPagesService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getThreadPages", () => {
    it("resolves an empty list when nothing is stored", async () => {
      const { result } = setupHook();

      const expectedPages: SectionPage[] = [];
      const pages = await result.current.getThreadPages(FIRST_THREAD_ID);

      expect(pages).toStrictEqual(expectedPages);
    });

    it("resolves only the given thread's pages, in stored order", async () => {
      const { result } = setupHook();

      seedPages(sectionPageFixtures);

      const expectedPages = [
        sectionPageFixtures[0],
        sectionPageFixtures[1],
        sectionPageFixtures[2],
      ];

      const pages = await result.current.getThreadPages(FIRST_THREAD_ID);

      expect(pages).toStrictEqual(expectedPages);
    });

    it("rejects when the stored value is malformed JSON", async () => {
      const { result } = setupHook();

      localStorage.setItem(PAGES_STORAGE_KEY, MALFORMED_JSON);

      await expect(
        result.current.getThreadPages(FIRST_THREAD_ID)
      ).rejects.toThrow(SyntaxError);
    });

    it("rejects when the stored value is not a list of pages", async () => {
      const { result } = setupHook();

      localStorage.setItem(
        PAGES_STORAGE_KEY,
        JSON.stringify([{ id: "page-1" }])
      );

      await expect(
        result.current.getThreadPages(FIRST_THREAD_ID)
      ).rejects.toThrow(INVALID_PAGES_DATA_ERROR);
    });
  });

  describe("createSectionPage", () => {
    it("appends the trimmed page after the existing ones and returns it", async () => {
      const { result } = setupHook();

      seedPages(sectionPageFixtures);

      const createdPage = await result.current.createSectionPage(
        buildNewPage({ name: "  Ideas  " })
      );

      const expectedPages = [...sectionPageFixtures, createdPage];

      expect(createdPage.name).toBe(TEST_PAGE_NAME);
      expect(readStoredPages()).toStrictEqual(expectedPages);
    });

    it("stores two pages with the same name side by side", async () => {
      const { result } = setupHook();

      const firstPage = await result.current.createSectionPage(buildNewPage());
      const secondPage = await result.current.createSectionPage(buildNewPage());

      const expectedPages = [firstPage, secondPage];

      expect(readStoredPages()).toStrictEqual(expectedPages);
    });
  });

  describe("deleteSectionPages", () => {
    it("removes only the section's pages, resolves their count, and keeps the rest in order", async () => {
      const { result } = setupHook();

      seedPages(sectionPageFixtures);

      const deletedPageCount =
        await result.current.deleteSectionPages(FIRST_SECTION_ID);

      const expectedPages = [sectionPageFixtures[2], sectionPageFixtures[3]];

      expect(deletedPageCount).toBe(2);
      expect(readStoredPages()).toStrictEqual(expectedPages);
    });

    it("resolves 0 and writes nothing when the section has no pages", async () => {
      const { result } = setupHook();

      seedPages(sectionPageFixtures);

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      const deletedPageCount =
        await result.current.deleteSectionPages(EMPTY_SECTION_ID);

      expect(deletedPageCount).toBe(0);
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe("deleteThreadPages", () => {
    it("removes only the given thread's pages", async () => {
      const { result } = setupHook();

      seedPages(sectionPageFixtures);

      await result.current.deleteThreadPages(FIRST_THREAD_ID);

      const expectedPages = [sectionPageFixtures[3]];

      expect(readStoredPages()).toStrictEqual(expectedPages);
    });

    it("keeps every page when the thread has no pages", async () => {
      const { result } = setupHook();

      const pagesOfSecondThread = [sectionPageFixtures[3]];
      seedPages(pagesOfSecondThread);

      await result.current.deleteThreadPages(FIRST_THREAD_ID);

      expect(readStoredPages()).toStrictEqual(pagesOfSecondThread);
    });
  });
});
