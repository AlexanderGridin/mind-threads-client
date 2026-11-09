import { useParams } from "react-router";
import {
  AddSectionModalContainer,
  DeleteSectionModalContainer,
  ThreadPageLayout,
  ThreadPageLoader,
} from "./components";

export const ThreadPage = () => {
  const { threadId = "" } = useParams();

  return (
    <ThreadPageLoader threadId={threadId}>
      <ThreadPageLayout />

      <AddSectionModalContainer />
      <DeleteSectionModalContainer />
    </ThreadPageLoader>
  );
};
