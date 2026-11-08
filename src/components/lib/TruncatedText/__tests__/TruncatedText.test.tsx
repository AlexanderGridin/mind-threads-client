import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithUIProvider,
  stubTextOverflow,
  waitForOpenDelay,
} from "../../__test-fixtures__";
import { TruncatedText } from "../TruncatedText";
import { TruncatedTextTestId } from "../TruncatedText.constants";

const TEST_TEXT = "A very long section name that does not fit";

const setup = ({ isOverflowing = false } = {}) => {
  stubTextOverflow({ isOverflowing });

  const user = userEvent.setup();

  renderWithUIProvider(<TruncatedText>{TEST_TEXT}</TruncatedText>);

  return { user };
};

describe("TruncatedText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the text", () => {
    setup();

    const text = screen.getByTestId(TruncatedTextTestId.text);
    expect(text.textContent).toBe(TEST_TEXT);
  });

  it("shows the full text in a tooltip when the text is cut off", async () => {
    const { user } = setup({ isOverflowing: true });

    const text = screen.getByTestId(TruncatedTextTestId.text);
    await user.hover(text);

    const tooltip = await screen.findByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip.textContent).toBe(TEST_TEXT);
  });

  it("shows no tooltip when the text fits, even after the open delay", async () => {
    const { user } = setup({ isOverflowing: false });

    const text = screen.getByTestId(TruncatedTextTestId.text);
    await user.hover(text);
    await waitForOpenDelay();

    const tooltip = screen.queryByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip).not.toBeInTheDocument();
  });

  it("hides the tooltip when the pointer leaves the text", async () => {
    const { user } = setup({ isOverflowing: true });

    const text = screen.getByTestId(TruncatedTextTestId.text);
    await user.hover(text);

    const tooltip = await screen.findByTestId(TruncatedTextTestId.tooltip);

    await user.unhover(text);

    await waitForElementToBeRemoved(tooltip);
  });
});
