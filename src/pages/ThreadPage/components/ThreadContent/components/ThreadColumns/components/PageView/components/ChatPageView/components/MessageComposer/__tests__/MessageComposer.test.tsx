import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addComposerTag,
  PNG_DATA_URL_PREFIX,
  PNG_FILE_NAME,
  createPngFile,
  createTextFile,
  getComposerEditor,
  getSendButton,
  getToolbarButton,
  mockFileReaderError,
  pickComposerFile,
  selectAllInComposer,
  typeInComposer,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  boldCommand,
  bulletListCommand,
  codeBlockCommand,
  insertImageCommand,
  insertLinkCommand,
  italicCommand,
  numberedListCommand,
  strikethroughCommand,
  tagCommand,
  underlineCommand,
} from "../MessageComposer.commands";
import {
  CODE_BLOCK_PLACEHOLDER,
  COMPOSER_PLACEHOLDER,
  IMAGE_LOAD_ERROR_MESSAGE,
  INVALID_LINK_URL_MESSAGE,
  MessageComposerTestId,
  UNSUPPORTED_IMAGE_MESSAGE,
} from "../MessageComposer.constants";
import { MessageComposer } from "../MessageComposer";
import {
  CANCEL_LINK_LABEL,
  LINK_URL_LABEL,
} from "../components/LinkField/LinkField.constants";
import { TAG_INPUT_LABEL } from "../components/TagRow/TagRow.constants";
import { TagChipTestId } from "../components/TagRow/components/TagChip/TagChip.constants";

const LINK_URL = "https://example.com";
const TAG = "ideas";

type SetupParams = {
  applyAccept?: boolean;
};

const setup = ({ applyAccept = true }: SetupParams = {}) => {
  const user = userEvent.setup({ applyAccept });
  const onSend = vi.fn();

  renderWithUIProvider(<MessageComposer onSend={onSend} />);

  return { user, onSend };
};

const getEditorElement = (selector: string) => {
  return getComposerEditor().querySelector(selector);
};

const getTagInput = () => {
  return screen.getByRole("textbox", { name: TAG_INPUT_LABEL });
};

const queryTagInput = () => {
  return screen.queryByRole("textbox", { name: TAG_INPUT_LABEL });
};

const getLinkUrlInput = () => {
  return screen.getByRole("textbox", { name: LINK_URL_LABEL });
};

const queryLinkUrlInput = () => {
  return screen.queryByRole("textbox", { name: LINK_URL_LABEL });
};

const getChipNames = () => {
  return screen.queryAllByTestId(TagChipTestId.name).map((chipName) => {
    return chipName.textContent;
  });
};

// Tiptap moves focus into the editor inside requestAnimationFrame, so the
// check has to wait for that frame. This is the only way to observe it.
const expectEditorFocused = async () => {
  await waitFor(() => {
    const editor = getComposerEditor();
    expect(editor).toHaveFocus();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MessageComposer", () => {
  describe("placeholder", () => {
    it("shows the placeholder on the empty first paragraph", () => {
      setup();

      const emptyParagraph = getEditorElement("p.is-editor-empty");

      expect(emptyParagraph).toHaveAttribute(
        "data-placeholder",
        COMPOSER_PLACEHOLDER
      );
    });
  });

  describe("formatting toolbar", () => {
    it.each([
      { command: boldCommand, tag: "strong" },
      { command: italicCommand, tag: "em" },
      { command: underlineCommand, tag: "u" },
      { command: strikethroughCommand, tag: "s" },
    ])(
      "applies and removes $command.label on the selected text",
      async ({ command, tag }) => {
        const { user } = setup();

        await typeInComposer({ user, text: "Hello" });
        await selectAllInComposer(user);

        const formatButton = getToolbarButton(command.label);
        await user.click(formatButton);

        const formattedText = getEditorElement(tag);
        expect(formattedText).toBeInTheDocument();

        await selectAllInComposer(user);
        await user.click(formatButton);

        const plainText = getEditorElement(tag);
        expect(plainText).not.toBeInTheDocument();
      }
    );

    it.each([
      { name: "Ctrl+B", shortcut: "{Control>}b{/Control}", tag: "strong" },
      { name: "Ctrl+I", shortcut: "{Control>}i{/Control}", tag: "em" },
      { name: "Ctrl+U", shortcut: "{Control>}u{/Control}", tag: "u" },
    ])("applies the matching mark with $name", async ({ shortcut, tag }) => {
      const { user } = setup();

      await typeInComposer({ user, text: "Hello" });
      await selectAllInComposer(user);
      await user.keyboard(shortcut);

      const markedText = getEditorElement(tag);
      expect(markedText).toBeInTheDocument();
    });

    it("keeps the focus in the editor and continues typing in bold after a toolbar click", async () => {
      const { user } = setup();

      await typeInComposer({ user, text: "Hello" });

      const boldButton = getToolbarButton(boldCommand.label);
      await user.click(boldButton);

      await expectEditorFocused();

      await user.keyboard("x");

      const boldText = getEditorElement("strong");
      expect(boldText?.textContent).toBe("x");
    });
  });

  describe("lists and code", () => {
    it("toggles a bullet list", async () => {
      const { user } = setup();

      await typeInComposer({ user, text: "Item" });

      const listButton = getToolbarButton(bulletListCommand.label);
      await user.click(listButton);

      const bulletItem = getEditorElement("ul > li");
      expect(bulletItem).toBeInTheDocument();

      await user.click(listButton);

      const bulletList = getEditorElement("ul");
      expect(bulletList).not.toBeInTheDocument();
    });

    it("toggles a numbered list", async () => {
      const { user } = setup();

      await typeInComposer({ user, text: "Item" });

      const listButton = getToolbarButton(numberedListCommand.label);
      await user.click(listButton);

      const numberedItem = getEditorElement("ol > li");
      expect(numberedItem).toBeInTheDocument();

      await user.click(listButton);

      const numberedList = getEditorElement("ol");
      expect(numberedList).not.toBeInTheDocument();
    });

    it("inserts a code block with the placeholder and an empty line below it", async () => {
      const { user } = setup();

      const codeButton = getToolbarButton(codeBlockCommand.label);
      await user.click(codeButton);

      const codeBlock = getEditorElement("pre");
      expect(codeBlock?.textContent).toBe(CODE_BLOCK_PLACEHOLDER);
      expect(codeBlock?.nextElementSibling?.textContent).toBe("");
    });
  });

  describe("editor area", () => {
    it("limits the editor height and scrolls vertically", () => {
      setup();

      const editorArea = screen.getByTestId(MessageComposerTestId.editorArea);
      expect(editorArea).toHaveStyle({ maxHeight: "16rem", overflowY: "auto" });
    });
  });

  describe("links", () => {
    it("opens a focused URL field when Insert link is clicked", async () => {
      const { user } = setup();

      const linkButton = getToolbarButton(insertLinkCommand.label);
      await user.click(linkButton);

      const linkUrlInput = getLinkUrlInput();
      expect(linkUrlInput).toHaveFocus();
    });

    it("inserts a link with the URL as its text and closes the field on Enter", async () => {
      const { user } = setup();

      const linkButton = getToolbarButton(insertLinkCommand.label);
      await user.click(linkButton);

      const linkUrlInput = getLinkUrlInput();
      await user.type(linkUrlInput, `${LINK_URL}{Enter}`);

      const link = getEditorElement("a");
      expect(link).toHaveAttribute("href", LINK_URL);
      expect(link?.textContent).toBe(LINK_URL);

      const closedLinkUrlInput = queryLinkUrlInput();
      expect(closedLinkUrlInput).not.toBeInTheDocument();
    });

    it("turns the selected text into the link text", async () => {
      const { user } = setup();

      await typeInComposer({ user, text: "Docs" });
      await selectAllInComposer(user);

      const linkButton = getToolbarButton(insertLinkCommand.label);
      await user.click(linkButton);

      const linkUrlInput = getLinkUrlInput();
      await user.type(linkUrlInput, `${LINK_URL}{Enter}`);

      const link = getEditorElement("a");
      expect(link).toHaveAttribute("href", LINK_URL);
      expect(link?.textContent).toBe("Docs");
    });

    it.each([
      { name: "an empty URL", url: "" },
      { name: "a URL without a protocol", url: "example.com" },
    ])(
      "shows the invalid URL message and keeps the field open for $name",
      async ({ url }) => {
        const { user } = setup();

        const linkButton = getToolbarButton(insertLinkCommand.label);
        await user.click(linkButton);

        const linkUrlInput = getLinkUrlInput();
        await user.type(linkUrlInput, `${url}{Enter}`);

        const errorMessage = screen.getByText(INVALID_LINK_URL_MESSAGE);
        expect(errorMessage).toBeInTheDocument();

        const link = getEditorElement("a");
        expect(link).not.toBeInTheDocument();
        const openLinkUrlInput = getLinkUrlInput();
        expect(openLinkUrlInput).toBeInTheDocument();
      }
    );

    it("closes the field when Cancel is clicked", async () => {
      const { user } = setup();

      const linkButton = getToolbarButton(insertLinkCommand.label);
      await user.click(linkButton);

      const cancelButton = screen.getByRole("button", {
        name: CANCEL_LINK_LABEL,
      });

      await user.click(cancelButton);

      const closedLinkUrlInput = queryLinkUrlInput();
      expect(closedLinkUrlInput).not.toBeInTheDocument();
    });
  });

  describe("images", () => {
    it("opens the file picker limited to images", async () => {
      const { user } = setup();

      const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

      const imageButton = getToolbarButton(insertImageCommand.label);
      await user.click(imageButton);

      expect(clickSpy).toHaveBeenCalled();

      const imageInput = screen.getByTestId(MessageComposerTestId.imageInput);
      expect(imageInput).toHaveAttribute("accept", "image/*");
    });

    it("inserts a picked image, followed by an empty line", async () => {
      const { user } = setup();

      await pickComposerFile({ user, file: createPngFile() });

      const insertedImage = await screen.findByAltText(PNG_FILE_NAME);
      expect(insertedImage.getAttribute("src")).toMatch(
        new RegExp(`^${PNG_DATA_URL_PREFIX}`)
      );

      const lineBelowImage = insertedImage.nextElementSibling;
      expect(lineBelowImage?.textContent).toBe("");
    });

    it("shows an error and inserts nothing for a non-image file", async () => {
      const { user } = setup({ applyAccept: false });

      await pickComposerFile({ user, file: createTextFile() });

      const notification = await screen.findByText(UNSUPPORTED_IMAGE_MESSAGE);
      expect(notification).toBeInTheDocument();

      const image = getEditorElement("img");
      expect(image).not.toBeInTheDocument();
    });

    it("shows an error and inserts nothing when the image cannot be read", async () => {
      mockFileReaderError();

      const { user } = setup();

      await pickComposerFile({ user, file: createPngFile() });

      const notification = await screen.findByText(IMAGE_LOAD_ERROR_MESSAGE);
      expect(notification).toBeInTheDocument();

      const image = getEditorElement("img");
      expect(image).not.toBeInTheDocument();
    });
  });

  describe("tags", () => {
    it("toggles the tag field with the Tag button", async () => {
      const { user } = setup();

      const tagButton = getToolbarButton(tagCommand.label);
      await user.click(tagButton);

      const openTagInput = getTagInput();
      expect(openTagInput).toBeInTheDocument();

      await user.click(tagButton);

      const closedTagInput = queryTagInput();
      expect(closedTagInput).not.toBeInTheDocument();
    });

    it("adds a normalized tag chip on Enter and clears the field", async () => {
      const { user } = setup();

      await addComposerTag({ user, tag: "My Tag" });

      expect(getChipNames()).toStrictEqual(["my-tag"]);
      const tagInput = getTagInput();
      expect(tagInput).toHaveValue("");
    });

    it("adds a tag chip on comma", async () => {
      const { user } = setup();

      await addComposerTag({ user, tag: "two" });

      const tagInput = getTagInput();
      await user.type(tagInput, "three,");

      expect(getChipNames()).toStrictEqual(["two", "three"]);
    });

    it("adds the typed text as a tag when the field loses focus", async () => {
      const { user } = setup();

      const tagButton = getToolbarButton(tagCommand.label);
      await user.click(tagButton);

      const tagInput = getTagInput();
      await user.type(tagInput, "draft");
      await user.tab();

      expect(getChipNames()).toStrictEqual(["draft"]);
    });

    it("closes the field on Escape, discards its text, and keeps the chips", async () => {
      const { user } = setup();

      await addComposerTag({ user, tag: TAG });

      const tagInput = getTagInput();
      await user.type(tagInput, "draft");
      await user.keyboard("{Escape}");

      const closedTagInput = queryTagInput();
      expect(closedTagInput).not.toBeInTheDocument();
      expect(getChipNames()).toStrictEqual([TAG]);

      const tagButton = getToolbarButton(tagCommand.label);
      await user.click(tagButton);

      const reopenedTagInput = getTagInput();
      expect(reopenedTagInput).toHaveValue("");
    });

    it("ignores a duplicate tag", async () => {
      const { user } = setup();

      await addComposerTag({ user, tag: TAG });
      await addComposerTag({ user, tag: TAG });

      expect(getChipNames()).toStrictEqual([TAG]);
    });

    it("shows the Tag button as pressed while the field is open or tags exist", async () => {
      const { user } = setup();

      const tagButton = getToolbarButton(tagCommand.label);
      expect(tagButton).toHaveAttribute("aria-pressed", "false");

      await user.click(tagButton);

      expect(tagButton).toHaveAttribute("aria-pressed", "true");

      const tagInput = getTagInput();
      await user.type(tagInput, `${TAG}{Enter}`);
      await user.click(tagButton);

      const closedTagInput = queryTagInput();
      expect(closedTagInput).not.toBeInTheDocument();
      expect(tagButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("sending", () => {
    it("disables Send while the editor is empty", () => {
      setup();
      const sendButton = getSendButton();
      expect(sendButton).toBeDisabled();
    });

    it("keeps Send disabled when only tags are present", async () => {
      const { user } = setup();

      await addComposerTag({ user, tag: TAG });
      const sendButton = getSendButton();
      expect(sendButton).toBeDisabled();
    });

    it("sends the content and tags, then empties the editor, clears the tags, closes the field, and focuses the editor", async () => {
      const { user, onSend } = setup();

      await typeInComposer({ user, text: "Hello" });
      await addComposerTag({ user, tag: TAG });

      const sendButton = getSendButton();
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledOnce();
      expect(onSend).toHaveBeenCalledWith({
        content: "<p>Hello</p>",
        tags: [TAG],
      });

      const editor = getComposerEditor();
      expect(editor.textContent).toBe("");
      expect(getChipNames()).toStrictEqual([]);
      const closedTagInput = queryTagInput();
      expect(closedTagInput).not.toBeInTheDocument();

      await expectEditorFocused();
    });

    it("sends with Ctrl+Enter", async () => {
      const { user, onSend } = setup();

      await typeInComposer({ user, text: "Hi" });
      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(onSend).toHaveBeenCalledOnce();
      expect(onSend).toHaveBeenCalledWith({ content: "<p>Hi</p>", tags: [] });
    });

    it("keeps the editor empty when undo is pressed after sending", async () => {
      const { user } = setup();

      await typeInComposer({ user, text: "Hello" });

      const sendButton = getSendButton();
      await user.click(sendButton);
      await user.keyboard("{Control>}z{/Control}");

      const editor = getComposerEditor();
      expect(editor.textContent).toBe("");
    });

    it("does nothing on Ctrl+Enter when the editor is empty", async () => {
      const { user, onSend } = setup();

      const editor = getComposerEditor();
      await user.click(editor);
      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(onSend).not.toHaveBeenCalled();
    });

    it("enables Send for an image-only message", async () => {
      const { user } = setup();

      await pickComposerFile({ user, file: createPngFile() });
      await screen.findByAltText(PNG_FILE_NAME);

      const sendButton = getSendButton();
      expect(sendButton).toBeEnabled();
    });
  });
});
