import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { AppLogo } from "../AppLogo";
import { APP_NAME, AppLogoTestId } from "../AppLogo.constants";

const setup = () => {
  renderWithUIProvider(<AppLogo />);
};

describe("AppLogo", () => {
  it("renders properly", () => {
    setup();

    expect(screen.getByTestId(AppLogoTestId.container)).toBeInTheDocument();
    expect(screen.getByTestId(AppLogoTestId.icon)).toBeInTheDocument();

    expect(screen.getByTestId(AppLogoTestId.text)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: APP_NAME })).toBeInTheDocument();
  });
});
