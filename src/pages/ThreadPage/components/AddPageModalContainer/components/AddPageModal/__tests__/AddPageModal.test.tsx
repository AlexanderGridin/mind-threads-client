import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  ColorPickerTestId,
  DEFAULT_SWATCH_COLOR,
} from "@/components/lib/ColorPicker/ColorPicker.constants";
import { SelectTestId } from "@/components/lib/Select/Select.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  clickOutside,
  stubLayout,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { AddPageModal } from "../AddPageModal";
import {
  ADD_PAGE_MODAL_TITLE,
  ADD_PAGE_SUBMIT_LABEL,
} from "../AddPageModal.constants";
import { PageFormTestId } from "../components/PageForm/PageForm.constants";

const PAGE_NAME = "Ideas";
const BLANK_NAME = "   ";
const PAGE_TYPE = "chat";
const PAGE_TYPE_LABEL = "Chat";

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const renderModal = ({ isSaving }: { isSaving: boolean }) => {
  return (
    <AddPageModal
      isSaving={isSaving}
      onClose={mockOnClose}
      onSubmit={mockOnSubmit}
    />
  );
};

type SetupParams = {
  isSaving?: boolean;
  pointerEventsCheck?: PointerEventsCheckLevel;
};

const setup = ({
  isSaving = false,
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: SetupParams = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(renderModal({ isSaving }));

  return { user };
};

const getNameInput = () => {
  return screen.getByTestId(PageFormTestId.nameInput);
};

const getForm = () => {
  return screen.getByTestId(PageFormTestId.form);
};

const getAddButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: "Cancel" });
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

const getTypeTrigger = () => {
  const typeSelect = screen.getByTestId(PageFormTestId.typeSelect);

  return within(typeSelect).getByTestId(SelectTestId.trigger);
};

const getColorTrigger = () => {
  const colorPicker = screen.getByTestId(PageFormTestId.colorPicker);

  return within(colorPicker).getByTestId(ColorPickerTestId.trigger);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddPageModal", () => {
  it("shows the title, an empty name, the Chat type, and the Add and Cancel buttons", () => {
    setup();

    const title = screen.getByText(ADD_PAGE_MODAL_TITLE);
    expect(title).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue("");

    const typeSelect = screen.getByTestId(PageFormTestId.typeSelect);
    expect(typeSelect).toHaveTextContent(PAGE_TYPE_LABEL);

    const addButton = getAddButton();
    expect(addButton).toBeDisabled();
    expect(addButton.textContent).toBe(ADD_PAGE_SUBMIT_LABEL);

    const cancelButton = getCancelButton();
    expect(cancelButton).toBeEnabled();
  });

  it("focuses the name input after open", async () => {
    stubLayout();
    setup();

    const nameInput = getNameInput();
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
  });

  it("submits the typed name with the Chat type and the default color", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, PAGE_NAME);

    fireEvent.submit(getForm());

    expect(mockOnSubmit).toHaveBeenCalledOnce();

    const [submittedValue] = mockOnSubmit.mock.calls[0];

    expect(submittedValue).toStrictEqual({
      name: PAGE_NAME,
      type: PAGE_TYPE,
      color: DEFAULT_SWATCH_COLOR,
    });
  });

  describe("name rules", () => {
    it("disables Add for an empty name, and a form submit does not call onSubmit", () => {
      setup();

      const addButton = getAddButton();
      expect(addButton).toBeDisabled();

      fireEvent.submit(getForm());

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("disables Add for a name of only spaces, and a form submit does not call onSubmit", async () => {
      const { user } = setup();

      const nameInput = getNameInput();
      await user.type(nameInput, BLANK_NAME);

      const addButton = getAddButton();
      expect(addButton).toBeDisabled();

      fireEvent.submit(getForm());

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const { user } = setup();

    const cancelButton = getCancelButton();
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  describe("while saving", () => {
    it("shows the loading state on Add and disables all fields and Cancel", () => {
      setup({ isSaving: true });

      const addButton = getAddButton();
      expect(addButton).toHaveAttribute("data-loading");
      expect(addButton).toBeDisabled();

      const nameInput = getNameInput();
      expect(nameInput).toBeDisabled();

      const typeTrigger = getTypeTrigger();
      expect(typeTrigger).toBeDisabled();

      const colorTrigger = getColorTrigger();
      expect(colorTrigger).toBeDisabled();

      const cancelButton = getCancelButton();
      expect(cancelButton).toBeDisabled();
    });

    it("does not call onSubmit when the form is submitted", () => {
      setup({ isSaving: true });

      fireEvent.submit(getForm());

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("does not call onClose when Escape is pressed", async () => {
      const { user } = setup({ isSaving: true });

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when the user clicks outside the modal", async () => {
      const { user } = setup({
        isSaving: true,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutside(user);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when the close button is clicked", async () => {
      const { user } = setup({ isSaving: true });

      const closeButton = getCloseButton();
      await user.click(closeButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
