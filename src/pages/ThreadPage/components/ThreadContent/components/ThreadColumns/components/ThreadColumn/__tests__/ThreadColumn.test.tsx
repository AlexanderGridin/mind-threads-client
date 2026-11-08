import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { ThreadColumn } from "../ThreadColumn";

const COLUMN_TEST_ID = "ThreadColumn__test";
const COLUMN_HEADING = "Sections";
const COLUMN_CONTENT = "No sections yet.";
const HEADER_ACTION_TEST_ID = "ThreadColumn__header-action";
const HEADER_ACTION_LABEL = "Add section";

type SetupParams = {
  heading?: string;
  isCentered?: boolean;
  headerAction?: ReactNode;
};

const setup = ({ heading, isCentered, headerAction }: SetupParams = {}) => {
  renderWithUIProvider(
    <ThreadColumn
      data-testid={COLUMN_TEST_ID}
      heading={heading}
      isCentered={isCentered}
      headerAction={headerAction}
    >
      {COLUMN_CONTENT}
    </ThreadColumn>
  );
};

const getHeaderAction = () => {
  return screen.queryByTestId(HEADER_ACTION_TEST_ID);
};

const renderHeaderAction = () => {
  return (
    <button data-testid={HEADER_ACTION_TEST_ID}>{HEADER_ACTION_LABEL}</button>
  );
};

describe("ThreadColumn", () => {
  it("renders the heading and the children", () => {
    setup({ heading: COLUMN_HEADING });

    const heading = screen.getByRole("heading", {
      level: 3,
      name: COLUMN_HEADING,
    });
    const content = screen.getByText(COLUMN_CONTENT);

    expect(heading).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it("renders no heading when none is given", () => {
    setup({});

    const heading = screen.queryByRole("heading");
    expect(heading).not.toBeInTheDocument();
  });

  it("renders the children inside the column", () => {
    setup({ heading: COLUMN_HEADING });

    const column = screen.getByTestId(COLUMN_TEST_ID);
    const content = screen.getByText(COLUMN_CONTENT);

    expect(column).toContainElement(content);
  });

  it("renders the header action next to the heading", () => {
    setup({ heading: COLUMN_HEADING, headerAction: renderHeaderAction() });

    const heading = screen.getByRole("heading", {
      level: 3,
      name: COLUMN_HEADING,
    });

    const headerAction = getHeaderAction();

    expect(headerAction).toBeInTheDocument();
    expect(heading.parentElement).toContainElement(headerAction);
  });

  it("does not render the header action when there is no heading", () => {
    setup({ headerAction: renderHeaderAction() });

    const headerAction = getHeaderAction();
    expect(headerAction).not.toBeInTheDocument();
  });

  it("stretches the content and aligns it to the start by default", () => {
    setup({});

    const body = screen.getByText(COLUMN_CONTENT);

    expect(body).toHaveStyle({
      alignItems: "stretch",
      justifyContent: "flex-start",
    });
  });

  it("centers the content when isCentered is set", () => {
    setup({ isCentered: true });

    const body = screen.getByText(COLUMN_CONTENT);

    expect(body).toHaveStyle({
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
