import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { PageTypeIcon } from "../PageTypeIcon";
import { PageTypeIconTestId } from "../PageTypeIcon.constants";

const setup = () => {
  renderWithUIProvider(<PageTypeIcon type="chat" />);
};

describe("PageTypeIcon", () => {
  it("renders the chat icon with an svg inside", () => {
    setup();

    const icon = screen.getByTestId(PageTypeIconTestId.chat);
    expect(icon).toBeInTheDocument();

    const svg = icon.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
