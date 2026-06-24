import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { renderWithUIProvider } from "@/components/lib";
import { App } from "../App";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";

const setup = (initialPath: string = "/") => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );

  return { user };
};

describe("App", () => {
  it("renders HomePage at the root path", () => {
    setup("/");

    expect(
      screen.getByRole("heading", { name: "HomePage" })
    ).toBeInTheDocument();
  });

  it("renders ThreadPage at /threads/:threadId", () => {
    setup("/threads/42");

    expect(
      screen.getByRole("heading", { name: "ThreadPage" })
    ).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    setup("/");

    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Thread 1" })
    ).toBeInTheDocument();
  });

  it("renders the color mode toggle button", () => {
    setup("/");

    expect(
      screen.getByTestId(ColorModeButtonTestId.container)
    ).toBeInTheDocument();
  });

  it("navigates to HomePage when Home button is clicked", async () => {
    const { user } = setup("/threads/1");

    expect(
      screen.getByRole("heading", { name: "ThreadPage" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Home" }));

    expect(
      screen.getByRole("heading", { name: "HomePage" })
    ).toBeInTheDocument();
  });

  it("navigates to ThreadPage when Thread 1 button is clicked", async () => {
    const { user } = setup("/");

    expect(
      screen.getByRole("heading", { name: "HomePage" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Thread 1" }));

    expect(
      screen.getByRole("heading", { name: "ThreadPage" })
    ).toBeInTheDocument();
  });
});
