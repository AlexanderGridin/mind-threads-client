import { render, screen } from "@testing-library/react";
import { HomePage } from "../HomePage";

const setup = () => {
  render(<HomePage />);
};

describe("HomePage", () => {
  it("renders the page heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "HomePage" })
    ).toBeInTheDocument();
  });
});
