import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { ColorPickerTestId } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { NORD_AURORA_SWATCHES } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { SelectTestId } from "@/components/lib/Select/Select.constants";
import { PageTypeIconTestId } from "@/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.constants";
import type { SectionPageValue } from "@/types";
import { parseColor } from "@chakra-ui/react";
import { PageForm } from "../PageForm";
import { PageFormTestId, PAGE_NAME_LABEL } from "../PageForm.constants";

const FORM_ID = "page-form";
const PAGE_COLOR = "#5E81AC";
const PAGE_TYPE_LABEL = "Chat";
const TYPED_CHARACTER = "I";

const mockOnChange = vi.fn();
const mockOnSubmit = vi.fn();

type SetupParams = {
  value?: SectionPageValue;
  disabled?: boolean;
};

const setup = ({
  value = { name: "", type: "chat", color: PAGE_COLOR },
  disabled = false,
}: SetupParams = {}) => {
  const user = userEvent.setup();
  const nameInputRef = createRef<HTMLInputElement>();

  renderWithUIProvider(
    <PageForm
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

const getTypeSelect = () => {
  return screen.getByTestId(PageFormTestId.typeSelect);
};

const getTypeTrigger = () => {
  return within(getTypeSelect()).getByTestId(SelectTestId.trigger);
};

const getColorTrigger = () => {
  const colorPicker = screen.getByTestId(PageFormTestId.colorPicker);

  return within(colorPicker).getByTestId(ColorPickerTestId.trigger);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PageForm", () => {
  it("renders the required page name input, the page type select showing Chat, and the color picker", () => {
    setup();

    const form = screen.getByTestId(PageFormTestId.form);
    expect(form).toHaveAttribute("id", FORM_ID);

    const nameInput = screen.getByTestId(PageFormTestId.nameInput);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeRequired();
    expect(nameInput).toBeEnabled();

    const nameLabel = screen.getByText(PAGE_NAME_LABEL);
    expect(nameLabel).toBeInTheDocument();

    const typeSelect = getTypeSelect();
    expect(typeSelect).toHaveTextContent(PAGE_TYPE_LABEL);

    const typeTrigger = getTypeTrigger();
    expect(typeTrigger).toBeEnabled();

    const colorPicker = screen.getByTestId(PageFormTestId.colorPicker);
    expect(colorPicker).toBeInTheDocument();

    const colorTrigger = getColorTrigger();
    expect(colorTrigger).toBeEnabled();
  });

  it("calls onChange with the typed name and keeps the type and color", async () => {
    const { user } = setup();

    const nameInput = screen.getByTestId(PageFormTestId.nameInput);
    await user.type(nameInput, TYPED_CHARACTER);

    expect(mockOnChange).toHaveBeenCalledOnce();

    const [changedValue] = mockOnChange.mock.calls[0];

    expect(changedValue).toStrictEqual({
      name: TYPED_CHARACTER,
      type: "chat",
      color: PAGE_COLOR,
    });
  });

  it("lists only Chat, with its icon before the label, when the type select is opened", async () => {
    const { user } = setup();

    await user.click(getTypeTrigger());

    const items = await screen.findAllByTestId(SelectTestId.item);
    expect(items).toHaveLength(1);

    const chatItem = items[0];
    expect(chatItem).toHaveTextContent(PAGE_TYPE_LABEL);

    const chatIcon = within(chatItem).getByTestId(PageTypeIconTestId.chat);
    expect(chatItem.firstElementChild).toBe(chatIcon);
  });

  it("calls onChange with the chosen swatch color, and offers the same swatches as the color picker", async () => {
    const { user } = setup();

    await user.click(getColorTrigger());

    const swatchTriggers = screen.getAllByTestId(
      ColorPickerTestId.swatchTrigger
    );

    expect(swatchTriggers).toHaveLength(NORD_AURORA_SWATCHES.length);

    const chosenSwatchIndex = 1;
    await user.click(swatchTriggers[chosenSwatchIndex]);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "",
        type: "chat",
        color: parseColor(NORD_AURORA_SWATCHES[chosenSwatchIndex]).toString(
          "hex"
        ),
      })
    );
  });

  it("calls onSubmit once on form submission", () => {
    setup({ value: { name: "Ideas", type: "chat", color: PAGE_COLOR } });

    const form = screen.getByTestId(PageFormTestId.form);

    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  it("disables the name input, the type select, and the color picker when disabled", () => {
    setup({ disabled: true });

    const nameInput = screen.getByTestId(PageFormTestId.nameInput);
    expect(nameInput).toBeDisabled();

    const typeTrigger = getTypeTrigger();
    expect(typeTrigger).toBeDisabled();

    const colorTrigger = getColorTrigger();
    expect(colorTrigger).toBeDisabled();
  });
});
