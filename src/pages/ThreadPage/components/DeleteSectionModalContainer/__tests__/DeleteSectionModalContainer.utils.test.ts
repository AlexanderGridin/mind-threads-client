import { describe, it, expect } from "vitest";
import { getDeleteSectionModalText } from "../DeleteSectionModalContainer.utils";

describe("DeleteSectionModalContainer utils", () => {
  describe("getDeleteSectionModalText", () => {
    it("returns the permanent deletion text with the section name in quotes", () => {
      const text = getDeleteSectionModalText("Research");

      expect(text).toBe(
        `"Research" and all its pages will be permanently deleted. This can't be undone.`
      );
    });
  });
});
