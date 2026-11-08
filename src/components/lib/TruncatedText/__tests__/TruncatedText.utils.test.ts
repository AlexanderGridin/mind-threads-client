import { describe, it, expect, afterEach, vi } from "vitest";
import { stubTextOverflow } from "../../__test-fixtures__";
import { isTextTruncated } from "../TruncatedText.utils";

describe("TruncatedText.utils", () => {
  describe("isTextTruncated", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns false when there is no element", () => {
      const isTruncated = isTextTruncated(null);
      expect(isTruncated).toBe(false);
    });

    it("returns true when the content is wider than the element", () => {
      stubTextOverflow({ isOverflowing: true });

      const element = document.createElement("p");
      const isTruncated = isTextTruncated(element);

      expect(isTruncated).toBe(true);
    });

    it("returns false when the content fits the element", () => {
      stubTextOverflow({ isOverflowing: false });

      const element = document.createElement("p");
      const isTruncated = isTextTruncated(element);

      expect(isTruncated).toBe(false);
    });
  });
});
