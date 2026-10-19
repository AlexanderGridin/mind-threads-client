import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { MALFORMED_JSON } from "@/__test-fixtures__";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { DashboardPage } from "../DashboardPage";
import { AddNewThreadTestId } from "../components/DashboardHeader/components/AddNewThread/AddNewThread.constants";
import { ThreadListModeButtonTestId } from "../components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.constants";
import { ThreadFormTestId } from "../components/AddNewThreadModalContainer/components/AddNewThreadModal/components/ThreadForm/ThreadForm.constants";
import { AddNewThreadModalActionsTestId } from "../components/AddNewThreadModalContainer/components/AddNewThreadModal/components/AddNewThreadModalActions/AddNewThreadModalActions.constants";
import { EmptyThreadListTestId } from "../components/DashboardContent/components/EmptyThreadList/EmptyThreadList.constants";
import { MindThreadListTestId } from "../components/DashboardContent/components/MindThreadList/MindThreadList.constants";
import { MindThreadCardTestId } from "../components/DashboardContent/components/MindThreadCard/MindThreadCard.constants";
import { ThreadsLoadErrorTestId } from "../components/DashboardContent/components/ThreadsLoadError/ThreadsLoadError.constants";

const DEFAULT_THREAD_TITLE = "My thread";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(<DashboardPage />);

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
    screen.getByTestId(AddNewThreadModalActionsTestId.addButton)
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
      screen.getByTestId(AddNewThreadModalActionsTestId.addButton)
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
});
