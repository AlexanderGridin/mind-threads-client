import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getRenderedPageNames,
  openPageDeleteMenu,
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { SectionPage } from "@/types";
import { PageList } from "../PageList";
import { PageCardTestId } from "../../PageCard/PageCard.constants";
import { getPageActionsLabel } from "../../PageCard/components/PageCardActions/PageCardActions.utils";

const SECTION_PAGES: SectionPage[] = sectionPageFixtures.filter((page) => {
  return page.sectionId === threadSectionFixtures[0].id;
});

const LAST_CREATED_INDEX = 1;
const LAST_CREATED_PAGE = SECTION_PAGES[LAST_CREATED_INDEX];

type SetupParams = {
  pages?: SectionPage[];
  lastCreatedPageId?: string | null;
  selectedPageId?: string | null;
};

const setup = ({
  pages = SECTION_PAGES,
  lastCreatedPageId = null,
  selectedPageId = null,
}: SetupParams = {}) => {
  const user = userEvent.setup();
  const onDeletePage = vi.fn();
  const onSelectPage = vi.fn();

  renderWithUIProvider(
    <PageList
      pages={pages}
      lastCreatedPageId={lastCreatedPageId}
      selectedPageId={selectedPageId}
      onSelectPage={onSelectPage}
      onDeletePage={onDeletePage}
    />
  );

  return { user, onDeletePage, onSelectPage };
};

const getSelectButton = (pageName: string) => {
  return screen.getByRole("button", { name: pageName });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageList", () => {
  it("renders the pages in the given order", () => {
    setup();

    const renderedNames = getRenderedPageNames();
    const expectedNames = SECTION_PAGES.map((page) => {
      return page.name;
    });

    expect(renderedNames).toStrictEqual(expectedNames);
  });

  it("scrolls only the card of the last created page into view", () => {
    setup({ lastCreatedPageId: LAST_CREATED_PAGE.id });

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    const cards = screen.getAllByTestId(PageCardTestId.container);

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView.mock.contexts[0]).toBe(cards[LAST_CREATED_INDEX]);
  });

  it("gives every card its own actions button", () => {
    setup();

    const cards = screen.getAllByTestId(PageCardTestId.container);
    const actionsButtons = SECTION_PAGES.map((page) => {
      return screen.getByRole("button", {
        name: getPageActionsLabel(page.name),
      });
    });

    expect(actionsButtons).toHaveLength(cards.length);
  });

  it("calls onDeletePage with the page of the card whose Delete is selected", async () => {
    const context = setup();
    const secondPage = SECTION_PAGES[1];

    await openPageDeleteMenu({ user: context.user, pageName: secondPage.name });

    expect(context.onDeletePage).toHaveBeenCalledOnce();
    expect(context.onDeletePage).toHaveBeenCalledWith(secondPage);
  });

  it("marks only the card of the selected page as current", () => {
    const selectedPage = SECTION_PAGES[1];

    setup({ selectedPageId: selectedPage.id });

    const selectedButton = getSelectButton(selectedPage.name);
    expect(selectedButton).toHaveAttribute("aria-current", "true");

    const otherPage = SECTION_PAGES[0];
    const otherButton = getSelectButton(otherPage.name);
    expect(otherButton).toHaveAttribute("aria-current", "false");
  });

  it("calls onSelectPage with the page id of the card that is clicked", async () => {
    const context = setup();
    const secondPage = SECTION_PAGES[1];

    const secondButton = getSelectButton(secondPage.name);
    await context.user.click(secondButton);

    expect(context.onSelectPage).toHaveBeenCalledOnce();
    expect(context.onSelectPage).toHaveBeenCalledWith(secondPage.id);
  });
});
