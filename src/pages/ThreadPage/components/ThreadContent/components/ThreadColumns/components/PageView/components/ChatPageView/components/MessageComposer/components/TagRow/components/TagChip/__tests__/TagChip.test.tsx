import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { TagChip } from "../TagChip";
import { TagChipTestId } from "../TagChip.constants";
import { getRemoveTagLabel } from "../TagChip.utils";

const TAG = "ideas";
const LONG_TAG = "a-very-long-tag-name-that-must-never-be-cut-off-in-the-chip";

type SetupParams = {
  tag?: string;
};

const setup = ({ tag = TAG }: SetupParams = {}) => {
  const user = userEvent.setup();
  const onRemove = vi.fn();

  renderWithUIProvider(<TagChip tag={tag} onRemove={onRemove} />);

  return { user, onRemove };
};

const getTagName = () => {
  return screen.getByTestId(TagChipTestId.name);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TagChip", () => {
  it("shows the tag name", () => {
    setup();

    const tagName = getTagName();
    expect(tagName.textContent).toBe(TAG);
  });

  it("shows a very long tag name in full", () => {
    setup({ tag: LONG_TAG });

    const tagName = getTagName();
    const chip = screen.getByTestId(TagChipTestId.container);

    expect(tagName.textContent).toBe(LONG_TAG);
    expect(chip).toHaveStyle({ whiteSpace: "nowrap", flexShrink: "0" });
    expect(tagName).not.toHaveStyle({ textOverflow: "ellipsis" });
  });

  it("names the remove button after the tag", () => {
    setup();

    const removeButton = screen.getByRole("button", {
      name: getRemoveTagLabel(TAG),
    });

    expect(removeButton).toBeInTheDocument();
  });

  it("calls onRemove with the tag when the remove button is clicked", async () => {
    const { user, onRemove } = setup();

    const removeButton = screen.getByRole("button", {
      name: getRemoveTagLabel(TAG),
    });

    await user.click(removeButton);

    expect(onRemove).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledWith(TAG);
  });
});
