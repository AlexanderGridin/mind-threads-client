import { describe, it, expect } from "vitest";
import {
  getPageCreatedMessage,
  getSectionCreatedMessage,
  getSectionDeletedMessage,
} from "../ThreadPageLoader.utils";

const SECTION_NAME = "Ideas";
const PAGE_NAME = "Ideas";

describe("ThreadPageLoader utils", () => {
  describe("getSectionCreatedMessage", () => {
    it("returns the success message with the section name in quotes", () => {
      const message = getSectionCreatedMessage(SECTION_NAME);
      expect(message).toBe(`Section "${SECTION_NAME}" created.`);
    });
  });

  describe("getSectionDeletedMessage", () => {
    it("returns the success message with the section name in quotes", () => {
      const message = getSectionDeletedMessage("Research");
      expect(message).toBe('Section "Research" deleted.');
    });
  });

  describe("getPageCreatedMessage", () => {
    it("returns the success message with the page name in quotes", () => {
      const message = getPageCreatedMessage(PAGE_NAME);
      expect(message).toBe(`Page "${PAGE_NAME}" created.`);
    });
  });
});
