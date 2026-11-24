import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { Editor } from "@tiptap/core";
import {
  createCommandContext,
  createTestEditor,
  destroyTestEditors,
  selectAllText,
} from "@/__test-fixtures__";
import { createComposerExtensions } from "../MessageComposer.extensions";
import type { ComposerCommandContext } from "../MessageComposer.types";

const IMAGE_SRC = "data:image/png;base64,AAAA";

type CreateShortcutEditorParams = {
  content?: string;
  hasContext?: boolean;
};

const createShortcutEditor = ({
  content = "<p>Hello</p>",
  hasContext = true,
}: CreateShortcutEditorParams = {}) => {
  let commandContext: ComposerCommandContext | null = null;

  const editor = new Editor({
    extensions: createComposerExtensions({
      getCommandContext: () => {
        return commandContext;
      },
    }),
    content,
  });

  const context = hasContext ? createCommandContext({ editor }) : null;
  commandContext = context;

  return { editor, context };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  destroyTestEditors();
  vi.restoreAllMocks();
});

describe("MessageComposer extensions", () => {
  describe("formatting shortcuts", () => {
    it.each([
      { shortcut: "Mod-b", tag: "strong" },
      { shortcut: "Mod-i", tag: "em" },
      { shortcut: "Mod-u", tag: "u" },
    ])(
      "$shortcut applies the matching mark to the selected text",
      ({ shortcut, tag }) => {
        const { editor } = createShortcutEditor();

        selectAllText(editor);
        editor.commands.keyboardShortcut(shortcut);

        expect(editor.getHTML()).toBe(`<p><${tag}>Hello</${tag}></p>`);
      }
    );
  });

  describe("Mod-Enter", () => {
    it("calls send on the context and does not insert a line break", () => {
      const { editor, context } = createShortcutEditor();

      editor.commands.keyboardShortcut("Mod-Enter");

      expect(context?.send).toHaveBeenCalledOnce();
      expect(editor.getHTML()).toBe("<p>Hello</p>");
    });

    it("does not throw when there is no command context", () => {
      const { editor } = createShortcutEditor({ hasContext: false });

      expect(() => {
        editor.commands.keyboardShortcut("Mod-Enter");
      }).not.toThrow();
    });
  });

  describe("StarterKit configuration", () => {
    it("turns a heading into a paragraph", () => {
      const editor = createTestEditor();

      editor.commands.setContent("<h1>x</h1>");
      expect(editor.getHTML()).toBe("<p>x</p>");
    });

    it("keeps a base64 image when the content is set", () => {
      const editor = createTestEditor();

      editor.commands.setContent(`<img src="${IMAGE_SRC}" alt="dot">`);
      expect(editor.getHTML()).toContain(`src="${IMAGE_SRC}"`);
    });
  });
});
