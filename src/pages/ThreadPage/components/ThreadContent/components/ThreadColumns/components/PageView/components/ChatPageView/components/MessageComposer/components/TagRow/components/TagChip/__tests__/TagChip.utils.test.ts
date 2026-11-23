import { describe, it, expect } from "vitest";
import { getRemoveTagLabel } from "../TagChip.utils";

describe("TagChip utils", () => {
  describe("getRemoveTagLabel", () => {
    it("names the remove button after the tag", () => {
      expect(getRemoveTagLabel("ideas")).toBe("Remove tag ideas");
    });
  });
});
