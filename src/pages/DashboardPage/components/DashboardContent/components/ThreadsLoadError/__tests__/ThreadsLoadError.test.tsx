import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadsLoadError } from "../ThreadsLoadError";
import {
  THREADS_LOAD_ERROR_MESSAGE,
  ThreadsLoadErrorTestId,
} from "../ThreadsLoadError.constants";

const setup = () => {
  renderWithUIProvider(<ThreadsLoadError />);
};

describe("ThreadsLoadError", () => {
  it("renders the container with the exact load error message", async () => {
    setup();

    const container = await screen.findByTestId(
      ThreadsLoadErrorTestId.container
    );

    expect(container).toBeInTheDocument();

    const message = screen.getByTestId(ThreadsLoadErrorTestId.message);
    expect(message).toBeInTheDocument();
    expect(message.textContent).toBe(THREADS_LOAD_ERROR_MESSAGE);
  });
});
