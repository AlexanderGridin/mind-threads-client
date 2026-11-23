import type { ComposerMessage } from "./components/MessageComposer/MessageComposer.types";
import { COMPOSER_MESSAGE_LOG_LABEL } from "./ChatPageView.constants";

export const logComposerMessage = (message: ComposerMessage) => {
  console.log(COMPOSER_MESSAGE_LOG_LABEL, message);
};
