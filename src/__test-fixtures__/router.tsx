import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { AppPath } from "@/routing/routing.constants";
import { LocationMarker } from "./LocationMarker";

type RenderWithRouterParams = {
  ui: ReactElement;
  path?: string;
  initialPath?: string;
};

export const renderWithRouter = ({
  ui,
  path = AppPath.Dashboard,
  initialPath = path,
}: RenderWithRouterParams) => {
  const router = createMemoryRouter(
    [
      { path, element: ui },
      { path: "*", element: <LocationMarker /> },
    ],
    { initialEntries: [initialPath] }
  );

  const renderResult = renderWithUIProvider(<RouterProvider router={router} />);

  return { router, ...renderResult };
};
