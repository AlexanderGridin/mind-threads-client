import { screen } from "@testing-library/react";
import { SectionCardTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.constants";

export const getRenderedSectionNames = () => {
  return screen.queryAllByTestId(SectionCardTestId.name).map((nameElement) => {
    return nameElement.textContent;
  });
};
