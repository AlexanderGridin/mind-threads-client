import { describe, it, expect } from "vitest";
import { getDeleteThreadModalText } from "../DeleteThreadModal.utils";

describe("getDeleteThreadModalText", () => {
  it("returns the confirmation text with the thread title in quotes", () => {
    const text = getDeleteThreadModalText("Testing Strategy");

    expect(text).toBe(
      `"Testing Strategy" and all its sections and pages will be permanently deleted. This can't be undone.`
    );
  });
});
