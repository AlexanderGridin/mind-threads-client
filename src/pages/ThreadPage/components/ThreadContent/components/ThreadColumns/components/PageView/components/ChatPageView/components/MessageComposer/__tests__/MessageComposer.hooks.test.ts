import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useComposerTags, useLinkField } from "../MessageComposer.hooks";
import { INVALID_LINK_URL_MESSAGE } from "../MessageComposer.constants";

const VALID_URL = "  https://example.com  ";
const TRIMMED_VALID_URL = "https://example.com";
const INVALID_URL = "example.com";

const setupTagsHook = () => {
  return renderHook(() => {
    return useComposerTags();
  });
};

type TagsHookResult = ReturnType<typeof setupTagsHook>["result"];

type AddTagWithInputParams = {
  result: TagsHookResult;
  tag: string;
};

const addTagWithInput = ({ result, tag }: AddTagWithInputParams) => {
  act(() => {
    result.current.changeTagInput(tag);
  });

  act(() => {
    result.current.addTag();
  });
};

const setupLinkFieldHook = () => {
  return renderHook(() => {
    return useLinkField();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MessageComposer hooks", () => {
  describe("useComposerTags", () => {
    it("toggles the tag field open and closed", () => {
      const { result } = setupTagsHook();

      expect(result.current.isTagFieldOpen).toBe(false);

      act(() => {
        result.current.toggleTagField();
      });

      expect(result.current.isTagFieldOpen).toBe(true);

      act(() => {
        result.current.toggleTagField();
      });

      expect(result.current.isTagFieldOpen).toBe(false);
    });

    it("shows the tag row only when the field is open or at least one tag exists", () => {
      const { result } = setupTagsHook();

      expect(result.current.isTagRowShown).toBe(false);

      act(() => {
        result.current.toggleTagField();
      });

      expect(result.current.isTagRowShown).toBe(true);

      addTagWithInput({ result, tag: "ideas" });

      act(() => {
        result.current.toggleTagField();
      });

      expect(result.current.isTagFieldOpen).toBe(false);
      expect(result.current.isTagRowShown).toBe(true);
    });

    it("normalizes the input, appends it as a tag, and clears the input", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "  My Tag  " });

      expect(result.current.tags).toStrictEqual(["my-tag"]);
      expect(result.current.tagInput).toBe("");
    });

    it("ignores an empty tag and clears the input without a message", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "   " });

      expect(result.current.tags).toStrictEqual([]);
      expect(result.current.tagInput).toBe("");
    });

    it("ignores a duplicate tag", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "ideas" });

      addTagWithInput({ result, tag: "Ideas" });

      expect(result.current.tags).toStrictEqual(["ideas"]);
    });

    it("removes only the given tag", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "ideas" });

      addTagWithInput({ result, tag: "todo" });

      act(() => {
        result.current.removeTag("ideas");
      });

      expect(result.current.tags).toStrictEqual(["todo"]);
    });

    it("discards the input, closes the field, and keeps the tags", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "ideas" });

      act(() => {
        result.current.toggleTagField();
        result.current.changeTagInput("draft");
      });

      act(() => {
        result.current.discardTagInput();
      });

      expect(result.current.tagInput).toBe("");
      expect(result.current.isTagFieldOpen).toBe(false);
      expect(result.current.tags).toStrictEqual(["ideas"]);
    });

    it("resets the tags, the input, and the field", () => {
      const { result } = setupTagsHook();

      addTagWithInput({ result, tag: "ideas" });

      act(() => {
        result.current.toggleTagField();
        result.current.changeTagInput("draft");
      });

      act(() => {
        result.current.resetTags();
      });

      expect(result.current.tags).toStrictEqual([]);
      expect(result.current.tagInput).toBe("");
      expect(result.current.isTagFieldOpen).toBe(false);
    });
  });

  describe("useLinkField", () => {
    it("opens with an empty URL and no error", () => {
      const { result } = setupLinkFieldHook();

      expect(result.current.isLinkFieldOpen).toBe(false);

      act(() => {
        result.current.openLinkField();
      });

      expect(result.current.isLinkFieldOpen).toBe(true);
      expect(result.current.linkUrl).toBe("");
      expect(result.current.linkError).toBe("");
    });

    it("returns the trimmed URL when it is valid", () => {
      const { result } = setupLinkFieldHook();

      act(() => {
        result.current.openLinkField();
        result.current.changeLinkUrl(VALID_URL);
      });

      let returnedUrl: string | null = null;

      act(() => {
        returnedUrl = result.current.validateLinkUrl();
      });

      expect(returnedUrl).toBe(TRIMMED_VALID_URL);
      expect(result.current.linkError).toBe("");
    });

    it.each([
      { name: "an empty URL", url: "" },
      { name: "a URL without a protocol", url: INVALID_URL },
    ])("returns null and sets the error for $name", ({ url }) => {
      const { result } = setupLinkFieldHook();

      act(() => {
        result.current.openLinkField();
        result.current.changeLinkUrl(url);
      });

      let returnedUrl: string | null = "unset";

      act(() => {
        returnedUrl = result.current.validateLinkUrl();
      });

      expect(returnedUrl).toBeNull();
      expect(result.current.linkError).toBe(INVALID_LINK_URL_MESSAGE);
    });

    it("clears the error when the URL changes", () => {
      const { result } = setupLinkFieldHook();

      act(() => {
        result.current.openLinkField();
        result.current.changeLinkUrl(INVALID_URL);
      });

      act(() => {
        result.current.validateLinkUrl();
      });

      act(() => {
        result.current.changeLinkUrl("https://example.org");
      });

      expect(result.current.linkError).toBe("");
    });

    it("closes the field", () => {
      const { result } = setupLinkFieldHook();

      act(() => {
        result.current.openLinkField();
      });

      act(() => {
        result.current.closeLinkField();
      });

      expect(result.current.isLinkFieldOpen).toBe(false);
    });
  });
});
