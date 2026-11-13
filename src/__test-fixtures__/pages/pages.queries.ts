import { screen } from "@testing-library/react";
import { PageCardTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.constants";

export const getRenderedPageNames = () => {
  return screen.queryAllByTestId(PageCardTestId.name).map((nameElement) => {
    return nameElement.textContent;
  });
};
