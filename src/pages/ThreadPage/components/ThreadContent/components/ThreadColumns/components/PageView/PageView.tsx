import { useThreadPageValue } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { ThreadColumn } from "../ThreadColumn";
import { ThreadColumnMessage } from "../ThreadColumnMessage";
import {
  CONTENT_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../../ThreadColumns.constants";
import { ChatPageView } from "./components";

export const PageView = () => {
  const { selectedPage } = useThreadPageValue();

  if (!selectedPage) {
    return (
      <ThreadColumn data-testid={ThreadColumnsTestId.contentColumn} isCentered>
        <ThreadColumnMessage message={CONTENT_COLUMN_MESSAGE} />
      </ThreadColumn>
    );
  }

  return (
    <ThreadColumn
      data-testid={ThreadColumnsTestId.contentColumn}
      heading={selectedPage.name}
    >
      <ChatPageView key={selectedPage.id} page={selectedPage} />
    </ThreadColumn>
  );
};
