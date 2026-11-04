import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
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

const setup = () => {
  renderWithUIProvider(<ThreadColumns />);
};

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

    expect(contentColumn).toHaveStyle({
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
