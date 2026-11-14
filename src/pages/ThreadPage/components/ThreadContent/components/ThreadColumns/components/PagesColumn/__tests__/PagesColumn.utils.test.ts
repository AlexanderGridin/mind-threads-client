import { describe, it, expect } from "vitest";
import {
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import { getSectionPages } from "../PagesColumn.utils";

const FIRST_SECTION_ID = threadSectionFixtures[0].id;
const EMPTY_SECTION_ID = "section-without-pages";

describe("PagesColumn utils", () => {
  describe("getSectionPages", () => {
    it("returns only the section's pages, in their original order", () => {
      const sectionPages = getSectionPages({
        pages: sectionPageFixtures,
        sectionId: FIRST_SECTION_ID,
      });

      const expectedPages = [sectionPageFixtures[0], sectionPageFixtures[1]];
      expect(sectionPages).toStrictEqual(expectedPages);
    });

    it("returns an empty list for a section with no pages", () => {
      const sectionPages = getSectionPages({
        pages: sectionPageFixtures,
        sectionId: EMPTY_SECTION_ID,
      });

      expect(sectionPages).toStrictEqual([]);
    });
  });
});
