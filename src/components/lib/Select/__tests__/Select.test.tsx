import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select, type SelectProps } from "../Select";
import type { SelectItem } from "../Select.types";
import { SelectTestId } from "../Select.constants";
import { renderWithUIProvider } from "../../__test-fixtures__";

type TestValue = "chat" | "notes";

const LABEL = "Page type";
const CHAT_ICON_TEST_ID = "chat-icon";
const NOTES_ICON_TEST_ID = "notes-icon";

const ITEMS: SelectItem<TestValue>[] = [
  {
    value: "chat",
    label: "Chat",
    icon: <span data-testid={CHAT_ICON_TEST_ID}>C</span>,
  },
  {
    value: "notes",
    label: "Notes",
    icon: <span data-testid={NOTES_ICON_TEST_ID}>N</span>,
  },
];

const setup = ({
  value = "chat",
  disabled = false,
  portal = true,
  onChange = vi.fn(),
}: Partial<SelectProps<TestValue>> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <Select
      label={LABEL}
      value={value}
      items={ITEMS}
      onChange={onChange}
      disabled={disabled}
      portal={portal}
    />
  );

  return { user, onChange };
};

const openSelect = async (user: ReturnType<typeof userEvent.setup>) => {
  const trigger = screen.getByTestId(SelectTestId.trigger);
  expect(trigger).toBeInTheDocument();
  expect(trigger).toBeEnabled();

  await user.click(trigger);

  return screen.findAllByTestId(SelectTestId.item);
};

describe("Select", () => {
  it("renders the label and the selected item's label", () => {
    setup();

    const container = screen.getByTestId(SelectTestId.container);
    expect(container).toBeInTheDocument();

    const label = screen.getByText(LABEL);
    expect(label).toBeInTheDocument();

    const trigger = screen.getByTestId(SelectTestId.trigger);
    expect(trigger).toHaveTextContent(ITEMS[0].label);
  });

  it("lists every item with its icon before its label when opened", async () => {
    const { user } = setup();

    const items = await openSelect(user);
    expect(items).toHaveLength(ITEMS.length);

    const chatItem = items[0];
    const chatIcon = within(chatItem).getByTestId(CHAT_ICON_TEST_ID);
    const chatLabel = within(chatItem).getByText(ITEMS[0].label);

    expect(chatIcon).toBeInTheDocument();
    expect(chatLabel).toBeInTheDocument();
    expect(chatItem.firstElementChild).toBe(chatIcon);

    const notesItem = items[1];
    const notesIcon = within(notesItem).getByTestId(NOTES_ICON_TEST_ID);
    expect(notesItem.firstElementChild).toBe(notesIcon);
  });

  it("calls onChange with the value of the chosen item", async () => {
    // jsdom has no scrollTo, and Zag calls it when an item is chosen.
    Element.prototype.scrollTo = vi.fn();

    const { user, onChange } = setup();

    const items = await openSelect(user);
    const notesItem = items[1];

    await user.click(notesItem);

    expect(onChange).toHaveBeenCalledWith("notes");
  });

  it("disables the trigger and does not open the list when disabled", async () => {
    const { user, onChange } = setup({ disabled: true });

    const trigger = screen.getByTestId(SelectTestId.trigger);
    expect(trigger).toBeDisabled();

    await user.click(trigger);

    const content = screen.getByTestId(SelectTestId.content);
    expect(content).toHaveAttribute("hidden", "");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the list inside the root container when portal is false", () => {
    setup({ portal: false });

    const container = screen.getByTestId(SelectTestId.container);
    const content = within(container).getByTestId(SelectTestId.content);

    expect(content).toBeInTheDocument();
  });
});
