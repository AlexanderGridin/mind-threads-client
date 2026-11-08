import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { DEFAULT_SWATCH_COLOR } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  clickOutside,
  stubLayout,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { AddSectionModal } from "../AddSectionModal";
import {
  ADD_SECTION_MODAL_TITLE,
  ADD_SECTION_SUBMIT_LABEL,
} from "../AddSectionModal.constants";
import { SectionFormTestId } from "../components/SectionForm/SectionForm.constants";

const SECTION_NAME = "Ideas";
const BLANK_NAME = "   ";

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const renderModal = ({ isSaving }: { isSaving: boolean }) => {
  return (
    <AddSectionModal
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

  const renderResult = renderWithUIProvider(renderModal({ isSaving }));

  return { user, renderResult };
};

const getNameInput = () => {
  return screen.getByTestId(SectionFormTestId.nameInput);
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddSectionModal", () => {
  it("shows the title, an empty name, and the Add and Cancel buttons", () => {
    setup();

    const title = screen.getByText(ADD_SECTION_MODAL_TITLE);
    expect(title).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue("");

    const addButton = getAddButton();
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
    expect(addButton.textContent).toBe(ADD_SECTION_SUBMIT_LABEL);

    const cancelButton = getCancelButton();
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toBeEnabled();
  });

  it("starts with the default color", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, SECTION_NAME);

    const addButton = getAddButton();
    expect(addButton).toBeEnabled();

    await user.click(addButton);

    expect(mockOnSubmit).toHaveBeenCalledOnce();

    const [submittedValue] = mockOnSubmit.mock.calls[0];
    expect(submittedValue.color).toBe(DEFAULT_SWATCH_COLOR);
  });

  it("focuses the name input after open", async () => {
    stubLayout();
    setup();

    const nameInput = getNameInput();
    await waitFor(() => expect(nameInput).toHaveFocus());
  });

  it("attaches the Add button to the section form as a submit button", () => {
    setup();

    const addButton = getAddButton() as HTMLButtonElement;
    const form = screen.getByTestId(SectionFormTestId.form);

    expect(addButton.type).toBe("submit");
    expect(addButton.form).toBe(form);
  });

  describe("name rules", () => {
    it("disables Add for an empty name, and a form submit does not call onSubmit", () => {
      setup();

      const addButton = getAddButton();
      expect(addButton).toBeDisabled();

      const form = screen.getByTestId(SectionFormTestId.form);
      fireEvent.submit(form);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("disables Add for a name of only spaces, and a form submit does not call onSubmit", async () => {
      const { user } = setup();

      const nameInput = getNameInput();
      await user.type(nameInput, BLANK_NAME);

      const addButton = getAddButton();
      expect(addButton).toBeDisabled();

      const form = screen.getByTestId(SectionFormTestId.form);
      fireEvent.submit(form);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit with the typed value when the form is submitted", async () => {
      const { user } = setup();

      const nameInput = getNameInput();
      await user.type(nameInput, SECTION_NAME);

      const form = screen.getByTestId(SectionFormTestId.form);
      fireEvent.submit(form);

      expect(mockOnSubmit).toHaveBeenCalledOnce();

      const [submittedValue] = mockOnSubmit.mock.calls[0];

      expect(submittedValue).toStrictEqual({
        name: SECTION_NAME,
        color: DEFAULT_SWATCH_COLOR,
      });
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const { user } = setup();

    const cancelButton = getCancelButton();
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it("keeps the typed name and color when saving ends after a failed save", async () => {
    const { user, renderResult } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, SECTION_NAME);

    renderResult.rerender(renderModal({ isSaving: true }));
    renderResult.rerender(renderModal({ isSaving: false }));

    const nameInputAfterSave = getNameInput();
    expect(nameInputAfterSave).toHaveValue(SECTION_NAME);

    const form = screen.getByTestId(SectionFormTestId.form);
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalledOnce();

    const [submittedValue] = mockOnSubmit.mock.calls[0];

    expect(submittedValue).toStrictEqual({
      name: SECTION_NAME,
      color: DEFAULT_SWATCH_COLOR,
    });
  });

  describe("while saving", () => {
    it("shows the loading state on Add and disables Cancel", () => {
      setup({ isSaving: true });

      const addButton = getAddButton();
      expect(addButton).toHaveAttribute("data-loading");
      expect(addButton).toBeDisabled();

      const cancelButton = getCancelButton();
      expect(cancelButton).toBeDisabled();
    });

    it("does not call onSubmit when the form is submitted", async () => {
      const { user, renderResult } = setup();

      const nameInput = getNameInput();
      await user.type(nameInput, SECTION_NAME);

      renderResult.rerender(renderModal({ isSaving: true }));

      const form = screen.getByTestId(SectionFormTestId.form);
      fireEvent.submit(form);

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
