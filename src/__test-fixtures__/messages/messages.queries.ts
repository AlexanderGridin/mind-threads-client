import { screen } from "@testing-library/react";
import { MessageContentTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageFeed/components/MessageContent/MessageContent.constants";
import { TRY_AGAIN_LABEL } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageFeed/components/MessagesLoadError/MessagesLoadError.constants";
import { MessageItemTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageFeed/components/MessageItem/MessageItem.constants";

export const getFeedMessages = () => {
  return screen.getAllByTestId(MessageItemTestId.container);
};

export const queryFeedMessages = () => {
  return screen.queryAllByTestId(MessageItemTestId.container);
};

export const getFeedMessageContents = () => {
  return screen
    .queryAllByTestId(MessageContentTestId.container)
    .map((contentElement) => {
      return contentElement.textContent;
    });
};

export const getTryAgainButton = () => {
  return screen.getByRole("button", { name: TRY_AGAIN_LABEL });
};
