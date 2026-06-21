import { render, screen } from "@testing-library/react";
import { ThreadPage } from "../ThreadPage";

const setup = () => {
  render(<ThreadPage />);
};

describe("ThreadPage", () => {
  it("renders the page heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "ThreadPage" })
    ).toBeInTheDocument();
  });
});
