import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";

const setup = () => {
  const user = userEvent.setup();

  render(<App />);

  return { user };
};

describe("App", () => {
  it("renders the button and heading by default", () => {
    setup();

    const button = screen.getByRole("button", { name: "Toggle visibility" });

    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe("Toggle visibility");
    expect(button).toBeEnabled();

    const heading = screen.getByRole("heading", { name: "MindThreads" });

    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("MindThreads");
  });

  it("hides the heading when the toggle button is clicked", async () => {
    const { user } = setup();

    expect(
      screen.getByRole("heading", { name: "MindThreads" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle visibility" }));

    expect(
      screen.queryByRole("heading", { name: "MindThreads" }),
    ).not.toBeInTheDocument();
  });

  it("shows the heading again when the toggle button is clicked a second time", async () => {
    const { user } = setup();
    const button = screen.getByRole("button", { name: "Toggle visibility" });

    expect(
      screen.getByRole("heading", { name: "MindThreads" }),
    ).toBeInTheDocument();

    await user.click(button);

    expect(
      screen.queryByRole("heading", { name: "MindThreads" }),
    ).not.toBeInTheDocument();

    await user.click(button);

    expect(
      screen.getByRole("heading", { name: "MindThreads" }),
    ).toBeInTheDocument();
  });

  const checkButtonState = (button: HTMLElement): void => {
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName("Toggle visibility");
    expect(button).toBeEnabled();
  };

  it("button remains interactive and accessible in both visible and hidden states", async () => {
    const { user } = setup();
    const button = screen.getByRole("button", { name: "Toggle visibility" });

    checkButtonState(button);

    await user.click(button);
    checkButtonState(button);

    await user.click(button);
    checkButtonState(button);
  });
});
