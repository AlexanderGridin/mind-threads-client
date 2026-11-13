import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseColor } from "@chakra-ui/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  ColorPickerTestId,
  DEFAULT_SWATCH_COLOR,
  NORD_AURORA_SWATCHES,
} from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  createServicesMock,
  dispatchStorageChange,
  getRenderedPageNames,
  mindThreadFixtures,
  openAddPageModal,
  readStoredPages,
  resetThreadsServiceOverrides,
  seedPages,
  seedSections,
  seedThreads,
  selectSectionCard,
  sectionPageFixtures,
  threadSectionFixtures,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import {
  PAGES_COLUMN_EMPTY_MESSAGE,
  ThreadColumnsTestId,
} from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import {
  PagesColumn,
  SectionsColumn,
} from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components";
import { PageCardTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.constants";
import {
  getPageCreatedMessage,
  SAVE_PAGE_ERROR_MESSAGE,
  ThreadPageLoader,
} from "../../ThreadPageLoader";
import { AddPageModalContainer } from "../AddPageModalContainer";
import { ADD_PAGE_MODAL_TITLE } from "../components/AddPageModal/AddPageModal.constants";
import { PageFormTestId } from "../components/AddPageModal/components/PageForm/PageForm.constants";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD = mindThreadFixtures[0];
const FIRST_SECTION = threadSectionFixtures[0];
const SECOND_SECTION = threadSectionFixtures[1];
const PAGE_NAME = "Ideas";
const TYPED_NAME = "Half typed";
const PICKED_SWATCH_INDEX = 1;
const PICKED_COLOR = parseColor(
  NORD_AURORA_SWATCHES[PICKED_SWATCH_INDEX]
).toString("hex");

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <PagesColumn />
      <AddPageModalContainer />
    </ThreadPageLoader>
  );

  return { user };
};

const getPagesColumn = () => {
  return screen.getByTestId(ThreadColumnsTestId.pagesColumn);
};

const getModalTitle = () => {
  return screen.queryByText(ADD_PAGE_MODAL_TITLE);
};

const getNameInput = () => {
  return screen.getByTestId(PageFormTestId.nameInput);
};

const getAddButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: "Cancel" });
};

const pickSwatch = async (
  user: ReturnType<typeof setup>["user"],
  swatchIndex: number
) => {
  const colorPicker = screen.getByTestId(PageFormTestId.colorPicker);
  const colorTrigger = within(colorPicker).getByTestId(
    ColorPickerTestId.trigger
  );

  await user.click(colorTrigger);

  const swatchTriggers = screen.getAllByTestId(ColorPickerTestId.swatchTrigger);

  await user.click(swatchTriggers[swatchIndex]);
};

beforeEach(() => {
  vi.clearAllMocks();
  seedThreads(mindThreadFixtures);
  seedSections(threadSectionFixtures);
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
  localStorage.clear();
});

describe("AddPageModalContainer", () => {
  it("opens from Add page, and Cancel closes it with no page created", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });
    await openAddPageModal(user);

    const modalTitle = getModalTitle();

    const removal = waitForElementToBeRemoved(modalTitle);
    await user.click(getCancelButton());
    await removal;

    expect(readStoredPages()).toStrictEqual([]);
  });

  it("reopens with the defaults after Cancel with a typed name and a picked color", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });
    await openAddPageModal(user);

    const firstModalTitle = getModalTitle();
    await user.type(getNameInput(), TYPED_NAME);
    await pickSwatch(user, PICKED_SWATCH_INDEX);

    const removal = waitForElementToBeRemoved(firstModalTitle);
    await user.click(getCancelButton());
    await removal;

    await openAddPageModal(user);

    const reopenedNameInput = getNameInput();
    expect(reopenedNameInput).toHaveValue("");

    await user.type(reopenedNameInput, PAGE_NAME);
    await user.click(getAddButton());

    await screen.findByText(getPageCreatedMessage(PAGE_NAME));

    const [storedPage] = readStoredPages();
    expect(storedPage.color).toBe(DEFAULT_SWATCH_COLOR);
    expect(storedPage.type).toBe("chat");
  });

  it("closes after adding '  Ideas  ', shows the success message, lists it last, and scrolls it into view", async () => {
    seedPages(sectionPageFixtures);

    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await openAddPageModal(user);

    const modalTitle = getModalTitle();

    await user.type(getNameInput(), "  Ideas  ");

    const removal = waitForElementToBeRemoved(modalTitle);
    await user.click(getAddButton());
    await removal;

    const notification = await screen.findByText(
      getPageCreatedMessage(PAGE_NAME)
    );

    expect(notification).toBeInTheDocument();

    const expectedNames = [
      sectionPageFixtures[0].name,
      sectionPageFixtures[1].name,
      PAGE_NAME,
    ];

    expect(getRenderedPageNames()).toStrictEqual(expectedNames);

    const cards = screen.getAllByTestId(PageCardTestId.container);
    const lastCard = cards[cards.length - 1];

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    expect(scrollIntoView.mock.contexts).toContain(lastCard);
  });

  it("removes 'No pages yet.' after the first page and keeps two pages with the same name", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });

    const emptyMessage = within(getPagesColumn()).getByText(
      PAGES_COLUMN_EMPTY_MESSAGE
    );

    await openAddPageModal(user);

    const firstModalTitle = getModalTitle();
    await user.type(getNameInput(), PAGE_NAME);
    const firstRemoval = waitForElementToBeRemoved(firstModalTitle);
    await user.click(getAddButton());
    await firstRemoval;

    expect(emptyMessage).not.toBeInTheDocument();

    await openAddPageModal(user);

    const secondModalTitle = getModalTitle();
    await user.type(getNameInput(), PAGE_NAME);
    const secondRemoval = waitForElementToBeRemoved(secondModalTitle);
    await user.click(getAddButton());
    await secondRemoval;

    expect(getRenderedPageNames()).toStrictEqual([PAGE_NAME, PAGE_NAME]);
  });

  it("keeps the modal open with the name and color, and a second Add succeeds, after a failed save", async () => {
    threadsServiceOverrides.addSectionPage = async () => {
      throw new Error("Storage quota exceeded");
    };

    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });
    await openAddPageModal(user);

    await user.type(getNameInput(), PAGE_NAME);
    await pickSwatch(user, PICKED_SWATCH_INDEX);
    await user.click(getAddButton());

    const errorNotification = await screen.findByText(SAVE_PAGE_ERROR_MESSAGE);

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = getModalTitle();
    expect(modalTitle).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue(PAGE_NAME);

    resetThreadsServiceOverrides();

    const removal = waitForElementToBeRemoved(modalTitle);
    await user.click(getAddButton());
    await removal;

    const [storedPage] = readStoredPages();
    expect(storedPage.name).toBe(PAGE_NAME);
    expect(storedPage.color).toBe(PICKED_COLOR);
  });

  it("shows the error notification and keeps the modal open when the section was deleted in another tab", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: FIRST_SECTION.name });
    await openAddPageModal(user);

    seedSections(threadSectionFixtures.slice(1));
    dispatchStorageChange(SECTIONS_STORAGE_KEY);

    await user.type(getNameInput(), PAGE_NAME);
    await user.click(getAddButton());

    const errorNotification = await screen.findByText(SAVE_PAGE_ERROR_MESSAGE);

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = getModalTitle();
    expect(modalTitle).toBeInTheDocument();
  });

  it("shows the error notification and keeps the modal open when the thread was deleted in another tab", async () => {
    const { user } = setup();

    await selectSectionCard({ user, sectionName: SECOND_SECTION.name });
    await openAddPageModal(user);

    seedThreads([]);
    dispatchStorageChange(THREADS_STORAGE_KEY);

    await user.type(getNameInput(), PAGE_NAME);
    await user.click(getAddButton());

    const errorNotification = await screen.findByText(SAVE_PAGE_ERROR_MESSAGE);

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = getModalTitle();
    expect(modalTitle).toBeInTheDocument();
  });
});
