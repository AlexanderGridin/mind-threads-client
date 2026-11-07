import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { ThreadColumnMessage } from "../ThreadColumnMessage";

const MESSAGE = "Select a section to see its pages.";

const setup = () => {
  renderWithUIProvider(<ThreadColumnMessage message={MESSAGE} />);
};

describe("ThreadColumnMessage", () => {
  it("renders the message", () => {
    setup();

    const message = screen.getByText(MESSAGE);
    expect(message).toBeInTheDocument();
  });
});
