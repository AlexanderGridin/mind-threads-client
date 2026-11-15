import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useEditor, useEditorState } from "@tiptap/react";
import { notify } from "@/components/lib";
import styles from "./MessageComposer.module.css";
import {
  COMPOSER_EDITOR_LABEL,
  IMAGE_LOAD_ERROR_MESSAGE,
  INVALID_LINK_URL_MESSAGE,
  MessageComposerTestId,
  UNSUPPORTED_IMAGE_MESSAGE,
} from "./MessageComposer.constants";
import { createComposerExtensions } from "./MessageComposer.extensions";
import {
  hasComposerContent,
  isImageFile,
  isValidHttpUrl,
  normalizeTag,
  readFileAsDataUrl,
} from "./MessageComposer.utils";
import type {
  CreateComposerExtensionsParams,
  UseComposerSendParams,
  UseImageInsertionParams,
} from "./MessageComposer.types";
import type { ChangeEvent } from "react";
import type { Editor } from "@tiptap/core";

export const useComposerEditor = ({
  getCommandContext,
}: CreateComposerExtensionsParams) => {
  return useEditor({
    immediatelyRender: true,
    extensions: createComposerExtensions({ getCommandContext }),
    editorProps: {
      attributes: {
        class: styles.editor,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": COMPOSER_EDITOR_LABEL,
        "data-testid": MessageComposerTestId.editor,
      },
    },
  });
};

export const useHasComposerContent = (editor: Editor) => {
  return useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      return hasComposerContent(currentEditor);
    },
  });
};

export const useComposerTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTagFieldOpen, setIsTagFieldOpen] = useState(false);

  const toggleTagField = () => {
    setIsTagFieldOpen((isOpen) => {
      return !isOpen;
    });
  };

  const changeTagInput = (value: string) => {
    setTagInput(value);
  };

  const addTag = () => {
    const tag = normalizeTag(tagInput);

    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }

    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(
      tags.filter((tag) => {
        return tag !== tagToRemove;
      })
    );
  };

  const discardTagInput = () => {
    // Clear the text before the field unmounts, so the blur that follows
    // Escape sees an empty input and does not add it as a tag.
    flushSync(() => {
      setTagInput("");
    });

    setIsTagFieldOpen(false);
  };

  const resetTags = () => {
    setTags([]);
    setTagInput("");
    setIsTagFieldOpen(false);
  };

  const isTagRowShown = isTagFieldOpen || tags.length > 0;

  return {
    tags,
    tagInput,
    isTagFieldOpen,
    isTagRowShown,
    toggleTagField,
    changeTagInput,
    addTag,
    removeTag,
    discardTagInput,
    resetTags,
  };
};

export const useLinkField = () => {
  const [isLinkFieldOpen, setIsLinkFieldOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  const openLinkField = () => {
    setLinkUrl("");
    setLinkError("");
    setIsLinkFieldOpen(true);
  };

  const closeLinkField = () => {
    setIsLinkFieldOpen(false);
  };

  const changeLinkUrl = (value: string) => {
    setLinkUrl(value);
    setLinkError("");
  };

  const validateLinkUrl = () => {
    const url = linkUrl.trim();

    if (isValidHttpUrl(url)) {
      return url;
    }

    setLinkError(INVALID_LINK_URL_MESSAGE);

    return null;
  };

  return {
    isLinkFieldOpen,
    linkUrl,
    linkError,
    openLinkField,
    closeLinkField,
    changeLinkUrl,
    validateLinkUrl,
  };
};

export const useImageInsertion = ({ insertImage }: UseImageInsertionParams) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    // Reset the input so picking the same file again still fires a change.
    input.value = "";

    if (!file) {
      return;
    }

    if (!isImageFile(file)) {
      notify.error(UNSUPPORTED_IMAGE_MESSAGE);
      return;
    }

    try {
      const src = await readFileAsDataUrl(file);
      insertImage({ src, alt: file.name });
    } catch {
      notify.error(IMAGE_LOAD_ERROR_MESSAGE);
    }
  };

  return { imageInputRef, openImagePicker, handleImageChange };
};

export const useComposerSend = ({
  editor,
  tags,
  resetTags,
  onSend,
}: UseComposerSendParams) => {
  const send = () => {
    if (!hasComposerContent(editor)) {
      return;
    }

    onSend({ content: editor.getHTML(), tags });

    editor.chain().setMeta("addToHistory", false).clearContent().focus().run();

    resetTags();
  };

  return send;
};
