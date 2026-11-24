import type { Editor } from "@tiptap/core";
import type { IconType } from "react-icons";

export type ComposerCommandContext = {
  editor: Editor;
  openLinkField: () => void;
  openImagePicker: () => void;
  toggleTagField: () => void;
  send: () => Promise<void>;
};

export type ComposerAction = {
  execute: (context: ComposerCommandContext) => void;
};

export type ComposerShortcut = {
  key: string; // Tiptap key name, e.g. "Mod-b"
  label: string; // shown in tooltips, e.g. "Ctrl+B"
};

export type ComposerCommand = ComposerAction & {
  id: string;
  label: string;
  shortcut?: ComposerShortcut;
};

export type ComposerToolbarCommand = ComposerCommand & {
  icon: IconType;
};

export type ComposerMessage = {
  content: string;
  tags: string[];
};

export type ComposerImage = {
  src: string;
  alt: string;
};

export type CreateComposerExtensionsParams = {
  getCommandContext: () => ComposerCommandContext | null;
};

export type UseImageInsertionParams = {
  insertImage: (image: ComposerImage) => void;
};

export type UseComposerSendParams = {
  editor: Editor;
  tags: string[];
  resetTags: () => void;
  onSend: (message: ComposerMessage) => Promise<boolean>;
};
