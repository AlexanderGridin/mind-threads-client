import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { createRef } from "react";

import { Dialog, type DialogProps } from "../Dialog";
import { renderWithUIProvider } from "../../utils";

const setup = ({
  open = true,
  title = "Test title",
  content = "Test content",
  actions = <button>OK</button>,
  closeDisabled = false,
  initialFocusRef,
  onClose = vi.fn(),
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: Partial<DialogProps> & {
  pointerEventsCheck?: PointerEventsCheckLevel;
} = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <Dialog
      open={open}
      title={title}
      content={content}
      actions={actions}
      closeDisabled={closeDisabled}
      initialFocusRef={initialFocusRef}
      onClose={onClose}
    />
  );

  return { user };
};

const stubLayout = () => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
};

// Zag attaches its dismiss listeners (Escape and outside interaction) asynchronously,
// after the dialog mounts. A short tick is not enough in jsdom, so wait longer.
const waitForDismissListeners = async () => {
  const promise = new Promise((resolve) => setTimeout(resolve, 100));
  await promise;
};

// jsdom lays out every element at (0, 0) with no size, so the pointer must land
// far away from the origin to count as outside the dialog.
const OUTSIDE_POINTER_POSITION = 10_000;

const clickOutsideDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitForDismissListeners();

  await user.pointer({
    keys: "[MouseLeft]",
    target: document.body,
    coords: {
      clientX: OUTSIDE_POINTER_POSITION,
      clientY: OUTSIDE_POINTER_POSITION,
    },
  });
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

  describe("when closeDisabled is true", () => {
    it("does not call onClose on Escape", async () => {
      const mockOnClose = vi.fn();
      const { user } = setup({ closeDisabled: true, onClose: mockOnClose });

      await waitForDismissListeners();

      await user.keyboard("{Escape}");

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("disables the close button", () => {
      setup({ closeDisabled: true });

      const closeButton = screen.getByRole("button", { name: "Close" });

      expect(closeButton).toBeDisabled();
    });

    it("does not call onClose on an outside click", async () => {
      const mockOnClose = vi.fn();

      const { user } = setup({
        closeDisabled: true,
        onClose: mockOnClose,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutsideDialog(user);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("when closeDisabled is false", () => {
    it("calls onClose on Escape", async () => {
      const mockOnClose = vi.fn();
      const { user } = setup({ closeDisabled: false, onClose: mockOnClose });

      await waitForDismissListeners();

      await user.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose on an outside click", async () => {
      const mockOnClose = vi.fn();

      const { user } = setup({
        closeDisabled: false,
        onClose: mockOnClose,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutsideDialog(user);

      await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    });
  });

  it("focuses the element referenced by initialFocusRef after open", async () => {
    const focusRef = createRef<HTMLButtonElement>();
    stubLayout();

    setup({
      actions: <button ref={focusRef}>Focus me</button>,
      initialFocusRef: focusRef,
    });

    const button = screen.getByRole("button", { name: "Focus me" });

    await waitFor(() => expect(button).toHaveFocus());
  });
});
