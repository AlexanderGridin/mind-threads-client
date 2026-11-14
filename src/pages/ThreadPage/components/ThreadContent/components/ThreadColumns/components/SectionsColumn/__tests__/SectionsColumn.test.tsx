import { describe, it, expect, beforeEach } from "vitest";
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  confirmSectionDelete,
  getRenderedSectionNames,
  mindThreadFixtures,
  openSectionDeleteMenu,
  seedSections,
  seedThreads,
  selectSectionCard,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import { SectionFormTestId } from "@/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/SectionForm.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { AddSectionModalContainer } from "@/pages/ThreadPage/components/AddSectionModalContainer";
import { ADD_SECTION_MODAL_TITLE } from "@/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/AddSectionModal.constants";
import {
  ADD_SECTION_BUTTON_LABEL,
  SECTIONS_COLUMN_HEADING,
  SECTIONS_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../../../ThreadColumns.constants";
import { SectionCardTestId } from "../components/SectionCard/SectionCard.constants";
import { SectionsColumn } from "../SectionsColumn";
import { getSectionActionsLabel } from "../components/SectionCard/components/SectionCardActions/SectionCardActions.utils";
import { DeleteSectionModalContainer } from "@/pages/ThreadPage/components/DeleteSectionModalContainer";

const STORED_THREAD = mindThreadFixtures[0];

const STORED_SECTION_NAMES = threadSectionFixtures
  .filter((section) => {
    return section.threadId === STORED_THREAD.id;
  })
  .map((section) => {
    return section.name;
  });

const setup = () => {
  const user = userEvent.setup();

  const { unmount } = renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <AddSectionModalContainer />
      <DeleteSectionModalContainer />
    </ThreadPageLoader>
  );

  return { user, unmount };
};

const getSelectButton = (sectionName: string) => {
  return screen.getByRole("button", { name: sectionName });
};

const getSectionsColumn = () => {
  return screen.getByTestId(ThreadColumnsTestId.sectionsColumn);
};

const getAddSectionButton = () => {
  return screen.getByRole("button", { name: ADD_SECTION_BUTTON_LABEL });
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

describe("SectionsColumn", () => {
  it("shows the heading, the add button and the empty message when there are no sections", () => {
    setup();

    const sectionsColumn = getSectionsColumn();

    const heading = within(sectionsColumn).getByRole("heading", {
      level: 3,
      name: SECTIONS_COLUMN_HEADING,
    });

    const addSectionButton = getAddSectionButton();
    const message = within(sectionsColumn).getByText(SECTIONS_COLUMN_MESSAGE);

    expect(heading).toBeInTheDocument();

    expect(addSectionButton).toBeInTheDocument();
    expect(addSectionButton).toBeEnabled();

    expect(message).toBeInTheDocument();
  });

  it("shows the thread's stored sections in order and no empty message", async () => {
    seedSections(threadSectionFixtures);

    setup();

    const cards = await screen.findAllByTestId(SectionCardTestId.container);

    const renderedNames = getRenderedSectionNames();

    expect(cards).toHaveLength(STORED_SECTION_NAMES.length);
    expect(renderedNames).toStrictEqual(STORED_SECTION_NAMES);

    const message = screen.queryByText(SECTIONS_COLUMN_MESSAGE);
    expect(message).not.toBeInTheDocument();
  });

  it("opens the add section modal from the add button", async () => {
    const { user } = setup();

    const addSectionButton = getAddSectionButton();
    await user.click(addSectionButton);

    const modalTitle = await screen.findByText(ADD_SECTION_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();
  });

  it("shows the empty message after the only section is deleted", async () => {
    const onlySection = threadSectionFixtures[0];

    seedSections([onlySection]);

    const { user } = setup();

    await screen.findByRole("button", {
      name: getSectionActionsLabel(onlySection.name),
    });

    let message = screen.queryByText(SECTIONS_COLUMN_MESSAGE);
    expect(message).not.toBeInTheDocument();

    await openSectionDeleteMenu({ user, sectionName: onlySection.name });
    await confirmSectionDelete(user);

    message = await screen.findByText(SECTIONS_COLUMN_MESSAGE);
    expect(message).toBeInTheDocument();
  });

  describe("section selection", () => {
    const FIRST_SECTION = threadSectionFixtures[0];
    const SECOND_SECTION = threadSectionFixtures[1];
    const NEW_SECTION_NAME = "Sketches";

    it("selects no section on load, and again after a remount", async () => {
      seedSections(threadSectionFixtures);

      const { unmount } = setup();

      const firstSelectButton = await screen.findByRole("button", {
        name: FIRST_SECTION.name,
      });

      expect(firstSelectButton).toHaveAttribute("aria-current", "false");

      unmount();
      setup();

      const remountedSelectButton = await screen.findByRole("button", {
        name: FIRST_SECTION.name,
      });

      expect(remountedSelectButton).toHaveAttribute("aria-current", "false");
    });

    it("moves the selection to the clicked card and keeps it when that card is clicked again", async () => {
      seedSections(threadSectionFixtures);

      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      let firstSelectButton = getSelectButton(FIRST_SECTION.name);
      expect(firstSelectButton).toHaveAttribute("aria-current", "true");

      await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

      firstSelectButton = getSelectButton(FIRST_SECTION.name);
      const secondSelectButton = getSelectButton(SECOND_SECTION.name);

      expect(firstSelectButton).toHaveAttribute("aria-current", "false");
      expect(secondSelectButton).toHaveAttribute("aria-current", "true");

      await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

      expect(secondSelectButton).toHaveAttribute("aria-current", "true");
    });

    it("keeps the selection when a new section is created", async () => {
      seedSections(threadSectionFixtures);

      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      const firstSelectButton = getSelectButton(FIRST_SECTION.name);
      expect(firstSelectButton).toHaveAttribute("aria-current", "true");

      await user.click(getAddSectionButton());

      const nameInput = await screen.findByTestId(SectionFormTestId.nameInput);
      await user.type(nameInput, NEW_SECTION_NAME);

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      );

      await user.click(submitButton);
      await screen.findByRole("button", { name: NEW_SECTION_NAME });

      const selectButton = getSelectButton(FIRST_SECTION.name);
      expect(selectButton).toHaveAttribute("aria-current", "true");
    });

    it("clears the selection when the selected section is deleted", async () => {
      seedSections(threadSectionFixtures);

      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      const deletedSelectButton = getSelectButton(FIRST_SECTION.name);

      await openSectionDeleteMenu({ user, sectionName: FIRST_SECTION.name });

      const removal = waitForElementToBeRemoved(deletedSelectButton);
      await confirmSectionDelete(user);
      await removal;

      const remainingSelectButton = getSelectButton(SECOND_SECTION.name);
      expect(remainingSelectButton).toHaveAttribute("aria-current", "false");
    });

    it("keeps the selection when another section is deleted", async () => {
      seedSections(threadSectionFixtures);

      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      const deletedSelectButton = getSelectButton(SECOND_SECTION.name);

      await openSectionDeleteMenu({ user, sectionName: SECOND_SECTION.name });

      const removal = waitForElementToBeRemoved(deletedSelectButton);
      await confirmSectionDelete(user);
      await removal;

      const selectButton = getSelectButton(FIRST_SECTION.name);
      expect(selectButton).toHaveAttribute("aria-current", "true");
    });
  });
});
