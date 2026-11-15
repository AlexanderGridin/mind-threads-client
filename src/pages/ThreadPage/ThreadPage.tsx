import { useParams } from "react-router";
import {
  AddPageModalContainer,
  AddSectionModalContainer,
  DeletePageModalContainer,
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
      <AddPageModalContainer />
      <DeleteSectionModalContainer />
      <DeletePageModalContainer />
    </ThreadPageLoader>
  );
};
