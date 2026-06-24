import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { HomePage } from "../HomePage";

const setup = () => {
  renderWithUIProvider(<HomePage />);
};

describe("HomePage", () => {
  it("renders the page heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "HomePage" })
    ).toBeInTheDocument();
  });

  it("renders the color mode label", () => {
    setup();

    expect(
      screen.getByText(/light mode is active|dark mode is active/i)
    ).toBeInTheDocument();
  });
});
