import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dialog, type DialogProps } from "../Dialog";
import { renderWithUIProvider } from "../../utils";

const setup = ({
  open = true,
  title = "Test title",
  content = "Test content",
  actions = <button>OK</button>,
  onClose = vi.fn(),
}: Partial<DialogProps> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <Dialog
      open={open}
      title={title}
      content={content}
      actions={actions}
      onClose={onClose}
    />
  );

  return { user };
};

describe("Dialog", () => {
  it("renders title, content, and actions when open is true", () => {
    setup({ open: true });

    expect(screen.getByText("Test title")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("does not render content when open is false", () => {
    setup({ open: false });

    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const mockOnClose = vi.fn();
    const { user } = setup({ open: true, onClose: mockOnClose });

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
