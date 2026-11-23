import { describe, it, expect, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  confirmDeletion,
  getRenderedPageNames,
  getRenderedSectionNames,
  mindThreadFixtures,
  openPageDeleteMenu,
  openSectionDeleteMenu,
  seedPages,
  seedSections,
  seedThreads,
  selectPageCard,
  selectSectionCard,
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { ThreadSection } from "@/types";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { getPageDeletedMessage } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils";
import { DeleteSectionModalContainer } from "@/pages/ThreadPage/components/DeleteSectionModalContainer";
import { DeletePageModalContainer } from "@/pages/ThreadPage/components/DeletePageModalContainer";
import {
  ADD_PAGE_BUTTON_LABEL,
  PAGES_COLUMN_EMPTY_MESSAGE,
  PAGES_COLUMN_HEADING,
  PAGES_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../../../ThreadColumns.constants";
import { PageListTestId } from "../components/PageList/PageList.constants";
import { PagesColumn } from "../PagesColumn";
import { SectionsColumn } from "../../SectionsColumn/SectionsColumn";

const STORED_THREAD = mindThreadFixtures[0];
const FIRST_SECTION = threadSectionFixtures[0];
const SECOND_SECTION = threadSectionFixtures[1];
const OTHER_THREAD_PAGE_NAME = sectionPageFixtures[3].name;

const EMPTY_SECTION: ThreadSection = {
  id: "section-empty",
  threadId: STORED_THREAD.id,
  name: "Empty",
  color: "#88C0D0",
  createdAt: "2026-06-23T12:00:00.000Z",
};

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <PagesColumn />
      <DeleteSectionModalContainer />
      <DeletePageModalContainer />
    </ThreadPageLoader>
  );

  return { user };
};

const getPagesColumn = () => {
  return screen.getByTestId(ThreadColumnsTestId.pagesColumn);
};

const getAddPageButton = () => {
  return within(getPagesColumn()).queryByRole("button", {
    name: ADD_PAGE_BUTTON_LABEL,
  });
};

const getPageSelectButton = (pageName: string) => {
  return within(getPagesColumn()).getByRole("button", { name: pageName });
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

describe("PagesColumn", () => {
  it("shows the no-selection message and no add button before a section is selected", () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    setup();

    const pagesColumn = getPagesColumn();
    const message = within(pagesColumn).getByText(PAGES_COLUMN_MESSAGE);
    expect(message).toBeInTheDocument();

    const addPageButton = getAddPageButton();
    expect(addPageButton).not.toBeInTheDocument();
  });

  it("shows the add button next to the heading once a section is selected", async () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

    const pagesColumn = getPagesColumn();
    const heading = within(pagesColumn).getByRole("heading", {
      level: 3,
      name: PAGES_COLUMN_HEADING,
    });

    const addPageButton = getAddPageButton();
    expect(addPageButton).toBeInTheDocument();
    expect(addPageButton).toBeEnabled();

    expect(heading.parentElement).toContainElement(addPageButton);
  });

  it("shows the empty message for a selected section without pages", async () => {
    seedSections([...threadSectionFixtures.slice(0, 2), EMPTY_SECTION]);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: EMPTY_SECTION.name });

    const pagesColumn = getPagesColumn();
    const message = within(pagesColumn).getByText(PAGES_COLUMN_EMPTY_MESSAGE);
    expect(message).toBeInTheDocument();

    expect(getRenderedPageNames()).toStrictEqual([]);
  });

  it("lists only the selected section's pages, oldest first, and switching sections switches the list", async () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

    const firstSectionPageNames = [
      sectionPageFixtures[0].name,
      sectionPageFixtures[1].name,
    ];

    expect(getRenderedPageNames()).toStrictEqual(firstSectionPageNames);

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

    const secondSectionPageNames = [sectionPageFixtures[2].name];
    expect(getRenderedPageNames()).toStrictEqual(secondSectionPageNames);
  });

  it("lists no page from another thread's section", async () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

    const renderedNames = getRenderedPageNames();
    expect(renderedNames).not.toContain(OTHER_THREAD_PAGE_NAME);
  });

  it("brings back the no-selection message after the selected section is deleted", async () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

    await openSectionDeleteMenu({ user, sectionName: SECOND_SECTION.name });
    await confirmDeletion(user);

    const message =
      await within(getPagesColumn()).findByText(PAGES_COLUMN_MESSAGE);

    expect(message).toBeInTheDocument();
  });

  it("shows the empty message after the only page of the selected section is deleted", async () => {
    const onlyPage = sectionPageFixtures[2];

    seedSections(threadSectionFixtures);
    seedPages([onlyPage]);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

    let message = within(getPagesColumn()).queryByText(
      PAGES_COLUMN_EMPTY_MESSAGE
    );

    expect(message).not.toBeInTheDocument();

    await openPageDeleteMenu({ user, pageName: onlyPage.name });
    await confirmDeletion(user);

    message = await within(getPagesColumn()).findByText(
      PAGES_COLUMN_EMPTY_MESSAGE
    );

    expect(message).toBeInTheDocument();
  });

  it("keeps the selected section listed and selected after one of its pages is deleted", async () => {
    const deletedPage = sectionPageFixtures[0];
    const remainingPage = sectionPageFixtures[1];
    const storedSectionNames = [FIRST_SECTION.name, SECOND_SECTION.name];

    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

    const selectedBeforeDelete = screen.getByRole("button", {
      name: FIRST_SECTION.name,
    });

    expect(selectedBeforeDelete).toHaveAttribute("aria-current", "true");

    await openPageDeleteMenu({ user, pageName: deletedPage.name });
    await confirmDeletion(user);

    const successNotification = await screen.findByText(
      getPageDeletedMessage(deletedPage.name)
    );

    expect(successNotification).toBeInTheDocument();
    expect(getRenderedSectionNames()).toStrictEqual(storedSectionNames);

    const selectedAfterDelete = screen.getByRole("button", {
      name: FIRST_SECTION.name,
    });

    expect(selectedAfterDelete).toHaveAttribute("aria-current", "true");

    expect(getRenderedPageNames()).toStrictEqual([remainingPage.name]);
    expect(getAddPageButton()).toBeInTheDocument();
  });

  it("places the page list inside the column's scrollable body", async () => {
    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

    const pagesColumn = getPagesColumn();
    const pageList = within(pagesColumn).getByTestId(PageListTestId.container);

    const scrollBody = pageList.parentElement;
    expect(scrollBody).toHaveStyle({ overflowY: "auto" });
  });

  it("marks the clicked page as current and moves the mark when another page is clicked", async () => {
    const firstPage = sectionPageFixtures[0];
    const secondPage = sectionPageFixtures[1];

    seedSections(threadSectionFixtures);
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: firstPage.name });

    const firstPageButton = getPageSelectButton(firstPage.name);
    expect(firstPageButton).toHaveAttribute("aria-current", "true");

    await selectPageCard({ user, pageName: secondPage.name });

    const secondPageButton = getPageSelectButton(secondPage.name);
    expect(secondPageButton).toHaveAttribute("aria-current", "true");

    const previousPageButton = getPageSelectButton(firstPage.name);
    expect(previousPageButton).toHaveAttribute("aria-current", "false");
  });
});
