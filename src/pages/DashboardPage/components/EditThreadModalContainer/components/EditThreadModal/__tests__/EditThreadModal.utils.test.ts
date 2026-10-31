import { describe, it, expect } from "vitest";
import { mindThreadFixturesWithSameTitle } from "@/__test-fixtures__";
import { canSaveThreadChanges } from "../EditThreadModal.utils";

const THREAD = mindThreadFixturesWithSameTitle[0];
const OTHER_COLOR = "#FFAAA5";

describe("canSaveThreadChanges", () => {
  it("returns false when the title and color are unchanged", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: THREAD.title, color: THREAD.color },
    });

    expect(canSave).toBe(false);
  });

  it("returns true when the title changed", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: "QA Strategy", color: THREAD.color },
    });

    expect(canSave).toBe(true);
  });

  it("returns true when the color changed", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: THREAD.title, color: OTHER_COLOR },
    });

    expect(canSave).toBe(true);
  });

  it("returns false when only the letter case of the color differs", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: THREAD.title, color: THREAD.color.toLowerCase() },
    });

    expect(canSave).toBe(false);
  });

  it("returns false for an empty title, even when the color changed", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: "", color: OTHER_COLOR },
    });

    expect(canSave).toBe(false);
  });

  it("returns false for a title of only spaces, even when the color changed", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: "   ", color: OTHER_COLOR },
    });

    expect(canSave).toBe(false);
  });

  it("returns false when the saved title only has outer spaces added", () => {
    const canSave = canSaveThreadChanges({
      thread: THREAD,
      formValue: { title: `  ${THREAD.title}  `, color: THREAD.color },
    });

    expect(canSave).toBe(false);
  });
});
