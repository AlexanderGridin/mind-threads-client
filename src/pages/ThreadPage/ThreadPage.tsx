import { useParams } from "react-router";
import {
  AddSectionModalContainer,
  ThreadPageLayout,
  ThreadPageLoader,
} from "./components";

export const ThreadPage = () => {
  const { threadId = "" } = useParams();

  return (
    <ThreadPageLoader threadId={threadId}>
      <ThreadPageLayout />
      <AddSectionModalContainer />
    </ThreadPageLoader>
  );
};
