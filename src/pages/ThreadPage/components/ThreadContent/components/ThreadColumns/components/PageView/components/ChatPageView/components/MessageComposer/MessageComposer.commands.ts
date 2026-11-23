import {
  LuBold,
  LuImage,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
  LuSquareCode,
  LuStrikethrough,
  LuTag,
  LuUnderline,
} from "react-icons/lu";
import { CODE_BLOCK_PLACEHOLDER } from "./MessageComposer.constants";
import type {
  ComposerAction,
  ComposerCommand,
  ComposerImage,
  ComposerToolbarCommand,
} from "./MessageComposer.types";

export const boldCommand: ComposerToolbarCommand = {
  id: "bold",
  label: "Bold",
  icon: LuBold,
  shortcut: { key: "Mod-b", label: "Ctrl+B" },
  execute: ({ editor }) => {
    editor.chain().focus().toggleBold().run();
  },
};

export const italicCommand: ComposerToolbarCommand = {
  id: "italic",
  label: "Italic",
  icon: LuItalic,
  shortcut: { key: "Mod-i", label: "Ctrl+I" },
  execute: ({ editor }) => {
    editor.chain().focus().toggleItalic().run();
  },
};

export const underlineCommand: ComposerToolbarCommand = {
  id: "underline",
  label: "Underline",
  icon: LuUnderline,
  shortcut: { key: "Mod-u", label: "Ctrl+U" },
  execute: ({ editor }) => {
    editor.chain().focus().toggleUnderline().run();
  },
};

export const strikethroughCommand: ComposerToolbarCommand = {
  id: "strikethrough",
  label: "Strikethrough",
  icon: LuStrikethrough,
  execute: ({ editor }) => {
    editor.chain().focus().toggleStrike().run();
  },
};

export const bulletListCommand: ComposerToolbarCommand = {
  id: "bullet-list",
  label: "Bullet list",
  icon: LuList,
  execute: ({ editor }) => {
    editor.chain().focus().toggleBulletList().run();
  },
};

export const numberedListCommand: ComposerToolbarCommand = {
  id: "numbered-list",
  label: "Numbered list",
  icon: LuListOrdered,
  execute: ({ editor }) => {
    editor.chain().focus().toggleOrderedList().run();
  },
};

export const insertLinkCommand: ComposerToolbarCommand = {
  id: "insert-link",
  label: "Insert link",
  icon: LuLink,
  execute: ({ openLinkField }) => {
    openLinkField();
  },
};

export const codeBlockCommand: ComposerToolbarCommand = {
  id: "code-block",
  label: "Code block",
  icon: LuSquareCode,
  execute: ({ editor }) => {
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "codeBlock",
          content: [{ type: "text", text: CODE_BLOCK_PLACEHOLDER }],
        },
        { type: "paragraph" },
      ])
      .run();
  },
};

export const insertImageCommand: ComposerToolbarCommand = {
  id: "insert-image",
  label: "Insert image",
  icon: LuImage,
  execute: ({ openImagePicker }) => {
    openImagePicker();
  },
};

export const tagCommand: ComposerToolbarCommand = {
  id: "tag",
  label: "Tag",
  icon: LuTag,
  execute: ({ toggleTagField }) => {
    toggleTagField();
  },
};

export const sendCommand: ComposerCommand = {
  id: "send",
  label: "Send",
  shortcut: { key: "Mod-Enter", label: "Ctrl+Enter" },
  execute: ({ send }) => {
    send();
  },
};

export const createInsertLinkCommand = (url: string): ComposerAction => {
  return {
    execute: ({ editor }) => {
      if (editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: url,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();

        return;
      }

      editor.chain().focus().setLink({ href: url }).run();
    },
  };
};

export const createInsertImageCommand = (
  image: ComposerImage
): ComposerAction => {
  return {
    execute: ({ editor }) => {
      editor
        .chain()
        .focus()
        .insertContent([{ type: "image", attrs: image }, { type: "paragraph" }])
        .run();
    },
  };
};

export const FORMATTING_COMMANDS = [
  boldCommand,
  italicCommand,
  underlineCommand,
  strikethroughCommand,
];

export const STRUCTURE_COMMANDS = [
  bulletListCommand,
  numberedListCommand,
  insertLinkCommand,
  codeBlockCommand,
  insertImageCommand,
];

export const SHORTCUT_COMMANDS: ComposerCommand[] = [
  boldCommand,
  italicCommand,
  underlineCommand,
  sendCommand,
];
