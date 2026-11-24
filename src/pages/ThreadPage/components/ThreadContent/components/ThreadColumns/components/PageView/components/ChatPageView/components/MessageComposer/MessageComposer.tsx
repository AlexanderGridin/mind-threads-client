import { useEffect, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { Box } from "@/components/lib";
import {
  createInsertImageCommand,
  createInsertLinkCommand,
  sendCommand,
} from "./MessageComposer.commands";
import {
  COMPOSER_EDITOR_MAX_HEIGHT,
  IMAGE_FILE_ACCEPT,
  MessageComposerTestId,
} from "./MessageComposer.constants";
import {
  useComposerEditor,
  useComposerSend,
  useComposerTags,
  useHasComposerContent,
  useImageInsertion,
  useLinkField,
} from "./MessageComposer.hooks";
import type {
  ComposerAction,
  ComposerCommandContext,
  ComposerImage,
  ComposerMessage,
} from "./MessageComposer.types";
import {
  ComposerFooter,
  ComposerToolbar,
  LinkField,
  TagRow,
} from "./components";

type MessageComposerProps = {
  onSend: (message: ComposerMessage) => Promise<boolean>;
};

export const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const commandContextRef = useRef<ComposerCommandContext | null>(null);

  const getCommandContext = () => {
    return commandContextRef.current;
  };

  const handleInsertImage = (image: ComposerImage) => {
    const context = getCommandContext();

    if (context) {
      createInsertImageCommand(image).execute(context);
    }
  };

  const editor = useComposerEditor({ getCommandContext });
  const tagsState = useComposerTags();
  const linkField = useLinkField();
  const hasContent = useHasComposerContent(editor);

  const { imageInputRef, openImagePicker, handleImageChange } =
    useImageInsertion({ insertImage: handleInsertImage });

  const send = useComposerSend({
    editor,
    tags: tagsState.tags,
    resetTags: tagsState.resetTags,
    onSend,
  });

  const commandContext: ComposerCommandContext = {
    editor,
    openLinkField: linkField.openLinkField,
    openImagePicker,
    toggleTagField: tagsState.toggleTagField,
    send,
  };

  const runCommand = (command: ComposerAction) => {
    command.execute(commandContext);
  };

  useEffect(() => {
    commandContextRef.current = commandContext;
  });

  const handleConfirmLink = () => {
    const url = linkField.validateLinkUrl();

    if (url) {
      linkField.closeLinkField();
      runCommand(createInsertLinkCommand(url));
    }
  };

  const handleCancelLink = () => {
    linkField.closeLinkField();
    editor.commands.focus();
  };

  const handleDiscardTagInput = () => {
    tagsState.discardTagInput();
    editor.commands.focus();
  };

  const handleSend = () => {
    runCommand(sendCommand);
  };

  return (
    <Box
      data-testid={MessageComposerTestId.container}
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      backgroundColor="bg"
    >
      <ComposerToolbar
        isTagActive={tagsState.isTagRowShown}
        onCommand={runCommand}
      />

      {linkField.isLinkFieldOpen ? (
        <LinkField
          url={linkField.linkUrl}
          error={linkField.linkError}
          onChange={linkField.changeLinkUrl}
          onConfirm={handleConfirmLink}
          onCancel={handleCancelLink}
        />
      ) : null}

      {tagsState.isTagRowShown ? (
        <TagRow
          tags={tagsState.tags}
          tagInput={tagsState.tagInput}
          isTagFieldOpen={tagsState.isTagFieldOpen}
          onTagInputChange={tagsState.changeTagInput}
          onAddTag={tagsState.addTag}
          onDiscardTagInput={handleDiscardTagInput}
          onRemoveTag={tagsState.removeTag}
        />
      ) : null}

      <Box
        data-testid={MessageComposerTestId.editorArea}
        maxHeight={COMPOSER_EDITOR_MAX_HEIGHT}
        overflowY="auto"
      >
        <EditorContent editor={editor} />
      </Box>

      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        hidden
        data-testid={MessageComposerTestId.imageInput}
        onChange={handleImageChange}
      />

      <ComposerFooter canSend={hasContent} onSend={handleSend} />
    </Box>
  );
};
