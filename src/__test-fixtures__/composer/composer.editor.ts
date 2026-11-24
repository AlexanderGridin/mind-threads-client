import { vi } from "vitest";
import { Editor } from "@tiptap/core";
import { createComposerExtensions } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.extensions";
import type { ComposerCommandContext } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.types";

type CreateCommandContextParams = Partial<ComposerCommandContext> & {
  editor: Editor;
};

const createdTestEditors: Editor[] = [];

export const createTestEditor = (content = "") => {
  const editor = new Editor({
    extensions: createComposerExtensions({
      getCommandContext: () => {
        return null;
      },
    }),
    content,
  });

  createdTestEditors.push(editor);

  return editor;
};

export const destroyTestEditors = () => {
  createdTestEditors.splice(0).forEach((editor) => {
    editor.destroy();
  });
};

export const createCommandContext = ({
  editor,
  ...overrides
}: CreateCommandContextParams): ComposerCommandContext => {
  return {
    editor,
    openLinkField: vi.fn(),
    openImagePicker: vi.fn(),
    toggleTagField: vi.fn(),
    send: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
};

export const selectAllText = (editor: Editor) => {
  editor.commands.selectAll();
};
