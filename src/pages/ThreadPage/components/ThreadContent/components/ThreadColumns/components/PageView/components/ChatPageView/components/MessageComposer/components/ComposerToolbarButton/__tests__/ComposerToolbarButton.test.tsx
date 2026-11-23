import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getToolbarButton } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { boldCommand } from "../../../MessageComposer.commands";
import { getCommandTooltip } from "../../../MessageComposer.utils";
import type { ComposerToolbarCommand } from "../../../MessageComposer.types";
import { ComposerToolbarButton } from "../ComposerToolbarButton";

type SetupParams = {
  command?: ComposerToolbarCommand;
  isActive?: boolean;
};

const setup = ({ command = boldCommand, isActive }: SetupParams = {}) => {
  const user = userEvent.setup();
  const onCommand = vi.fn();

  renderWithUIProvider(
    <ComposerToolbarButton
      command={command}
      isActive={isActive}
      onCommand={onCommand}
    />
  );

  return { user, onCommand };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ComposerToolbarButton", () => {
  it("is named by the command label", () => {
    setup();

    const button = getToolbarButton(boldCommand.label);
    expect(button).toBeInTheDocument();
  });

  it("shows the command tooltip with its shortcut when hovered", async () => {
    const { user } = setup();

    const button = getToolbarButton(boldCommand.label);
    await user.hover(button);

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe(getCommandTooltip(boldCommand));
  });

  it("calls onCommand with the command when clicked", async () => {
    const { user, onCommand } = setup();

    const button = getToolbarButton(boldCommand.label);
    await user.click(button);

    expect(onCommand).toHaveBeenCalledOnce();
    expect(onCommand).toHaveBeenCalledWith(boldCommand);
  });

  it.each([
    { isActive: true, expected: "true" },
    { isActive: false, expected: "false" },
  ])(
    "sets aria-pressed to $expected when isActive is $isActive",
    ({ isActive, expected }) => {
      setup({ isActive });

      const button = getToolbarButton(boldCommand.label);
      expect(button).toHaveAttribute("aria-pressed", expected);
    }
  );

  it("has no aria-pressed when isActive is not given", () => {
    setup();

    const button = getToolbarButton(boldCommand.label);
    expect(button).not.toHaveAttribute("aria-pressed");
  });
});
