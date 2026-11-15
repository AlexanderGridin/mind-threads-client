import { describe, it, expect } from "vitest";
import { getPageActionsLabel } from "../PageCardActions.utils";

describe("PageCardActions utils", () => {
  describe("getPageActionsLabel", () => {
    it("returns the accessible label with the page name", () => {
      const label = getPageActionsLabel("Brainstorm");
      expect(label).toBe("Page actions for Brainstorm");
    });
  });
});
