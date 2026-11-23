import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getToolbarButton, isFollowing } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  FORMATTING_COMMANDS,
  STRUCTURE_COMMANDS,
  boldCommand,
  tagCommand,
} from "../../../MessageComposer.commands";
import { ComposerToolbar } from "../ComposerToolbar";
import { ComposerToolbarTestId } from "../ComposerToolbar.constants";

type SetupParams = {
  isTagActive?: boolean;
};

const setup = ({ isTagActive = false }: SetupParams = {}) => {
  const user = userEvent.setup();
  const onCommand = vi.fn();

  renderWithUIProvider(
    <ComposerToolbar isTagActive={isTagActive} onCommand={onCommand} />
  );

  return { user, onCommand };
};

const getToolbar = () => {
  return screen.getByTestId(ComposerToolbarTestId.container);
};

const getDivider = () => {
  return screen.getByTestId(ComposerToolbarTestId.divider);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ComposerToolbar", () => {
  it("renders the formatting buttons, the divider, the structure buttons, and then the Tag button, in that order", () => {
    setup();

    const toolbar = getToolbar();
    const buttonLabels = within(toolbar)
      .getAllByRole("button")
      .map((button) => {
        return button.getAttribute("aria-label");
      });

    const expectedLabels = [
      ...FORMATTING_COMMANDS,
      ...STRUCTURE_COMMANDS,
      tagCommand,
    ].map((command) => {
      return command.label;
    });

    expect(buttonLabels).toStrictEqual(expectedLabels);
  });

  it("places the divider between the formatting and structure buttons", () => {
    setup();

    const divider = getDivider();
    const lastFormattingButton = getToolbarButton(
      FORMATTING_COMMANDS[FORMATTING_COMMANDS.length - 1].label
    );

    const firstStructureButton = getToolbarButton(STRUCTURE_COMMANDS[0].label);
    const tagButton = getToolbarButton(tagCommand.label);

    expect(
      isFollowing({ element: divider, previousElement: lastFormattingButton })
    ).toBe(true);

    expect(
      isFollowing({ element: firstStructureButton, previousElement: divider })
    ).toBe(true);

    expect(
      isFollowing({ element: tagButton, previousElement: firstStructureButton })
    ).toBe(true);
  });

  it("lets the buttons wrap onto the next line", () => {
    setup();

    const toolbar = getToolbar();
    expect(toolbar).toHaveStyle({ flexWrap: "wrap" });
  });

  it.each([
    { isTagActive: true, expected: "true" },
    { isTagActive: false, expected: "false" },
  ])(
    "sets the Tag button aria-pressed to $expected when isTagActive is $isTagActive",
    ({ isTagActive, expected }) => {
      setup({ isTagActive });

      const tagButton = getToolbarButton(tagCommand.label);
      expect(tagButton).toHaveAttribute("aria-pressed", expected);
    }
  );

  it("passes the clicked command to onCommand", async () => {
    const { user, onCommand } = setup();

    const boldButton = getToolbarButton(boldCommand.label);
    await user.click(boldButton);

    expect(onCommand).toHaveBeenCalledOnce();
    expect(onCommand).toHaveBeenCalledWith(boldCommand);
  });
});
