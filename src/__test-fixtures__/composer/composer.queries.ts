import { screen } from "@testing-library/react";
import { sendCommand } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.commands";
import { COMPOSER_EDITOR_LABEL } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.constants";

export const getComposerEditor = () => {
  return screen.getByRole("textbox", { name: COMPOSER_EDITOR_LABEL });
};

export const getToolbarButton = (label: string) => {
  return screen.getByRole("button", { name: label });
};

export const getSendButton = () => {
  return screen.getByRole("button", { name: sendCommand.label });
};
