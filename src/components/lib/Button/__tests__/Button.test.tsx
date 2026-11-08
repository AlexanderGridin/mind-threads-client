import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type FormEvent, type Ref } from "react";

import { Button, type ButtonProps } from "../Button";
import { renderWithUIProvider } from "../../__test-fixtures__";

const setup = ({
  onClick = vi.fn(),
  children = "Click me",
  "data-testid": dataTestId,
  disabled = false,
  loading = false,
  size,
  type,
  form,
  ref,
}: Partial<ButtonProps> & { ref?: Ref<HTMLButtonElement> } = {}) => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(
    <Button
      ref={ref}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      data-testid={dataTestId}
      size={size}
      type={type}
      form={form}
    >
      {children}
    </Button>
  );

  return { user, ...renderResult };
};

describe("Button", () => {
  const getButton = () => screen.getByRole("button", { name: /click me/i });

  it("renders with children", () => {
    setup();
    expect(getButton()).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const mockOnClick = vi.fn();
    const { user } = setup({ onClick: mockOnClick });

    const button = getButton();
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("renders multiple children correctly", () => {
    setup({
      children: (
        <>
          <span>Icon</span>
          <span>Label</span>
        </>
      ),
    });

    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("accepts and applies data-testid prop", () => {
    setup({ "data-testid": "test-button" });
    expect(screen.getByTestId("test-button")).toBeInTheDocument();
  });

  it("accepts disabled prop", () => {
    setup({ disabled: true });

    const button = getButton();
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("is disabled and does not call onClick when loading", async () => {
    const mockOnClick = vi.fn();
    const { user } = setup({ loading: true, onClick: mockOnClick });

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("calls onClick when not loading", async () => {
    const mockOnClick = vi.fn();

    const { user } = setup({ loading: false, onClick: mockOnClick });

    const button = getButton();
    expect(button).toBeEnabled();

    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("forwards the ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();

    setup({ ref });

    const button = getButton();
    expect(ref.current).toBe(button);
  });

  it("has type button by default", () => {
    setup();

    const button = getButton();
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies the given size and still calls onClick", async () => {
    const mockOnClick = vi.fn();
    const { user, unmount } = setup();

    const defaultClassName = getButton().className;
    unmount();

    setup({ size: "xs", onClick: mockOnClick });

    const button = getButton();
    expect(button.className).not.toBe(defaultClassName);

    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  describe("when attached to a form", () => {
    const FORM_ID = "section-form";
    const SUBMIT_LABEL = "Save";

    const setupAttachedToForm = () => {
      const user = userEvent.setup();
      const handleFormSubmit = vi.fn((event: FormEvent) => {
        event.preventDefault();
      });

      renderWithUIProvider(
        <>
          <form
            id={FORM_ID}
            data-testid="attached-form"
            onSubmit={handleFormSubmit}
          >
            <span>Form content</span>
          </form>

          <Button type="submit" form={FORM_ID}>
            {SUBMIT_LABEL}
          </Button>
        </>
      );

      return { user, handleFormSubmit };
    };

    it("is attached to the form with the given id", () => {
      setupAttachedToForm();

      const form = screen.getByTestId("attached-form");
      const button = screen.getByRole("button", {
        name: SUBMIT_LABEL,
      }) as HTMLButtonElement;

      expect(button.form).toBe(form);
    });

    it("submits the form when clicked, even though it sits outside the form", async () => {
      const { user, handleFormSubmit } = setupAttachedToForm();

      const button = screen.getByRole("button", { name: SUBMIT_LABEL });
      await user.click(button);

      expect(handleFormSubmit).toHaveBeenCalledOnce();
    });
  });
});
