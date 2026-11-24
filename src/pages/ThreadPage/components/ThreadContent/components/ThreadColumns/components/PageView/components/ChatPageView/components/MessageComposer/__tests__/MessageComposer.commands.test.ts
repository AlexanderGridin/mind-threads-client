import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import type { Editor } from "@tiptap/core";
import {
  createCommandContext,
  createTestEditor,
  destroyTestEditors,
  selectAllText,
} from "@/__test-fixtures__";
import {
  boldCommand,
  bulletListCommand,
  codeBlockCommand,
  createInsertImageCommand,
  createInsertLinkCommand,
  insertImageCommand,
  insertLinkCommand,
  italicCommand,
  numberedListCommand,
  sendCommand,
  strikethroughCommand,
  tagCommand,
  underlineCommand,
} from "../MessageComposer.commands";
import { CODE_BLOCK_PLACEHOLDER } from "../MessageComposer.constants";

const LINK_URL = "https://example.com";
const LINK_ATTRIBUTES = 'target="_blank" rel="noopener noreferrer"';
const IMAGE_SRC = "data:image/png;base64,AAAA";
const IMAGE_ALT = "dot.png";
// Inside "<ul><li><p>Item</p>...": ul opens at 0, li at 1, p at 2, text at 3.
const LIST_ITEM_TEXT_FROM = 3;
const LIST_ITEM_TEXT_TO = 7;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  destroyTestEditors();
  vi.restoreAllMocks();
});

const selectItemText = (editor: Editor) => {
  editor.commands.setTextSelection({
    from: LIST_ITEM_TEXT_FROM,
    to: LIST_ITEM_TEXT_TO,
  });
};

describe("MessageComposer commands", () => {
  describe("formatting commands", () => {
    it.each([
      { name: "bold", command: boldCommand, tag: "strong" },
      { name: "italic", command: italicCommand, tag: "em" },
      { name: "underline", command: underlineCommand, tag: "u" },
      { name: "strikethrough", command: strikethroughCommand, tag: "s" },
    ])(
      "wraps the selected text in $tag, and a second run removes it ($name)",
      ({ command, tag }) => {
        const editor = createTestEditor("<p>Hello</p>");
        const context = createCommandContext({ editor });
        const formattedHtml = `<p><${tag}>Hello</${tag}></p>`;
        const plainHtml = "<p>Hello</p>";

        selectAllText(editor);
        command.execute(context);

        expect(editor.getHTML()).toBe(formattedHtml);

        selectAllText(editor);
        command.execute(context);

        expect(editor.getHTML()).toBe(plainHtml);
      }
    );

    it("applies bold to text typed next when nothing is selected", () => {
      const editor = createTestEditor("");
      const context = createCommandContext({ editor });

      boldCommand.execute(context);
      editor.commands.insertContent("x");

      expect(editor.getHTML()).toBe("<p><strong>x</strong></p>");
    });
  });

  describe("list commands", () => {
    it("wraps the paragraph in a bullet list, and a second run unwraps it", () => {
      const editor = createTestEditor("<p>Item</p>");
      const context = createCommandContext({ editor });

      selectAllText(editor);
      bulletListCommand.execute(context);

      expect(editor.getHTML()).toBe("<ul><li><p>Item</p></li></ul><p></p>");

      selectItemText(editor);
      bulletListCommand.execute(context);

      expect(editor.getHTML()).toBe("<p>Item</p><p></p>");
    });

    it("wraps the paragraph in a numbered list, and a second run unwraps it", () => {
      const editor = createTestEditor("<p>Item</p>");
      const context = createCommandContext({ editor });

      selectAllText(editor);
      numberedListCommand.execute(context);

      expect(editor.getHTML()).toBe("<ol><li><p>Item</p></li></ol><p></p>");

      selectItemText(editor);
      numberedListCommand.execute(context);

      expect(editor.getHTML()).toBe("<p>Item</p><p></p>");
    });
  });

  describe("code block command", () => {
    it("inserts a code block with the placeholder text and an empty line below it", () => {
      const editor = createTestEditor("");
      const context = createCommandContext({ editor });

      codeBlockCommand.execute(context);

      expect(editor.getHTML()).toBe(
        `<pre><code>${CODE_BLOCK_PLACEHOLDER}</code></pre><p></p>`
      );
    });
  });

  describe("context-calling commands", () => {
    it.each([
      {
        name: "insert link",
        command: insertLinkCommand,
        action: "openLinkField",
      },
      {
        name: "insert image",
        command: insertImageCommand,
        action: "openImagePicker",
      },
      { name: "tag", command: tagCommand, action: "toggleTagField" },
      { name: "send", command: sendCommand, action: "send" },
    ] as const)("$name calls $action on the context", ({ command, action }) => {
      const editor = createTestEditor("");
      const context = createCommandContext({ editor });

      command.execute(context);
      expect(context[action]).toHaveBeenCalledOnce();
    });
  });

  describe("createInsertLinkCommand", () => {
    it("links the selected text", () => {
      const editor = createTestEditor("<p>Hello</p>");
      const context = createCommandContext({ editor });

      selectAllText(editor);
      createInsertLinkCommand(LINK_URL).execute(context);

      expect(editor.getHTML()).toBe(
        `<p><a ${LINK_ATTRIBUTES} href="${LINK_URL}">Hello</a></p>`
      );
    });

    it("inserts the URL as the link text when nothing is selected", () => {
      const editor = createTestEditor("");
      const context = createCommandContext({ editor });

      createInsertLinkCommand(LINK_URL).execute(context);

      expect(editor.getHTML()).toBe(
        `<p><a ${LINK_ATTRIBUTES} href="${LINK_URL}">${LINK_URL}</a></p>`
      );
    });
  });

  describe("createInsertImageCommand", () => {
    it("inserts an image with its src and alt, followed by an empty paragraph", () => {
      const editor = createTestEditor("");
      const context = createCommandContext({ editor });

      createInsertImageCommand({ src: IMAGE_SRC, alt: IMAGE_ALT }).execute(
        context
      );

      expect(editor.getHTML()).toBe(
        `<img src="${IMAGE_SRC}" alt="${IMAGE_ALT}"><p></p>`
      );
    });
  });
});
