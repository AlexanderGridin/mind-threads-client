import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  getRenderedSectionNames,
  openSectionDeleteMenu,
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
  onDeleteSection?: (section: ThreadSection) => void;
};

const setup = ({
  sections = SECTIONS,
  lastCreatedSectionId = null,
  onDeleteSection = vi.fn(),
}: SetupParams = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <SectionList
      sections={sections}
      lastCreatedSectionId={lastCreatedSectionId}
      onDeleteSection={onDeleteSection}
    />
  );

  return { user, onDeleteSection };
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

  it("shows an actions button on every card", () => {
    setup();

    const actionsButtons = screen.getAllByRole("button", {
      name: /^Section actions for /,
    });

    expect(actionsButtons).toHaveLength(SECTIONS.length);
  });

  it("calls onDeleteSection with the card's own section when its Delete item is selected", async () => {
    const { user, onDeleteSection } = setup();

    await openSectionDeleteMenu({
      user,
      sectionName: LAST_CREATED_SECTION.name,
    });

    expect(onDeleteSection).toHaveBeenCalledOnce();
    expect(onDeleteSection).toHaveBeenCalledWith(LAST_CREATED_SECTION);
  });
});
