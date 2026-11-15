import { describe, it, expect } from "vitest";
import { getDeletePageModalText } from "../DeletePageModalContainer.utils";

describe("DeletePageModalContainer utils", () => {
  describe("getDeletePageModalText", () => {
    it("returns the permanent deletion text with the page name in quotes", () => {
      const text = getDeletePageModalText("Brainstorm");

      expect(text).toBe(
        `"Brainstorm" will be permanently deleted. This can't be undone.`
      );
    });
  });
});
