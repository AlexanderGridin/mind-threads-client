import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import {
  COMPOSER_PLACEHOLDER,
  COMPOSER_SHORTCUTS_PRIORITY,
} from "./MessageComposer.constants";
import { SHORTCUT_COMMANDS } from "./MessageComposer.commands";
import type {
  ComposerCommand,
  CreateComposerExtensionsParams,
} from "./MessageComposer.types";

const createComposerShortcuts = ({
  getCommandContext,
}: CreateComposerExtensionsParams) => {
  const runCommand = (command: ComposerCommand) => {
    const context = getCommandContext();

    if (!context) {
      return false;
    }

    command.execute(context);

    return true;
  };

  return Extension.create({
    name: "composerShortcuts",
    priority: COMPOSER_SHORTCUTS_PRIORITY,

    addKeyboardShortcuts() {
      return Object.fromEntries(
        SHORTCUT_COMMANDS.filter((command) => {
          return Boolean(command.shortcut);
        }).map((command) => {
          return [
            command.shortcut?.key,
            () => {
              return runCommand(command);
            },
          ];
        })
      );
    },
  });
};

export const createComposerExtensions = ({
  getCommandContext,
}: CreateComposerExtensionsParams) => {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      horizontalRule: false,
      code: false,
      link: {
        openOnClick: false,
        autolink: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      },
    }),
    Image.configure({ allowBase64: true }),
    Placeholder.configure({ placeholder: COMPOSER_PLACEHOLDER }),
    createComposerShortcuts({ getCommandContext }),
  ];
};
