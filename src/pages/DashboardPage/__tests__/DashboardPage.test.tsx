import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LOCATION_MARKER_TEST_ID,
  MALFORMED_JSON,
  mindThreadFixture,
  mindThreadFixtures,
  mindThreadFixturesWithSameTitle,
  renderWithRouter,
  seedThreads,
} from "@/__test-fixtures__";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { DashboardPage } from "../DashboardPage";
import { AddNewThreadTestId } from "../components/DashboardHeader/components/AddNewThread/AddNewThread.constants";
import { ThreadListModeButtonTestId } from "../components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.constants";
import { ThreadFormTestId } from "@/components/shared/ThreadForm/ThreadForm.constants";
import {
  ColorPickerTestId,
  NORD_AURORA_SWATCHES,
} from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  EMPTY_THREAD_LIST_MESSAGE,
  EmptyThreadListTestId,
} from "../components/DashboardContent/components/EmptyThreadList/EmptyThreadList.constants";
import { MindThreadListTestId } from "../components/DashboardContent/components/MindThreadList/MindThreadList.constants";
import { MindThreadCardTestId } from "../components/DashboardContent/components/MindThreadCard/MindThreadCard.constants";
import { ThreadsLoadErrorTestId } from "../components/DashboardContent/components/ThreadsLoadError/ThreadsLoadError.constants";
import {
  getThreadDeletedMessage,
  getThreadUpdatedMessage,
} from "../components/DashboardPageLoader/DashboardPageLoader.utils";
import { EDIT_THREAD_MODAL_TITLE } from "../components/EditThreadModalContainer/components/EditThreadModal/EditThreadModal.constants";
import { DELETE_THREAD_MODAL_TITLE } from "../components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.constants";
import { getDeleteThreadModalText } from "../components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.utils";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";

const DEFAULT_THREAD_TITLE = "My thread";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  const user = userEvent.setup();

  const renderResult = renderWithRouter({ ui: <DashboardPage /> });

  return { user, unmount: renderResult.unmount };
};

type SetupResult = ReturnType<typeof setup>;

const findOpenModalButton = async () => {
  const button = await screen.findByTestId(AddNewThreadTestId.openModalButton);
  return button;
};

const queryThreadTitles = () => {
  const titles = screen.queryAllByTestId(MindThreadCardTestId.title);
  return titles.map((title) => title.textContent);
};

const findThreadTitles = async () => {
  const titles = await screen.findAllByTestId(MindThreadCardTestId.title);
  return titles.map((title) => title.textContent);
};

const createThread = async ({
  setupResult,
  title = DEFAULT_THREAD_TITLE,
  firstThread = false,
}: {
  setupResult: SetupResult;
  title?: string;
  firstThread?: boolean;
}) => {
  const { user } = setupResult;

  const button = await findOpenModalButton();
  expect(button).toBeEnabled();

  const threadsBefore = firstThread
    ? queryThreadTitles()
    : await findThreadTitles();

  await user.click(button);
  await user.type(screen.getByTestId(ThreadFormTestId.titleInput), title);

  await user.click(
    screen.getByTestId(ThreadFormModalActionsTestId.submitButton)
  );

  const threadsAfter = await findThreadTitles();
  expect(threadsAfter).toHaveLength(threadsBefore.length + 1);
};

describe("DashboardPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state and no demo threads when nothing is stored", async () => {
    setup();

    expect(
      await screen.findByTestId(EmptyThreadListTestId.container)
    ).toBeInTheDocument();

    expect(screen.queryAllByTestId(MindThreadListTestId.listItem)).toHaveLength(
      0
    );
  });

  it("replaces the empty state with one card showing the trimmed name when a thread is created from it", async () => {
    const { user } = setup();

    await user.click(
      await screen.findByTestId(EmptyThreadListTestId.addButton)
    );

    await user.type(
      screen.getByTestId(ThreadFormTestId.titleInput),
      "  My thread  "
    );

    await user.click(
      screen.getByTestId(ThreadFormModalActionsTestId.submitButton)
    );

    expect(
      await screen.findByTestId(MindThreadListTestId.container)
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId(EmptyThreadListTestId.container)
    ).not.toBeInTheDocument();

    const titles = await findThreadTitles();
    expect(titles).toStrictEqual([DEFAULT_THREAD_TITLE]);
  });

  it("shows three created threads newest first in grid and in list view", async () => {
    const context = setup();

    await createThread({
      setupResult: context,
      title: "First",
      firstThread: true,
    });

    await createThread({
      setupResult: context,
      title: "Second",
    });

    await createThread({
      setupResult: context,
      title: "Third",
    });

    const expectedTitles = ["Third", "Second", "First"];

    const titles = await findThreadTitles();
    expect(titles).toStrictEqual(expectedTitles);

    expect(screen.getByTestId(MindThreadListTestId.container)).toHaveStyle({
      display: "grid",
    });

    await context.user.click(
      screen.getByTestId(ThreadListModeButtonTestId.container)
    );

    expect(titles).toStrictEqual(expectedTitles);

    expect(screen.getByTestId(MindThreadListTestId.container)).toHaveStyle({
      display: "flex",
    });
  });

  it("shows two threads with the same name as two cards", async () => {
    const context = setup();

    await createThread({
      setupResult: context,
      title: "Testing Strategy",
      firstThread: true,
    });

    await createThread({
      setupResult: context,
      title: "Testing Strategy",
    });

    const titles = await findThreadTitles();
    expect(titles).toStrictEqual(["Testing Strategy", "Testing Strategy"]);
  });

  it("shows the same threads in the same order after a reload", async () => {
    const firstRender = setup();

    await createThread({
      setupResult: firstRender,
      title: "First",
      firstThread: true,
    });

    await createThread({
      setupResult: firstRender,
      title: "Second",
    });

    firstRender.unmount();

    setup();

    const titles = await findThreadTitles();
    expect(titles).toStrictEqual(["Second", "First"]);
  });

  it("disables the header button when the stored threads are malformed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup();

    expect(
      await screen.findByTestId(ThreadsLoadErrorTestId.container)
    ).toBeInTheDocument();

    const button = await findOpenModalButton();
    expect(button).toBeDisabled();
  });

  describe("open thread", () => {
    const FIRST_SAME_TITLE_PATH = "/threads/same-title-1";
    const SAME_TITLE = "Testing Strategy";

    const getThreadLinks = () => {
      return screen.getAllByRole("link", { name: SAME_TITLE });
    };

    it("opens the thread page when a card is clicked in grid and in list view", async () => {
      seedThreads(mindThreadFixturesWithSameTitle);

      const gridRender = setup();

      await findThreadTitles();

      const [gridThreadLink] = getThreadLinks();
      await gridRender.user.click(gridThreadLink);

      const gridLocation = screen.getByTestId(LOCATION_MARKER_TEST_ID);
      expect(gridLocation.textContent).toBe(FIRST_SAME_TITLE_PATH);

      gridRender.unmount();

      const listRender = setup();

      await findThreadTitles();

      const listModeButton = screen.getByTestId(
        ThreadListModeButtonTestId.container
      );
      await listRender.user.click(listModeButton);

      const listContainer = screen.getByTestId(MindThreadListTestId.container);
      expect(listContainer).toHaveStyle({ display: "flex" });

      const [listThreadLink] = getThreadLinks();
      await listRender.user.click(listThreadLink);

      const listLocation = screen.getByTestId(LOCATION_MARKER_TEST_ID);
      expect(listLocation.textContent).toBe(FIRST_SAME_TITLE_PATH);
    });
  });

  describe("delete thread", () => {
    const seedThreeThreads = () => {
      seedThreads([
        mindThreadFixtures[0],
        mindThreadFixtures[1],
        mindThreadFixture,
      ]);
    };

    const openDeleteModalFromMenu = async (
      user: SetupResult["user"],
      threadTitle: string
    ) => {
      const menuButton = screen.getByRole("button", {
        name: `Thread actions for ${threadTitle}`,
      });

      await user.click(menuButton);

      const [, deleteMenuItem] = await screen.findAllByRole("menuitem");
      await user.click(deleteMenuItem);
    };

    const confirmDelete = async (user: SetupResult["user"]) => {
      const confirmButton = screen.getByTestId(
        DeleteConfirmationModalActionsTestId.deleteButton
      );

      await user.click(confirmButton);
    };

    it("shows a thread actions button on every card in grid and list view", async () => {
      seedThreeThreads();

      const { user } = setup();

      const titles = await findThreadTitles();

      titles.forEach((title) => {
        const menuButton = screen.getByRole("button", {
          name: `Thread actions for ${title}`,
        });

        expect(menuButton).toBeInTheDocument();
      });

      const listModeButton = screen.getByTestId(
        ThreadListModeButtonTestId.container
      );

      await user.click(listModeButton);

      const listContainer = screen.getByTestId(MindThreadListTestId.container);
      expect(listContainer).toHaveStyle({
        display: "flex",
      });

      titles.forEach((title) => {
        const menuButton = screen.getByRole("button", {
          name: `Thread actions for ${title}`,
        });

        expect(menuButton).toBeInTheDocument();
      });
    });

    it("deletes the second of three threads, keeps the others in order and shows a success notification", async () => {
      seedThreeThreads();

      const { user } = setup();

      await findThreadTitles();

      await openDeleteModalFromMenu(user, mindThreadFixtures[1].title);

      let modalTitle: HTMLElement | null = screen.getByText(
        DELETE_THREAD_MODAL_TITLE
      );
      expect(modalTitle).toBeInTheDocument();

      const modalText = screen.getByText(
        getDeleteThreadModalText(mindThreadFixtures[1].title)
      );

      expect(modalText).toBeInTheDocument();

      await confirmDelete(user);

      const notification = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[1].title)
      );

      expect(notification).toBeInTheDocument();

      modalTitle = screen.queryByText(DELETE_THREAD_MODAL_TITLE);
      expect(modalTitle).not.toBeInTheDocument();

      const threadTitles = await findThreadTitles();
      expect(threadTitles).toStrictEqual([
        mindThreadFixtures[0].title,
        mindThreadFixture.title,
      ]);
    });

    it("keeps a deleted thread gone after the page is rendered again", async () => {
      seedThreeThreads();

      const firstRender = setup();

      await findThreadTitles();

      await openDeleteModalFromMenu(
        firstRender.user,
        mindThreadFixtures[1].title
      );

      await confirmDelete(firstRender.user);

      const threadDeletedMessage = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[1].title)
      );

      expect(threadDeletedMessage).toBeInTheDocument();

      expect(await findThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        mindThreadFixture.title,
      ]);

      firstRender.unmount();

      setup();

      expect(await findThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        mindThreadFixture.title,
      ]);
    });

    it("shows the empty state after the only thread is deleted", async () => {
      seedThreads([mindThreadFixture]);

      const { user } = setup();

      await findThreadTitles();
      await openDeleteModalFromMenu(user, mindThreadFixture.title);
      await confirmDelete(user);

      const emptyState = await screen.findByText(EMPTY_THREAD_LIST_MESSAGE);
      expect(emptyState).toBeInTheDocument();
    });

    it("opens the delete modal without opening the thread when Delete is chosen from a card's menu", async () => {
      seedThreeThreads();

      const { user } = setup();

      await findThreadTitles();
      await openDeleteModalFromMenu(user, mindThreadFixtures[0].title);

      const modalTitle = await screen.findByText(DELETE_THREAD_MODAL_TITLE);
      expect(modalTitle).toBeInTheDocument();

      const locationMarker = screen.queryByTestId(LOCATION_MARKER_TEST_ID);
      expect(locationMarker).not.toBeInTheDocument();
    });
  });

  describe("edit thread", () => {
    const seedThreeThreads = () => {
      seedThreads([
        mindThreadFixtures[0],
        mindThreadFixtures[1],
        mindThreadFixture,
      ]);
    };

    const openCardMenu = async (
      user: SetupResult["user"],
      threadTitle: string
    ) => {
      const menuButton = screen.getByRole("button", {
        name: `Thread actions for ${threadTitle}`,
      });

      await user.click(menuButton);
    };

    const openEditModalFromMenu = async (
      user: SetupResult["user"],
      threadTitle: string
    ) => {
      await openCardMenu(user, threadTitle);

      const [editMenuItem] = await screen.findAllByRole("menuitem");
      await user.click(editMenuItem);
    };

    const saveEdit = async (user: SetupResult["user"]) => {
      await user.click(
        screen.getByTestId(ThreadFormModalActionsTestId.submitButton)
      );
    };

    it("shows Edit and Delete in the card menu in grid and in list view", async () => {
      seedThreeThreads();

      const { user } = setup();

      await findThreadTitles();
      await openCardMenu(user, mindThreadFixtures[0].title);

      const menuItems = await screen.findAllByRole("menuitem");
      expect(menuItems.map((menuItem) => menuItem.textContent)).toStrictEqual([
        "Edit",
        "Delete",
      ]);

      await user.keyboard("{Escape}");

      await user.click(
        screen.getByTestId(ThreadListModeButtonTestId.container)
      );

      await findThreadTitles();
      await openCardMenu(user, mindThreadFixtures[0].title);

      const listMenuItems = await screen.findAllByRole("menuitem");
      expect(
        listMenuItems.map((menuItem) => menuItem.textContent)
      ).toStrictEqual(["Edit", "Delete"]);
    });

    it("edits the second of three threads in place: new name and color, Updated just now, counts unchanged", async () => {
      seedThreeThreads();

      const { user } = setup();

      await findThreadTitles();
      await openEditModalFromMenu(user, mindThreadFixtures[1].title);

      const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
      expect(modalTitle).toBeInTheDocument();

      const nameInput = screen.getByTestId(ThreadFormTestId.titleInput);
      expect(nameInput).toHaveValue(mindThreadFixtures[1].title);

      await user.clear(nameInput);
      await user.type(nameInput, "QA Strategy");

      await user.click(screen.getByTestId(ColorPickerTestId.trigger));
      const [firstSwatch] = screen.getAllByTestId(
        ColorPickerTestId.swatchTrigger
      );
      await user.click(firstSwatch);

      await saveEdit(user);

      const updatedMessage = await screen.findByText(
        getThreadUpdatedMessage("QA Strategy")
      );
      expect(updatedMessage).toBeInTheDocument();

      expect(
        screen.queryByText(EDIT_THREAD_MODAL_TITLE)
      ).not.toBeInTheDocument();

      expect(await findThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        "QA Strategy",
        mindThreadFixture.title,
      ]);

      const editedCard = screen.getAllByTestId(
        MindThreadCardTestId.container
      )[1];

      const colorIndicator = within(editedCard).getByTestId(
        MindThreadCardTestId.colorBorderTop
      );
      expect(colorIndicator).toHaveStyle({
        backgroundColor: NORD_AURORA_SWATCHES[0],
      });

      const lastUpdated = within(editedCard).getByTestId(
        MindThreadCardTestId.lastUpdated
      );
      expect(lastUpdated.textContent).toBe("Updated: just now");

      const sections = within(editedCard).getByTestId(
        MindThreadCardTestId.sections
      );
      expect(sections.textContent).toBe("5 sections");

      const pages = within(editedCard).getByTestId(MindThreadCardTestId.pages);
      expect(pages.textContent).toBe("20 pages");
    });

    it("keeps the edited name and color after the page is rendered again", async () => {
      seedThreeThreads();

      const firstRender = setup();

      await findThreadTitles();
      await openEditModalFromMenu(
        firstRender.user,
        mindThreadFixtures[1].title
      );

      const nameInput = screen.getByTestId(ThreadFormTestId.titleInput);
      await firstRender.user.clear(nameInput);
      await firstRender.user.type(nameInput, "QA Strategy");

      await saveEdit(firstRender.user);

      const updatedMessage = await screen.findByText(
        getThreadUpdatedMessage("QA Strategy")
      );
      expect(updatedMessage).toBeInTheDocument();

      firstRender.unmount();

      setup();

      expect(await findThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        "QA Strategy",
        mindThreadFixture.title,
      ]);
    });

    it("opens the edit modal without opening the thread when Edit is chosen from a card's menu", async () => {
      seedThreeThreads();

      const { user } = setup();

      await findThreadTitles();
      await openEditModalFromMenu(user, mindThreadFixtures[0].title);

      const modalTitle = await screen.findByText(EDIT_THREAD_MODAL_TITLE);
      expect(modalTitle).toBeInTheDocument();

      const locationMarker = screen.queryByTestId(LOCATION_MARKER_TEST_ID);
      expect(locationMarker).not.toBeInTheDocument();
    });
  });
});
