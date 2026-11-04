import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  FullScreenLoader,
  type FullScreenLoaderProps,
} from "../FullScreenLoader";
import { renderWithUIProvider } from "../../utils";

const LOADER_LABEL = "Loading thread";

const setup = (props: Partial<FullScreenLoaderProps> = {}) => {
  const defaultProps: FullScreenLoaderProps = {
    shown: true,
    label: LOADER_LABEL,
    ...props,
  };

  return renderWithUIProvider(<FullScreenLoader {...defaultProps} />);
};

describe("FullScreenLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a status element named by the label", () => {
    setup();

    const loader = screen.getByRole("status", { name: LOADER_LABEL });
    expect(loader).toBeInTheDocument();
  });

  it("covers the whole page with a fixed position", () => {
    setup();

    const loader = screen.getByRole("status", { name: LOADER_LABEL });
    expect(loader).toHaveStyle({ position: "fixed" });
  });

  it("renders nothing when shown is false", () => {
    setup({ shown: false });

    const loader = screen.queryByRole("status", { name: LOADER_LABEL });
    expect(loader).not.toBeInTheDocument();
  });
});
