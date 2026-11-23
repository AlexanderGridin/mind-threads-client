import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getSendButton } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { sendCommand } from "../../../MessageComposer.commands";
import { ComposerFooter } from "../ComposerFooter";
import { ComposerFooterTestId, SEND_HINT } from "../ComposerFooter.constants";

type SetupParams = {
  canSend?: boolean;
};

const setup = ({ canSend = true }: SetupParams = {}) => {
  const user = userEvent.setup();
  const onSend = vi.fn();

  renderWithUIProvider(<ComposerFooter canSend={canSend} onSend={onSend} />);

  return { user, onSend };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ComposerFooter", () => {
  it("shows the send hint", () => {
    setup();

    const hint = screen.getByTestId(ComposerFooterTestId.hint);
    expect(hint.textContent).toBe(SEND_HINT);
  });

  it("disables the Send button and does not call onSend when there is nothing to send", async () => {
    const { user, onSend } = setup({ canSend: false });

    const sendButton = getSendButton();
    await user.click(sendButton);

    expect(sendButton).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("calls onSend when the Send button is clicked and sending is allowed", async () => {
    const { user, onSend } = setup({ canSend: true });

    const sendButton = getSendButton();
    await user.click(sendButton);

    expect(sendButton).toBeEnabled();
    expect(sendButton.textContent).toContain(sendCommand.label);
    expect(onSend).toHaveBeenCalledOnce();
  });
});
