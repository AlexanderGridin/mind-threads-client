import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ColorPickerTestId } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadFormTestId } from "@/components/shared/ThreadForm/ThreadForm.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  clickOutside,
  mindThreadFixturesWithSameTitle,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { EditThreadModal } from "../EditThreadModal";
import { EDIT_THREAD_MODAL_TITLE } from "../EditThreadModal.constants";
import type { EditThreadModalProps } from "../EditThreadModal.types";

const THREAD = mindThreadFixturesWithSameTitle[0];

const renderEditThreadModal = ({
  isSaving,
  onClose,
  onSave,
}: Pick<EditThreadModalProps, "isSaving" | "onClose" | "onSave">) => {
  return (
    <EditThreadModal
      thread={THREAD}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

const setup = ({
  isSaving = false,
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: {
  isSaving?: boolean;
  pointerEventsCheck?: PointerEventsCheckLevel;
} = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });
  const onClose = vi.fn();
  const onSave = vi.fn();

  const { rerender } = renderWithUIProvider(
    renderEditThreadModal({ isSaving, onClose, onSave })
  );

  return { user, onClose, onSave, rerender };
};

const getNameInput = () => {
  return screen.getByTestId(ThreadFormTestId.titleInput);
};

const getColorTrigger = () => {
  return screen.getByTestId(ColorPickerTestId.trigger);
};

const getSaveButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
};

const getCancelButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.cancelButton);
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

describe("EditThreadModal", () => {
  it("shows the edit title, the thread's name and the thread's color", () => {
    setup();

    const title = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(title).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue(THREAD.title);

    const colorTrigger = getColorTrigger();
    expect(colorTrigger.firstChild).toHaveAttribute(
      "data-value",
      THREAD.color.toUpperCase()
    );
  });

  it("disables Save when nothing has changed", () => {
    setup();

    const saveButton = getSaveButton();
    expect(saveButton).toBeDisabled();
  });

  it("enables Save when the name changes", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, "!");

    const saveButton = getSaveButton();
    expect(saveButton).toBeEnabled();
  });

  it("disables Save again when the name is changed back to the saved name", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, "!");
    await user.type(nameInput, "{Backspace}");

    const saveButton = getSaveButton();
    expect(saveButton).toBeDisabled();
  });

  it("disables Save when the name is empty", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.clear(nameInput);

    const saveButton = getSaveButton();
    expect(saveButton).toBeDisabled();
  });

  it("disables Save when the name is only spaces", async () => {
    const { user } = setup();

    const nameInput = getNameInput();
    await user.clear(nameInput);
    await user.type(nameInput, "   ");

    const saveButton = getSaveButton();
    expect(saveButton).toBeDisabled();
  });

  it("enables Save when another swatch is picked", async () => {
    const { user } = setup();

    const colorTrigger = getColorTrigger();
    await user.click(colorTrigger);

    const swatchTriggers = screen.getAllByTestId(
      ColorPickerTestId.swatchTrigger
    );
    await user.click(swatchTriggers[0]);

    const saveButton = getSaveButton();
    expect(saveButton).toBeEnabled();
  });

  it("calls onSave with the entered name and color when Save is clicked", async () => {
    const { user, onSave } = setup();

    const nameInput = getNameInput();
    await user.clear(nameInput);
    await user.type(nameInput, "  QA Strategy  ");

    const saveButton = getSaveButton();
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledOnce();

    const [savedValue] = onSave.mock.calls[0];
    expect(savedValue).toStrictEqual({
      title: "  QA Strategy  ",
      color: THREAD.color,
    });
  });

  it("calls onClose when Cancel is clicked and shows no discard prompt for unsaved changes", async () => {
    const { user, onClose } = setup();

    const nameInput = getNameInput();
    await user.type(nameInput, "!");

    const cancelButton = getCancelButton();
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledOnce();

    const dialogs = screen.queryAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const { user, onClose } = setup();

    await waitForDismissListeners();
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the close button is clicked", async () => {
    const { user, onClose } = setup();

    const closeButton = getCloseButton();
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the user clicks outside the modal", async () => {
    const { user, onClose } = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await clickOutside(user);

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  describe("when saving", () => {
    it("shows the loading indicator on Save and disables Cancel and Save", () => {
      setup({ isSaving: true });

      const saveButton = getSaveButton();
      expect(saveButton).toHaveAttribute("data-loading");
      expect(saveButton).toBeDisabled();

      const cancelButton = getCancelButton();
      expect(cancelButton).toBeDisabled();
    });

    it("disables the name input, the color trigger and the close button", () => {
      setup({ isSaving: true });

      const nameInput = getNameInput();
      expect(nameInput).toBeDisabled();

      const colorTrigger = getColorTrigger();
      expect(colorTrigger).toBeDisabled();

      const closeButton = getCloseButton();
      expect(closeButton).toBeDisabled();
    });

    it("does not call onClose when Escape is pressed", async () => {
      const { user, onClose } = setup({ isSaving: true });

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when the user clicks outside the modal", async () => {
      const { user, onClose } = setup({
        isSaving: true,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutside(user);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("keeps the entered values when saving changes from true to false", async () => {
      const { user, onClose, onSave, rerender } = setup();

      const nameInput = getNameInput();
      await user.type(nameInput, "!");

      rerender(renderEditThreadModal({ isSaving: true, onClose, onSave }));
      rerender(renderEditThreadModal({ isSaving: false, onClose, onSave }));

      const nameInputAfterSave = getNameInput();
      expect(nameInputAfterSave).toHaveValue(`${THREAD.title}!`);
    });
  });
});
