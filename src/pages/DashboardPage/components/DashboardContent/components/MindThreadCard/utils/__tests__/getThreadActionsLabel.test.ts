import { describe, it, expect } from "vitest";
import { getThreadActionsLabel } from "../getThreadActionsLabel";

describe("getThreadActionsLabel", () => {
  it("returns the accessible label for the thread's actions button", () => {
    const label = getThreadActionsLabel("Testing Strategy");
    expect(label).toBe("Thread actions for Testing Strategy");
  });
});
