import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  chatMessageFixtures,
  getComposerEditor,
  getFeedMessageContents,
  getFeedMessages,
  isFollowing,
  mindThreadFixtures,
  seedMessages,
  seedPages,
  seedSections,
  seedThreads,
  selectPageCard,
  selectSectionCard,
  sectionPageFixtures,
  sendComposerMessage,
  stubVirtualizerLayout,
  threadSectionFixtures,
  typeInComposer,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import {
  CONTENT_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../../../ThreadColumns.constants";
import { MessageComposerTestId } from "../components/ChatPageView/components/MessageComposer/MessageComposer.constants";
import { PageView } from "../PageView";
import { PagesColumn } from "../../PagesColumn/PagesColumn";
import { SectionsColumn } from "../../SectionsColumn/SectionsColumn";

const STORED_THREAD = mindThreadFixtures[0];
const FIRST_SECTION = threadSectionFixtures[0];
const FIRST_PAGE = sectionPageFixtures[0];
const SECOND_PAGE = sectionPageFixtures[1];
const DRAFT_TEXT = "Draft idea";
const SENT_TEXT = "Hello";
const FIRST_PAGE_NOTE_TEXT = "A note without tags";
const FIRST_PAGE_BOLD_TEXT = "Bold idea for the page";
const SECOND_PAGE_MESSAGE_TEXT = "Message on the second page";

const setup = () => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <PagesColumn />
      <PageView />
    </ThreadPageLoader>
  );

  return { user, unmount: renderResult.unmount };
};

const getContentColumn = () => {
  return screen.getByTestId(ThreadColumnsTestId.contentColumn);
};

const getComposerContainer = () => {
  return within(getContentColumn()).getByTestId(
    MessageComposerTestId.container
  );
};

const queryComposerContainer = () => {
  return within(getContentColumn()).queryByTestId(
    MessageComposerTestId.container
  );
};

const getPageHeading = (pageName: string) => {
  return within(getContentColumn()).getByRole("heading", {
    level: 3,
    name: pageName,
  });
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
  seedSections(threadSectionFixtures);
  seedPages(sectionPageFixtures);
  seedMessages(chatMessageFixtures);

  stubVirtualizerLayout();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageView", () => {
  it("shows the hint and no composer when no page is selected", () => {
    setup();

    const message = within(getContentColumn()).getByText(
      CONTENT_COLUMN_MESSAGE
    );

    expect(message).toBeInTheDocument();

    const composer = queryComposerContainer();
    expect(composer).not.toBeInTheDocument();
  });

  it("shows the selected page name as a heading above the composer", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });

    const heading = getPageHeading(FIRST_PAGE.name);
    const composer = getComposerContainer();

    expect(composer).toBeInTheDocument();

    const composerFollowsHeading = isFollowing({
      element: composer,
      previousElement: heading,
    });

    expect(composerFollowsHeading).toBe(true);
  });

  it("replaces the heading when another page is selected", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });
    await selectPageCard({ user, pageName: SECOND_PAGE.name });

    const heading = getPageHeading(SECOND_PAGE.name);
    expect(heading).toBeInTheDocument();
  });

  it("starts with an empty composer after switching pages and back", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });
    await typeInComposer({ user, text: DRAFT_TEXT });

    await selectPageCard({ user, pageName: SECOND_PAGE.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });

    const editor = getComposerEditor();
    expect(editor.textContent).toBe("");
  });

  it("shows only the selected page's messages", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });

    const firstPageNote = await screen.findByText(FIRST_PAGE_NOTE_TEXT);
    const otherPageMessage = screen.queryByText(SECOND_PAGE_MESSAGE_TEXT);

    expect(firstPageNote).toBeInTheDocument();
    expect(otherPageMessage).not.toBeInTheDocument();

    await selectPageCard({ user, pageName: SECOND_PAGE.name });

    const secondPageMessage = await screen.findByText(SECOND_PAGE_MESSAGE_TEXT);
    const staleFirstPageNote = screen.queryByText(FIRST_PAGE_NOTE_TEXT);

    expect(secondPageMessage).toBeInTheDocument();
    expect(staleFirstPageNote).not.toBeInTheDocument();
  });

  it("keeps a sent message in order after the tree is rendered again", async () => {
    const { user, unmount } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await selectPageCard({ user, pageName: FIRST_PAGE.name });

    await waitFor(() => {
      expect(getFeedMessages()).toHaveLength(2);
    });

    await sendComposerMessage({ user, text: SENT_TEXT });

    await waitFor(() => {
      expect(getFeedMessages()).toHaveLength(3);
    });

    unmount();

    const { user: reloadedUser } = setup();

    await selectSectionCard({
      user: reloadedUser,
      sectionName: FIRST_SECTION.name,
    });

    await selectPageCard({ user: reloadedUser, pageName: FIRST_PAGE.name });

    await waitFor(() => {
      expect(getFeedMessages()).toHaveLength(3);
    });

    expect(getFeedMessageContents()).toStrictEqual([
      SENT_TEXT,
      FIRST_PAGE_BOLD_TEXT,
      FIRST_PAGE_NOTE_TEXT,
    ]);
  });
});
