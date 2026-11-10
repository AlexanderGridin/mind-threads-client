import { AddIconButton } from "@/components/lib";
import {
  useThreadPageAction,
  useThreadPageValue,
} from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadColumn } from "../ThreadColumn";
import { PagesColumnContent } from "./components";
import {
  ADD_PAGE_BUTTON_LABEL,
  PAGES_COLUMN_HEADING,
  ThreadColumnsTestId,
} from "../../ThreadColumns.constants";

export const PagesColumn = () => {
  const { selectedSection, pages, lastCreatedPageId } = useThreadPageValue();
  const { openAddPageModal } = useThreadPageAction();

  return (
    <ThreadColumn
      data-testid={ThreadColumnsTestId.pagesColumn}
      heading={PAGES_COLUMN_HEADING}
      headerAction={
        selectedSection ? (
          <AddIconButton
            data-testid={ThreadColumnsTestId.addPageButton}
            tooltipLabel={ADD_PAGE_BUTTON_LABEL}
            onClick={openAddPageModal}
          />
        ) : null
      }
    >
      <PagesColumnContent
        selectedSection={selectedSection}
        pages={pages}
        lastCreatedPageId={lastCreatedPageId}
      />
    </ThreadColumn>
  );
};
