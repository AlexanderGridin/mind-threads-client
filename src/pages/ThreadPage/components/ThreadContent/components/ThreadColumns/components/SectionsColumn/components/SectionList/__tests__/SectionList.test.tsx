import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  getRenderedSectionNames,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { ThreadSection } from "@/types";
import { SectionList } from "../SectionList";
import { SectionCardTestId } from "../../SectionCard/SectionCard.constants";

const SECTIONS: ThreadSection[] = threadSectionFixtures;

const SECTION_NAMES = SECTIONS.map((section) => {
  return section.name;
});

const LAST_CREATED_INDEX = 1;
const LAST_CREATED_SECTION = SECTIONS[LAST_CREATED_INDEX];

type SetupParams = {
  sections?: ThreadSection[];
  lastCreatedSectionId?: string | null;
};

const setup = ({
  sections = SECTIONS,
  lastCreatedSectionId = null,
}: SetupParams = {}) => {
  renderWithUIProvider(
    <SectionList
      sections={sections}
      lastCreatedSectionId={lastCreatedSectionId}
    />
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SectionList", () => {
  it("renders one card per section, in the given order", () => {
    setup();

    const renderedNames = getRenderedSectionNames();
    expect(renderedNames).toStrictEqual(SECTION_NAMES);
  });

  it("scrolls only the card of the last created section into view", () => {
    setup({ lastCreatedSectionId: LAST_CREATED_SECTION.id });

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    const cards = screen.getAllByTestId(SectionCardTestId.container);

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView.mock.contexts[0]).toBe(cards[LAST_CREATED_INDEX]);
  });
});
