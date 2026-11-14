import { AddIconButton } from "@/components/lib";
import {
  useThreadPageAction,
  useThreadPageValue,
} from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadColumnMessage } from "../ThreadColumnMessage";
import { ThreadColumn } from "../ThreadColumn";
import { SectionList } from "./components";
import {
  ADD_SECTION_BUTTON_LABEL,
  SECTIONS_COLUMN_HEADING,
  SECTIONS_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../../ThreadColumns.constants";

export const SectionsColumn = () => {
  const { sections, lastCreatedSectionId, selectedSection } =
    useThreadPageValue();

  const { openAddSectionModal, openDeleteSectionModal, selectSection } =
    useThreadPageAction();

  return (
    <ThreadColumn
      data-testid={ThreadColumnsTestId.sectionsColumn}
      heading={SECTIONS_COLUMN_HEADING}
      headerAction={
        <AddIconButton
          data-testid={ThreadColumnsTestId.addSectionButton}
          tooltipLabel={ADD_SECTION_BUTTON_LABEL}
          onClick={openAddSectionModal}
        />
      }
    >
      {sections.length ? (
        <SectionList
          sections={sections}
          lastCreatedSectionId={lastCreatedSectionId}
          selectedSectionId={selectedSection ? selectedSection.id : null}
          onSelectSection={selectSection}
          onDeleteSection={openDeleteSectionModal}
        />
      ) : (
        <ThreadColumnMessage message={SECTIONS_COLUMN_MESSAGE} />
      )}
    </ThreadColumn>
  );
};
