import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  getRenderedPageNames,
  sectionPageFixtures,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import type { SectionPage } from "@/types";
import { PageList } from "../PageList";
import { PageCardTestId } from "../../PageCard/PageCard.constants";

const SECTION_PAGES: SectionPage[] = sectionPageFixtures.filter((page) => {
  return page.sectionId === threadSectionFixtures[0].id;
});

const LAST_CREATED_INDEX = 1;
const LAST_CREATED_PAGE = SECTION_PAGES[LAST_CREATED_INDEX];

type SetupParams = {
  pages?: SectionPage[];
  lastCreatedPageId?: string | null;
};

const setup = ({
  pages = SECTION_PAGES,
  lastCreatedPageId = null,
}: SetupParams = {}) => {
  renderWithUIProvider(
    <PageList pages={pages} lastCreatedPageId={lastCreatedPageId} />
  );
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
});
