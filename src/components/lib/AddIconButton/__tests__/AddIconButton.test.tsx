import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddIconButton, type AddIconButtonProps } from "../AddIconButton";
import { AddIconButtonTestId } from "../AddIconButton.constants";
import { renderWithUIProvider } from "../../__test-fixtures__";

const TOOLTIP_LABEL = "Add section";
const TEST_ID = "add-icon-button";

const mockOnClick = vi.fn();

const setup = ({
  tooltipLabel = TOOLTIP_LABEL,
  onClick = mockOnClick,
  "data-testid": dataTestId = TEST_ID,
}: Partial<AddIconButtonProps> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <AddIconButton
      tooltipLabel={tooltipLabel}
      onClick={onClick}
      data-testid={dataTestId}
    />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddIconButton", () => {
  it("renders a button named by the tooltip label", () => {
    setup();

    const button = screen.getByRole("button", { name: TOOLTIP_LABEL });

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("passes the data-testid to the button", () => {
    setup();

    const button = screen.getByTestId(TEST_ID);

    expect(button).toHaveAttribute("aria-label", TOOLTIP_LABEL);
    expect(button).toBeEnabled();
  });

  it("renders the plus icon inside the button", () => {
    setup();

    const button = screen.getByTestId(TEST_ID);
    const icon = screen.getByTestId(AddIconButtonTestId.icon);

    expect(icon).toBeInTheDocument();
    expect(button).toContainElement(icon);
  });

  it("calls onClick once when clicked", async () => {
    const { user } = setup();

    const button = screen.getByTestId(TEST_ID);
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("shows the tooltip label when hovered", async () => {
    const { user } = setup();

    const button = screen.getByTestId(TEST_ID);
    await user.hover(button);

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe(TOOLTIP_LABEL);
  });
});
