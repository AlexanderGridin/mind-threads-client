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
});
