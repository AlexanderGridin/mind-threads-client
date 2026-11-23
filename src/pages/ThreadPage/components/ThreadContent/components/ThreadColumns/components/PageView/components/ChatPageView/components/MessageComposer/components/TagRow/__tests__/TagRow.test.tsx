import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { TagRow } from "../TagRow";
import { TAG_INPUT_LABEL } from "../TagRow.constants";
import { TagChipTestId } from "../components/TagChip/TagChip.constants";

const TAGS = ["ideas", "todo"];

type SetupParams = {
  tags?: string[];
  tagInput?: string;
  isTagFieldOpen?: boolean;
};

const setup = ({
  tags = [],
  tagInput = "",
  isTagFieldOpen = true,
}: SetupParams = {}) => {
  const user = userEvent.setup();
  const onTagInputChange = vi.fn();
  const onAddTag = vi.fn();
  const onDiscardTagInput = vi.fn();
  const onRemoveTag = vi.fn();

  renderWithUIProvider(
    <TagRow
      tags={tags}
      tagInput={tagInput}
      isTagFieldOpen={isTagFieldOpen}
      onTagInputChange={onTagInputChange}
      onAddTag={onAddTag}
      onDiscardTagInput={onDiscardTagInput}
      onRemoveTag={onRemoveTag}
    />
  );

  return {
    user,
    onTagInputChange,
    onAddTag,
    onDiscardTagInput,
    onRemoveTag,
  };
};

const getTagInput = () => {
  return screen.getByRole("textbox", { name: TAG_INPUT_LABEL });
};

const getChipContainers = () => {
  return screen.getAllByTestId(TagChipTestId.container);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TagRow", () => {
  it("renders a chip for each tag", () => {
    setup({ tags: TAGS, isTagFieldOpen: false });

    const chipNames = screen
      .getAllByTestId(TagChipTestId.name)
      .map((chipName) => {
        return chipName.textContent;
      });

    expect(chipNames).toStrictEqual(TAGS);
  });

  it("shows the input only when the tag field is open", () => {
    setup({ isTagFieldOpen: false });

    const tagInput = screen.queryByRole("textbox", { name: TAG_INPUT_LABEL });
    expect(tagInput).not.toBeInTheDocument();
  });

  it("shows the input when the tag field is open", () => {
    setup({ isTagFieldOpen: true });

    const tagInput = getTagInput();
    expect(tagInput).toBeInTheDocument();
  });

  it("calls onAddTag on Enter", async () => {
    const { user, onAddTag } = setup();

    const tagInput = getTagInput();
    await user.type(tagInput, "{Enter}");

    expect(onAddTag).toHaveBeenCalledOnce();
  });

  it("calls onAddTag on comma and does not type the comma into the input", async () => {
    const { user, onAddTag, onTagInputChange } = setup();

    const tagInput = getTagInput();
    await user.type(tagInput, ",");

    expect(onAddTag).toHaveBeenCalledOnce();
    expect(onTagInputChange).not.toHaveBeenCalled();
  });

  it("calls onDiscardTagInput on Escape", async () => {
    const { user, onDiscardTagInput } = setup();

    await user.keyboard("{Escape}");

    expect(onDiscardTagInput).toHaveBeenCalledOnce();
  });

  it("calls onAddTag when the input loses focus", async () => {
    const { user, onAddTag } = setup();

    const tagInput = getTagInput();
    await user.click(tagInput);
    await user.tab();

    expect(onAddTag).toHaveBeenCalledOnce();
  });

  it("lets the chip row scroll horizontally, with chips that do not shrink", () => {
    setup({ tags: TAGS, isTagFieldOpen: false });

    const [firstChip] = getChipContainers();
    const chipRow = firstChip.parentElement;

    expect(chipRow).toHaveStyle({ overflowX: "auto" });

    getChipContainers().forEach((chip) => {
      expect(chip).toHaveStyle({ flexShrink: "0" });
    });
  });
});
