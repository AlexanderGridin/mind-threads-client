import { describe, it, expect, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  mindThreadFixtures,
  seedPages,
  seedSections,
  seedThreads,
  selectPageCard,
  selectSectionCard,
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import { PageCardTestId } from "../components/PagesColumn/components/PageCard/PageCard.constants";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadColumns } from "../ThreadColumns";
import {
  CONTENT_COLUMN_MESSAGE,
  PAGES_COLUMN_HEADING,
  PAGES_COLUMN_MESSAGE,
  SECTIONS_COLUMN_HEADING,
  SECTIONS_COLUMN_MESSAGE,
  THREAD_COLUMNS_TEMPLATE,
  ThreadColumnsTestId,
} from "../ThreadColumns.constants";

const STORED_THREAD = mindThreadFixtures[0];

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <ThreadColumns />
    </ThreadPageLoader>
  );

  return { user };
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

describe("ThreadColumns", () => {
  it("lays the columns out with the column template", () => {
    setup();

    const container = screen.getByTestId(ThreadColumnsTestId.container);

    expect(container).toHaveStyle({
      gridTemplateColumns: THREAD_COLUMNS_TEMPLATE,
    });
  });

  it("shows the sections heading and message in the sections column", () => {
    setup();

    const sectionsColumn = screen.getByTestId(
      ThreadColumnsTestId.sectionsColumn
    );

    const heading = within(sectionsColumn).getByRole("heading", {
      level: 3,
      name: SECTIONS_COLUMN_HEADING,
    });

    const message = within(sectionsColumn).getByText(SECTIONS_COLUMN_MESSAGE);

    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it("shows the pages heading and message in the pages column", () => {
    setup();

    const pagesColumn = screen.getByTestId(ThreadColumnsTestId.pagesColumn);
    const heading = within(pagesColumn).getByRole("heading", {
      level: 3,
      name: PAGES_COLUMN_HEADING,
    });

    const message = within(pagesColumn).getByText(PAGES_COLUMN_MESSAGE);

    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it("shows only the centered message in the content column", () => {
    setup();

    const contentColumn = screen.getByTestId(ThreadColumnsTestId.contentColumn);

    const heading = within(contentColumn).queryByRole("heading");
    const message = within(contentColumn).getByText(CONTENT_COLUMN_MESSAGE);

    expect(heading).not.toBeInTheDocument();
    expect(message).toBeInTheDocument();

    const body = message.parentElement;

    expect(body).toHaveStyle({
      alignItems: "center",
      justifyContent: "center",
    });
  });

  describe("page view", () => {
    const FIRST_SECTION = threadSectionFixtures[0];
    const SECOND_SECTION = threadSectionFixtures[1];
    const FIRST_PAGE = sectionPageFixtures[0];

    beforeEach(() => {
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);
    });

    it("shows the selected page view in the content column, next to the sections and pages columns", async () => {
      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
      await selectPageCard({ user, pageName: FIRST_PAGE.name });

      const contentColumn = screen.getByTestId(
        ThreadColumnsTestId.contentColumn
      );

      const heading = within(contentColumn).getByRole("heading", {
        level: 3,
        name: FIRST_PAGE.name,
      });

      expect(heading).toBeInTheDocument();

      const sectionsColumn = screen.getByTestId(
        ThreadColumnsTestId.sectionsColumn
      );

      const pagesColumn = screen.getByTestId(ThreadColumnsTestId.pagesColumn);

      expect(sectionsColumn).toBeInTheDocument();
      expect(pagesColumn).toBeInTheDocument();
    });

    it("brings back the no-selection message when another section is selected, and keeps it when the first section is selected again", async () => {
      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
      await selectPageCard({ user, pageName: FIRST_PAGE.name });

      await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

      const contentColumn = screen.getByTestId(
        ThreadColumnsTestId.contentColumn
      );

      const messageAfterSwitch = within(contentColumn).getByText(
        CONTENT_COLUMN_MESSAGE
      );

      expect(messageAfterSwitch).toBeInTheDocument();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      const messageAfterReturn = within(contentColumn).getByText(
        CONTENT_COLUMN_MESSAGE
      );

      expect(messageAfterReturn).toBeInTheDocument();

      const selectedPageButtons = screen
        .queryAllByTestId(PageCardTestId.selectButton)
        .filter((selectButton) => {
          return selectButton.getAttribute("aria-current") === "true";
        });

      expect(selectedPageButtons).toHaveLength(0);
    });

    it("keeps the page view when the selected section is clicked again", async () => {
      const { user } = setup();

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
      await selectPageCard({ user, pageName: FIRST_PAGE.name });

      await selectSectionCard({ user, sectionName: FIRST_SECTION.name });

      const contentColumn = screen.getByTestId(
        ThreadColumnsTestId.contentColumn
      );

      const heading = within(contentColumn).getByRole("heading", {
        level: 3,
        name: FIRST_PAGE.name,
      });

      expect(heading).toBeInTheDocument();
    });
  });
});
