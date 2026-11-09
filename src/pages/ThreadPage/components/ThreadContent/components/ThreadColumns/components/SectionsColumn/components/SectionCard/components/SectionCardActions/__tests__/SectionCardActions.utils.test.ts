import { describe, it, expect } from "vitest";
import { getSectionActionsLabel } from "../SectionCardActions.utils";

describe("SectionCardActions utils", () => {
  describe("getSectionActionsLabel", () => {
    it("returns the accessible label with the section name", () => {
      const label = getSectionActionsLabel("Research");
      expect(label).toBe("Section actions for Research");
    });
  });
});
