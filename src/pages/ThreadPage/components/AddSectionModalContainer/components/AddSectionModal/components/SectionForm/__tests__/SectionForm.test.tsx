import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { ThreadSectionValue } from "@/types";
import { SectionForm } from "../SectionForm";
import {
  SectionFormTestId,
  SECTION_NAME_LABEL,
} from "../SectionForm.constants";

const FORM_ID = "section-form";
const SECTION_COLOR = "#5E81AC";
const SECTION_NAME = "Ideas";
const TYPED_CHARACTER = "I";

const mockOnChange = vi.fn();
const mockOnSubmit = vi.fn();

type SetupParams = {
  value?: ThreadSectionValue;
  disabled?: boolean;
};

const setup = ({
  value = { name: "", color: SECTION_COLOR },
  disabled = false,
}: SetupParams = {}) => {
  const user = userEvent.setup();
  const nameInputRef = createRef<HTMLInputElement>();

  renderWithUIProvider(
    <SectionForm
      formId={FORM_ID}
      value={value}
      nameInputRef={nameInputRef}
      disabled={disabled}
      onChange={mockOnChange}
      onSubmit={mockOnSubmit}
    />
  );

  return { user, nameInputRef };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SectionForm", () => {
  it("renders the required section name input and the color picker inside the form with the given id", () => {
    setup();

    const form = screen.getByTestId(SectionFormTestId.form);
    const nameInput = screen.getByTestId(SectionFormTestId.nameInput);
    const colorPicker = screen.getByTestId(SectionFormTestId.colorPicker);
    const nameLabel = screen.getByText(SECTION_NAME_LABEL);

    expect(form).toHaveAttribute("id", FORM_ID);

    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeEnabled();
    expect(nameInput).toBeRequired();

    expect(nameLabel).toBeInTheDocument();

    expect(colorPicker).toBeInTheDocument();
    expect(colorPicker).toBeEnabled();
  });

  it("calls onChange with the typed name and keeps the color", async () => {
    const { user } = setup();

    const nameInput = screen.getByTestId(SectionFormTestId.nameInput);

    await user.type(nameInput, TYPED_CHARACTER);

    expect(mockOnChange).toHaveBeenCalledOnce();

    const [changedValue] = mockOnChange.mock.calls[0];

    expect(changedValue).toStrictEqual({
      name: TYPED_CHARACTER,
      color: SECTION_COLOR,
    });
  });

  it("calls onSubmit once on form submission", () => {
    setup({ value: { name: SECTION_NAME, color: SECTION_COLOR } });

    const form = screen.getByTestId(SectionFormTestId.form);

    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  it("disables the name input when disabled", () => {
    setup({ disabled: true });

    const nameInput = screen.getByTestId(SectionFormTestId.nameInput);
    expect(nameInput).toBeDisabled();
  });

  it("passes the name input ref to the name input element", () => {
    const { nameInputRef } = setup();

    const nameInput = screen.getByTestId(SectionFormTestId.nameInput);
    expect(nameInputRef.current).toBe(nameInput);
  });
});
