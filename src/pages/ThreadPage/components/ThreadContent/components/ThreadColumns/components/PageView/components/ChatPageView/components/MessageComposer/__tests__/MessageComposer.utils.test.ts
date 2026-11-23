import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  PNG_DATA_URL_PREFIX,
  PNG_FILE_NAME,
  createTestEditor,
  createTestFile,
  mockFileReaderError,
} from "@/__test-fixtures__";
import {
  getCommandTooltip,
  hasComposerContent,
  isImageFile,
  isValidHttpUrl,
  normalizeTag,
  readFileAsDataUrl,
} from "../MessageComposer.utils";
import { FILE_READ_ERROR_MESSAGE } from "../MessageComposer.constants";
import { boldCommand, strikethroughCommand } from "../MessageComposer.commands";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MessageComposer utils", () => {
  describe("normalizeTag", () => {
    it.each([
      { input: "  My Tag  ", expected: "my-tag" },
      { input: "a   b", expected: "a-b" },
      { input: "   ", expected: "" },
    ])("normalizes $input to $expected", ({ input, expected }) => {
      expect(normalizeTag(input)).toBe(expected);
    });
  });

  describe("isValidHttpUrl", () => {
    it.each(["http://example.com", "https://example.com/path?query=1"])(
      "accepts %s",
      (url) => {
        expect(isValidHttpUrl(url)).toBe(true);
      }
    );

    it.each(["", "example.com", "ftp://x.org", "javascript:alert(1)"])(
      "rejects %j",
      (url) => {
        expect(isValidHttpUrl(url)).toBe(false);
      }
    );
  });

  describe("isImageFile", () => {
    it("accepts an image file", () => {
      const file = createTestFile({ type: "image/png" });
      expect(isImageFile(file)).toBe(true);
    });

    it("rejects a non-image file", () => {
      const file = createTestFile({ type: "text/plain" });
      expect(isImageFile(file)).toBe(false);
    });

    it("rejects a file with no type", () => {
      const file = createTestFile({ type: "" });
      expect(isImageFile(file)).toBe(false);
    });
  });

  describe("readFileAsDataUrl", () => {
    it("resolves to a PNG data URL for a PNG file", async () => {
      const file = createTestFile({ type: "image/png", name: PNG_FILE_NAME });
      const dataUrl = await readFileAsDataUrl(file);

      expect(dataUrl).toMatch(new RegExp(`^${PNG_DATA_URL_PREFIX}`));
    });

    it("rejects when the reader fails", async () => {
      mockFileReaderError();

      const file = createTestFile({ type: "image/png", name: PNG_FILE_NAME });
      const readPromise = readFileAsDataUrl(file);

      await expect(readPromise).rejects.toThrow(FILE_READ_ERROR_MESSAGE);
    });
  });

  describe("hasComposerContent", () => {
    it.each([
      { name: "an empty editor", content: "" },
      { name: "an empty paragraph", content: "<p></p>" },
      { name: "a paragraph with only spaces", content: "<p>   </p>" },
    ])("is false for $name", ({ content }) => {
      const editor = createTestEditor(content);
      expect(hasComposerContent(editor)).toBe(false);
    });

    it("is true for text", () => {
      const editor = createTestEditor("<p>Hello</p>");
      expect(hasComposerContent(editor)).toBe(true);
    });

    it("is true for an image without text", () => {
      const editor = createTestEditor(
        `<img src="${PNG_DATA_URL_PREFIX}AAAA" alt="dot">`
      );

      expect(hasComposerContent(editor)).toBe(true);
    });

    it("is true for an empty code block", () => {
      const editor = createTestEditor("<pre><code></code></pre>");
      expect(hasComposerContent(editor)).toBe(true);
    });
  });

  describe("getCommandTooltip", () => {
    it("shows the label and the shortcut for a command with a shortcut", () => {
      expect(getCommandTooltip(boldCommand)).toBe("Bold (Ctrl+B)");
    });

    it("shows only the label for a command without a shortcut", () => {
      expect(getCommandTooltip(strikethroughCommand)).toBe("Strikethrough");
    });
  });
});
