import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getTryAgainButton } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { MessagesLoadError } from "../MessagesLoadError";
import {
  MESSAGES_LOAD_ERROR_MESSAGE,
  MessagesLoadErrorTestId,
} from "../MessagesLoadError.constants";

const setup = () => {
  const user = userEvent.setup();
  const onRetry = vi.fn();

  renderWithUIProvider(<MessagesLoadError onRetry={onRetry} />);

  return { user, onRetry };
};

describe("MessagesLoadError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the load error message and a try again button", () => {
    setup();

    const message = screen.getByTestId(MessagesLoadErrorTestId.message);
    const tryAgainButton = getTryAgainButton();

    expect(message.textContent).toBe(MESSAGES_LOAD_ERROR_MESSAGE);
    expect(tryAgainButton).toBeInTheDocument();
  });

  it("calls onRetry once when try again is clicked", async () => {
    const { user, onRetry } = setup();

    const tryAgainButton = getTryAgainButton();
    await user.click(tryAgainButton);

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
