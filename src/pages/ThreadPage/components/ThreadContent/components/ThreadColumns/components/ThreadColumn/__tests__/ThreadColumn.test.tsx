import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadColumn } from "../ThreadColumn";

const COLUMN_TEST_ID = "ThreadColumn__test";
const COLUMN_HEADING = "Sections";
const COLUMN_MESSAGE = "No sections yet.";

type SetupParams = {
  heading?: string;
  isCentered?: boolean;
};

const setup = ({ heading, isCentered }: SetupParams) => {
  renderWithUIProvider(
    <ThreadColumn
      data-testid={COLUMN_TEST_ID}
      heading={heading}
      message={COLUMN_MESSAGE}
      isCentered={isCentered}
    />
  );
};

describe("ThreadColumn", () => {
  it("renders the heading and the message", () => {
    setup({ heading: COLUMN_HEADING });

    const heading = screen.getByRole("heading", {
      level: 3,
      name: COLUMN_HEADING,
    });

    const message = screen.getByText(COLUMN_MESSAGE);

    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it("renders no heading when none is given", () => {
    setup({});

    const heading = screen.queryByRole("heading");
    expect(heading).not.toBeInTheDocument();
  });

  it("aligns the content to the start by default", () => {
    setup({});

    const column = screen.getByTestId(COLUMN_TEST_ID);

    expect(column).toHaveStyle({
      alignItems: "flex-start",
      justifyContent: "flex-start",
    });
  });

  it("centers the content when isCentered is set", () => {
    setup({ isCentered: true });

    const column = screen.getByTestId(COLUMN_TEST_ID);

    expect(column).toHaveStyle({
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
