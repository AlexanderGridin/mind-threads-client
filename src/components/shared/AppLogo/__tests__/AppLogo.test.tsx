import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { AppLogo } from "../AppLogo";
import { AppLogoTestId } from "../AppLogo.constants";

const setup = () => {
  renderWithUIProvider(<AppLogo />);
};

describe("AppLogo", () => {
  it("renders properly", () => {
    setup();

    expect(screen.getByTestId(AppLogoTestId.container)).toBeInTheDocument();
    expect(screen.getByTestId(AppLogoTestId.icon)).toBeInTheDocument();

    expect(screen.getByTestId(AppLogoTestId.text)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mind Threads" })
    ).toBeInTheDocument();
  });
});
