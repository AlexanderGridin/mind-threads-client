import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ColorModeButton } from "../ColorModeButton";
import { renderWithUIProvider } from "../../../../utils";
import { ColorModeButtonTestId } from "../ColorModeButton.constants";

const mockUseColorModeReturn = {
  toggleColorMode: vi.fn(),
};

vi.mock("../../../color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  const user = userEvent.setup();
  renderWithUIProvider(<ColorModeButton />);
  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ColorModeButton", () => {
  it("renders the button properly", async () => {
    setup();

    const button = await screen.findByTestId(ColorModeButtonTestId.container);

    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName("Toggle color mode");
  });

  it("should call toggleColorMode when clicked", async () => {
    const { user } = setup();

    const button = screen.getByTestId(ColorModeButtonTestId.container);
    await user.click(button);

    expect(mockUseColorModeReturn.toggleColorMode).toHaveBeenCalledOnce();
  });
});
