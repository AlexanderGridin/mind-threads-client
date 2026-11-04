import { describe, it, expect } from "vitest";
import { getThreadPath } from "../routing.utils";

describe("getThreadPath", () => {
  it("returns the thread path for a thread id", () => {
    const threadPath = getThreadPath("test-thread");
    expect(threadPath).toBe("/threads/test-thread");
  });

  it("encodes a thread id that contains a reserved character", () => {
    const threadPath = getThreadPath("a/b");
    expect(threadPath).toBe("/threads/a%2Fb");
  });
});
