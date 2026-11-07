import { screen } from "@testing-library/react";
import { ColorModeIcon } from "../ColorModeIcon";
import { renderWithUIProvider } from "../../../../__test-fixtures__";
import { ColorModeIconTestId } from "../ColorModeIcon.constants";

const mockUseColorModeReturn = {
  colorMode: "light",
};

vi.mock("../../../color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  renderWithUIProvider(<ColorModeIcon />);
};

beforeEach(() => {
  vi.clearAllMocks();

  mockUseColorModeReturn.colorMode = "light";
});

describe("ColorModeIcon", () => {
  it("renders the light icon when useColorMode returns the 'light' colorMode", () => {
    setup();

    const lightIcon = screen.getByTestId(ColorModeIconTestId.lightIcon);
    const darkIcon = screen.queryByTestId(ColorModeIconTestId.darkIcon);

    expect(lightIcon).toBeInTheDocument();
    expect(darkIcon).not.toBeInTheDocument();
  });

  it("renders the dark icon when useColorMode returns the 'dark' colorMode", () => {
    mockUseColorModeReturn.colorMode = "dark";
    setup();

    const lightIcon = screen.queryByTestId(ColorModeIconTestId.lightIcon);
    const darkIcon = screen.getByTestId(ColorModeIconTestId.darkIcon);

    expect(darkIcon).toBeInTheDocument();
    expect(lightIcon).not.toBeInTheDocument();
  });
});
