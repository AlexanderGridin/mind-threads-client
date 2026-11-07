import { describe, it, expect } from "vitest";
import { getSectionCreatedMessage } from "../ThreadPageLoader.utils";

const SECTION_NAME = "Ideas";

describe("ThreadPageLoader utils", () => {
  describe("getSectionCreatedMessage", () => {
    it("returns the success message with the section name in quotes", () => {
      const message = getSectionCreatedMessage(SECTION_NAME);
      expect(message).toBe(`Section "${SECTION_NAME}" created.`);
    });
  });
});
