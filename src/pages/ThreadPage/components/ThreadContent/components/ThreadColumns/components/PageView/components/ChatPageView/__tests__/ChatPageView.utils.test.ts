import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import type { ComposerMessage } from "../components/MessageComposer/MessageComposer.types";
import { COMPOSER_MESSAGE_LOG_LABEL } from "../ChatPageView.constants";
import { logComposerMessage } from "../ChatPageView.utils";

const MESSAGE: ComposerMessage = {
  content: "<p>Hi</p>",
  tags: ["ideas"],
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ChatPageView utils", () => {
  describe("logComposerMessage", () => {
    it("logs the message with the composer log label", () => {
      logComposerMessage(MESSAGE);

      expect(console.log).toHaveBeenCalledExactlyOnceWith(
        COMPOSER_MESSAGE_LOG_LABEL,
        MESSAGE
      );
    });
  });
});
