import { describe, it, expect, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  getRenderedSectionNames,
  mindThreadFixtures,
  seedSections,
  seedThreads,
  threadSectionFixtures,
} from "@/__test-fixtures__";
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

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <AddSectionModalContainer />
    </ThreadPageLoader>
  );

  return { user };
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
});
