import { describe, it, expect } from "vitest";
import { formatCount } from "../formatCount";

const SECTION_NOUNS = { singular: "section", plural: "sections" };

describe("formatCount", () => {
  it("uses the plural noun for zero", () => {
    const text = formatCount({ count: 0, ...SECTION_NOUNS });
    expect(text).toBe("0 sections");
  });

  it("uses the singular noun for one", () => {
    const text = formatCount({ count: 1, ...SECTION_NOUNS });
    expect(text).toBe("1 section");
  });

  it("uses the plural noun for two", () => {
    const text = formatCount({ count: 2, ...SECTION_NOUNS });
    expect(text).toBe("2 sections");
  });
});
