import type { Editor } from "@tiptap/core";
import {
  ALLOWED_LINK_PROTOCOLS,
  CONTENT_NODE_TYPES,
  FILE_READ_ABORTED_MESSAGE,
  FILE_READ_ERROR_MESSAGE,
  FILE_READ_INVALID_RESULT_MESSAGE,
  IMAGE_MIME_PREFIX,
} from "./MessageComposer.constants";
import type { ComposerCommand } from "./MessageComposer.types";

export const normalizeTag = (value: string) => {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
};

export const isValidHttpUrl = (value: string) => {
  if (!URL.canParse(value)) {
    return false;
  }

  return ALLOWED_LINK_PROTOCOLS.includes(new URL(value).protocol);
};

export const isImageFile = (file: File) => {
  return file.type.startsWith(IMAGE_MIME_PREFIX);
};

export const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);

        return;
      }

      reject(new Error(FILE_READ_INVALID_RESULT_MESSAGE));
    });

    reader.addEventListener("error", () => {
      reject(new Error(FILE_READ_ERROR_MESSAGE));
    });

    reader.addEventListener("abort", () => {
      reject(new Error(FILE_READ_ABORTED_MESSAGE));
    });

    reader.readAsDataURL(file);
  });
};

export const hasComposerContent = (editor: Editor) => {
  const { doc } = editor.state;

  if (doc.textContent.trim()) {
    return true;
  }

  let hasContentNode = false;

  doc.descendants((node) => {
    if (CONTENT_NODE_TYPES.includes(node.type.name)) {
      hasContentNode = true;
    }

    return !hasContentNode;
  });

  return hasContentNode;
};

export const getCommandTooltip = (command: ComposerCommand) => {
  if (command.shortcut) {
    return `${command.label} (${command.shortcut.label})`;
  }

  return command.label;
};
