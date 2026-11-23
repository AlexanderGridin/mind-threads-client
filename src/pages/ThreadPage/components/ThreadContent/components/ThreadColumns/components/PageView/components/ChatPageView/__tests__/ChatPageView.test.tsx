import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { typeInComposer } from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { MessageComposerTestId } from "../components/MessageComposer/MessageComposer.constants";
import { sendCommand } from "../components/MessageComposer/MessageComposer.commands";
import {
  COMPOSER_MESSAGE_LOG_LABEL,
  ChatPageViewTestId,
} from "../ChatPageView.constants";
import { ChatPageView } from "../ChatPageView";

const MESSAGE_TEXT = "Hello";
const MESSAGE_CONTENT = "<p>Hello</p>";

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(<ChatPageView />);

  return { user };
};

const getChatView = () => {
  return screen.getByTestId(ChatPageViewTestId.container);
};

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ChatPageView", () => {
  it("renders the message composer", () => {
    setup();

    const chatView = getChatView();
    const composer = within(chatView).getByTestId(
      MessageComposerTestId.container
    );

    expect(composer).toBeInTheDocument();
  });

  it("logs the sent message to the console", async () => {
    const { user } = setup();

    await typeInComposer({ user, text: MESSAGE_TEXT });

    const sendButton = screen.getByRole("button", { name: sendCommand.label });
    await user.click(sendButton);

    expect(console.log).toHaveBeenCalledExactlyOnceWith(
      COMPOSER_MESSAGE_LOG_LABEL,
      { content: MESSAGE_CONTENT, tags: [] }
    );
  });

  it("shows nothing of the sent message after sending", async () => {
    const { user } = setup();

    await typeInComposer({ user, text: MESSAGE_TEXT });

    const sendButton = screen.getByRole("button", { name: sendCommand.label });
    await user.click(sendButton);

    const sentText = screen.queryByText(MESSAGE_TEXT);
    expect(sentText).not.toBeInTheDocument();
  });
});
