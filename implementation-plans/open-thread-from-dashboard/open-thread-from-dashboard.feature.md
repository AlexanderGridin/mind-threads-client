# Open a thread from the dashboard

**Source:** `implementation-plans/open-thread-from-dashboard/open-thread-from-dashboard.draft.md`

## Acceptance criteria

Opening a thread

- AC1: In grid view, clicking the "Testing Strategy" card opens its thread page.
- AC2: In list view, clicking the "Testing Strategy" card opens its thread page.
- AC3: Tab can move keyboard focus to each thread card.
- AC4: Enter on a focused card opens its thread page.
- AC5: A screen reader announces a card as a link named after the thread title.
- AC6: Ctrl+click (Cmd+click on macOS) opens the thread page in a new tab; the dashboard stays in the current tab.
- AC7: Middle-click opens the thread page in a new tab; the dashboard stays in the current tab.
- AC8: Reloading the thread page shows the same thread again.
- AC9: Opening a bookmarked thread page address shows that thread.
- AC10: Clicking a card's three-dots "Thread actions" button does not open the thread page.
- AC11: Clicking any item in a card's open actions menu does not open the thread page.

Thread page layout

- AC12: The header shows a back-arrow button at its far left.
- AC13: The header shows the thread title to the right of the back-arrow button.
- AC14: The header shows the "Mind Threads" app logo (icon and name), as on the dashboard, in its horizontal center.
- AC15: The header shows the color mode toggle at its far right.
- AC16: The header background is the thread's color.
- AC17: Header text and icons are dark or light, whichever contrasts more with the thread's color.
- AC18: Switching the color mode keeps the header background in the thread's color.
- AC19: A color mode chosen on the thread page is kept on the dashboard.
- AC20: The header shows no section count, page count, "Updated" date, Edit or Delete action.
- AC21: Below the header, three columns are side by side, separated by vertical borders.
- AC22: The first two columns have the same width; the third fills the remaining width.
- AC23: The first column shows the heading "Sections" and the text "No sections yet."
- AC24: The second column shows the heading "Pages" and the text "Select a section to see its pages."
- AC25: The third column shows no heading and the centered text "Select a page to see its content."
- AC26: No column shows an "Add section" or "Add page" button.
- AC27: Below 768px window width, the columns stay side by side and the page scrolls horizontally.
- AC28: The browser tab title is "Testing Strategy · Mind Threads".

Returning to the dashboard

- AC29: Clicking the back-arrow button opens the dashboard.
- AC30: The back-arrow button's accessible label is "Back to Dashboard".
- AC31: The browser's Back button returns from the thread page to the dashboard.
- AC32: The dashboard is still in list view if it was in list view before the thread was opened.
- AC33: The dashboard is still in grid view if it was in grid view before the thread was opened.
- AC34: The dashboard shows the same threads in the same order as before.
- AC35: The dashboard's browser tab title is the same as before the thread page was opened.

Error handling and user feedback

- AC36: While the thread loads, a full-screen loader covers the whole page, header and content area included.
- AC37: A screen reader announces the loader as "Loading thread".
- AC38: While the loader is shown, the browser tab title is "Mind Threads".
- AC39: When loading finishes, the loader is hidden and the page layout under it is shown.
- AC40: For an existing thread, the page shows the header with the title and the three-column content area.
- AC41: For a thread that doesn't exist, the content area shows "This thread doesn't exist or was deleted." and a "Back to Dashboard" button instead of the columns.
- AC42: For a thread that is not found, the header shows the back-arrow button, the logo and the color mode toggle, and no title.
- AC43: For a thread that is not found, the header background is the dashboard header's background.
- AC44: For a thread that is not found, the browser tab title is "Thread not found · Mind Threads".
- AC45: When the saved thread data can't be read, the content area shows "Couldn't load this thread. Please reload the page." and a "Back to Dashboard" button instead of the columns.
- AC46: When loading fails, the header shows the back-arrow button, the logo and the color mode toggle, and no title.
- AC47: When loading fails, the header background is the dashboard header's background.
- AC48: When loading fails, the browser tab title is "Mind Threads".
- AC49: In the not-found and load-failed states, "Back to Dashboard" opens the dashboard.
- AC50: In the not-found and load-failed states, no notification popup is shown.

## Style notes

- The card becomes a link with the "stretched link" pattern: the card title is wrapped in Chakra's `LinkOverlay` rendered as a react-router `Link` (`asChild`), whose `::before` covers the whole card. The actions menu sits above it with `zIndex="1"`. A real `<a href>` gives Tab focus, Enter, the link role and name, Ctrl/Cmd+click and middle-click for free; wrapping the whole card in `<a>` is not used because it would nest the actions `<button>` inside a link (invalid HTML) — architecture decision.
- Lib adapters stay router-agnostic: `LinkOverlay` takes `asChild` and the caller passes the react-router `Link` as its child — project convention (`src/components/lib/` is meant for extraction into a design system, `CLAUDE.md`).
- Route paths live in `src/routing/routing.constants.ts` (`AppPath`) and `src/routing/routing.utils.ts` (`getThreadPath`). Import them by file path (`@/routing/routing.constants`, `@/routing/routing.utils`); do not re-export them from `src/routing/index.ts`, because that barrel exports `AppRoutes`, which imports `@/pages`, and pages importing it would create an import cycle — architecture decision.
- `ThreadPage` keeps its state in a `useThreadState` hook in `ThreadPage.hooks.ts` and passes `thread` / `threadStatus` down as props; no context provider is added, because only two direct children need the data. A `ThreadPageLoader` with value and action contexts (like `DashboardPageLoader`) is the follow-up when the sections and pages stories add actions — architecture decision.
- The load effect in `useThreadState` mirrors `useThreadsState`: it runs only while the status is `Loading`, uses an `isActive` flag, and sets state only after the service resolves. Vitest does not run the React Compiler, so `useThreadsService()` returns a new object on each render; the status guard prevents a reload loop — project convention (`DashboardPageLoader.hooks.ts`).
- The tab title is set by a shared `useDocumentTitle` hook that restores the previous title on unmount, so the dashboard keeps the title it had before (AC35). `index.html` is not changed — architecture decision.
- Header text and icons follow the thread color by wrapping the header items in the existing `LightMode` (dark text) or `DarkMode` (light text) components, chosen by a WCAG contrast check against the theme's `fg` colors (`#2e3440` / `#eceff4`) — reuse of `src/components/lib/color-mode/components/`.
- `AppLogo` moves from `src/pages/DashboardPage/components/DashboardHeader/components/AppLogo/` to `src/components/shared/AppLogo/` with `git mv`, because two pages now use it. The "Mind Threads" text becomes the `APP_NAME` constant, reused by the tab titles — project convention (`src/components/shared/`, `CLAUDE.md`), `typescript.md` rule 4.
- Adapter props are added to `Box`, `Text` and `HStack` only as needed by this feature; the adapters keep their explicit prop lists — project convention (`src/components/lib/Box/Box.tsx`).
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`; a title built from a thread title is a `get...` function in `*.utils.ts` — project convention (`DashboardPageLoader.utils.ts`).
- Test IDs use `initTestIdCreator("<Name>__")` and a `<Name>TestId` `as const` object — project convention (`MindThreadCard.constants.ts`).
- Functions with two or more parameters take one destructured object — code guide (`typescript.md` rule 3).
- Arrow functions use a block body with an explicit `return`, and every `if` body goes in braces on its own line, even where the existing code uses one-liners — developer decision (carried over from `implementation-plans/edit-thread-from-dashboard/edit-thread-from-dashboard.style.md`), `typescript.md` rules 8–9.
- An exported props type goes to `<ComponentName>.types.ts`; a props type that is not exported stays in the component file — developer decision (carried over from the same style file), `react.md` rules 4–5.
- Tests that render a thread card now need a router; they use one shared `renderWithRouter` helper from `src/__test-fixtures__/` instead of each wrapping `MemoryRouter` by hand — code guide (`unit-tests.md` rule 5).

## Phase 1: Implementation

---

### Step 1: Add the route path constants and the thread path helper

**New files:**

- `src/routing/routing.constants.ts`
- `src/routing/routing.utils.ts`

**File:**
`src/routing/AppRoutes.tsx`

**Covers:** AC8, AC9

**Context:**
The card link, the back buttons and the routes must agree on one path. `generatePath` from react-router builds and encodes the thread path.

**Changes:**

1. Create `src/routing/routing.constants.ts`:

   ```ts
   export const AppPath = {
     Dashboard: "/",
     Thread: "/threads/:threadId",
     ColorsDemo: "/colors-demo",
   } as const;
   ```

2. Create `src/routing/routing.utils.ts`:

   ```ts
   import { generatePath } from "react-router";
   import { AppPath } from "./routing.constants";

   export const getThreadPath = (threadId: string) => {
     return generatePath(AppPath.Thread, { threadId });
   };
   ```

3. In `AppRoutes.tsx`, use the constants instead of the string literals:

   ```tsx
   <Route path={AppPath.Dashboard} element={<DashboardPage />} />
   <Route path={AppPath.Thread} element={<ThreadPage />} />
   <Route path={AppPath.ColorsDemo} element={<ColorsDemoPage />} />
   ```

4. Do not add the two new files to `src/routing/index.ts` (see `Style notes`).

**Verification MANUAL:** `npm run ts:check` passes; `/`, `/threads/42` and `/colors-demo` still render their pages in the browser.

---

### Step 2: Extend the Box, Text and HStack adapters with the props this feature needs

**File:**
`src/components/lib/Box/Box.tsx`, `src/components/lib/Text/Text.tsx`, `src/components/lib/HStack/HStack.tsx`

**Context:**
The adapters list their props explicitly; the thread page layout and the card overlay need a few more, which are passed through to Chakra unchanged.

**Changes:**

1. Add to `BoxProps`:

   ```ts
   zIndex?: string;
   alignItems?: string;
   justifyContent?: string;
   minWidth?: string;
   divideX?: string;
   divideColor?: string;
   ```

2. Add to `TextProps`:

   ```ts
   truncate?: boolean;
   ```

3. Add to `HStackProps`:

   ```ts
   minWidth?: string;
   ```

4. The components already spread `...props` onto the Chakra component; nothing else changes.

**Verification MANUAL:** `npm run ts:check` passes and the dashboard looks unchanged.

---

### Step 3: Add the LinkOverlay adapter

**New files:**

- `src/components/lib/LinkOverlay/LinkOverlay.tsx`
- `src/components/lib/LinkOverlay/index.ts`

**File:**
`src/components/lib/index.ts`

**Covers:** AC3, AC5

**Context:**
Chakra's `LinkOverlay` draws an absolutely positioned `::before` that covers the nearest positioned ancestor, so the whole card is clickable while only the title is the link. The default focus outline would wrap only the title, so the adapter moves the focus ring to the `::before`; the negative offset keeps it inside the card's `overflow="hidden"`.

**Changes:**

1. Create `LinkOverlay.tsx` following the pattern of `src/components/lib/Text/Text.tsx`:

   ```tsx
   import { LinkOverlay as ChakraLinkOverlay } from "@chakra-ui/react";
   import type { ReactNode } from "react";

   export type LinkOverlayProps = {
     children: ReactNode;
     asChild?: boolean;
     "data-testid"?: string;
   };

   export const LinkOverlay = ({ children, ...props }: LinkOverlayProps) => {
     return (
       <ChakraLinkOverlay
         {...props}
         _focusVisible={{
           outline: "none",
           _before: {
             outline: "2px solid",
             outlineColor: "accent",
             outlineOffset: "-2px",
             borderRadius: "md",
           },
         }}
       >
         {children}
       </ChakraLinkOverlay>
     );
   };
   ```

2. Create `index.ts`: `export * from "./LinkOverlay";`
3. In `src/components/lib/index.ts` add:

   ```ts
   export { LinkOverlay, type LinkOverlayProps } from "./LinkOverlay";
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 4: Add the FullScreenLoader component

**New files:**

- `src/components/lib/FullScreenLoader/FullScreenLoader.tsx`
- `src/components/lib/FullScreenLoader/FullScreenLoader.constants.ts`
- `src/components/lib/FullScreenLoader/index.ts`

**File:**
`src/components/lib/index.ts`

**Covers:** AC36, AC37

**Context:**
No loader exists yet (the dashboard renders nothing while loading). A fixed, opaque overlay with `role="status"` covers the header and content and is announced by its label.

**Changes:**

1. Create `FullScreenLoader.constants.ts`:

   ```ts
   import { initTestIdCreator } from "../utils";

   const createTestId = initTestIdCreator("FullScreenLoader__");

   export const FullScreenLoaderTestId = {
     container: createTestId("container"),
   } as const;
   ```

2. Create `FullScreenLoader.tsx`:

   ```tsx
   import { Center, Spinner } from "@chakra-ui/react";
   import { FullScreenLoaderTestId } from "./FullScreenLoader.constants";

   type FullScreenLoaderProps = {
     label: string;
   };

   export const FullScreenLoader = ({ label }: FullScreenLoaderProps) => {
     return (
       <Center
         data-testid={FullScreenLoaderTestId.container}
         role="status"
         aria-label={label}
         position="fixed"
         inset="0"
         zIndex="overlay"
         backgroundColor="bg"
       >
         <Spinner size="xl" color="accent" />
       </Center>
     );
   };
   ```

3. Create `index.ts` exporting `./FullScreenLoader` and `./FullScreenLoader.constants`.
4. In `src/components/lib/index.ts` add `export { FullScreenLoader } from "./FullScreenLoader";`.

**Verification MANUAL:** `npm run ts:check` passes; temporarily rendering `<FullScreenLoader label="Loading thread" />` on a page shows a centered spinner covering the whole window.

---

### Step 5: Add the useDocumentTitle hook

**New files:**

- `src/hooks/useDocumentTitle/useDocumentTitle.ts`
- `src/hooks/useDocumentTitle/index.ts`

**File:**
`src/hooks/index.ts`

**Covers:** AC28, AC35, AC38, AC44, AC48

**Context:**
The effect cleanup restores the title the document had before the effect ran. When the title changes, the cleanup restores the original title and the next effect sets the new one, so on unmount the page always restores the title it found (the dashboard's).

**Changes:**

1. Create `useDocumentTitle.ts`:

   ```ts
   import { useEffect } from "react";

   export const useDocumentTitle = (title: string) => {
     useEffect(() => {
       const previousTitle = document.title;
       document.title = title;

       return () => {
         document.title = previousTitle;
       };
     }, [title]);
   };
   ```

2. Create `index.ts`: `export * from "./useDocumentTitle";`
3. In `src/hooks/index.ts` add `export * from "./useDocumentTitle";`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 6: Add the getContrastColorMode util

**New files:**

- `src/utils/getContrastColorMode.ts`

**File:**
`src/utils/index.ts`

**Covers:** AC17

**Context:**
The header must pick dark or light text by contrast with the thread color. The util returns the color mode whose `fg` color has the higher WCAG contrast ratio with the background, so the header can wrap its items in `LightMode` or `DarkMode`. Thread colors are `#rrggbb` hex strings (`ColorPicker.tsx:36` stores `toString("hex")`).

**Changes:**

1. Create `getContrastColorMode.ts`:

   ```ts
   import type { ColorMode } from "@/components/lib";

   // The theme's `fg` color in light mode (nord 0) and in dark mode (nord 6).
   const LIGHT_MODE_TEXT_COLOR = "#2e3440";
   const DARK_MODE_TEXT_COLOR = "#eceff4";

   type GetContrastRatioParams = {
     firstColor: string;
     secondColor: string;
   };

   const getChannelLuminance = (channel: number) => {
     const value = channel / 255;

     return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
   };

   const getRelativeLuminance = (hexColor: string) => {
     const hex = hexColor.replace("#", "");

     const [red, green, blue] = [0, 2, 4].map((offset) => {
       return parseInt(hex.slice(offset, offset + 2), 16);
     });

     return (
       0.2126 * getChannelLuminance(red) +
       0.7152 * getChannelLuminance(green) +
       0.0722 * getChannelLuminance(blue)
     );
   };

   const getContrastRatio = ({ firstColor, secondColor }: GetContrastRatioParams) => {
     const firstLuminance = getRelativeLuminance(firstColor);
     const secondLuminance = getRelativeLuminance(secondColor);

     const lighterLuminance = Math.max(firstLuminance, secondLuminance);
     const darkerLuminance = Math.min(firstLuminance, secondLuminance);

     return (lighterLuminance + 0.05) / (darkerLuminance + 0.05);
   };

   export const getContrastColorMode = (backgroundColor: string): ColorMode => {
     const darkTextContrast = getContrastRatio({
       firstColor: backgroundColor,
       secondColor: LIGHT_MODE_TEXT_COLOR,
     });

     const lightTextContrast = getContrastRatio({
       firstColor: backgroundColor,
       secondColor: DARK_MODE_TEXT_COLOR,
     });

     return darkTextContrast >= lightTextContrast ? "light" : "dark";
   };
   ```

2. In `src/utils/index.ts` add `export * from "./getContrastColorMode";`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 7: Add getThread to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.ts`, `src/services/useThreadsService/useThreadsService.types.ts`

**Covers:** AC8, AC9, AC40, AC41, AC45

**Context:**
The thread page needs one thread by id and must tell "not found" (resolves `null`) apart from "data can't be read" (rejects, as `getThreads` already does for malformed or invalid data).

**Changes:**

1. In `UseThreadsServiceReturn` add:

   ```ts
   getThread: (threadId: string) => Promise<MindThread | null>;
   ```

2. In `useThreadsService.ts`, after `getThreads`:

   ```ts
   const getThread = async (threadId: string): Promise<MindThread | null> => {
     const storedThreads = await getThreads();

     const storedThread = storedThreads.find((thread) => {
       return thread.id === threadId;
     });

     return storedThread ?? null;
   };
   ```

3. Return it: `return { getThreads, getThread, createThread, updateThread, deleteThread };`

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 8: Move AppLogo to the shared components

**New files:**

- `src/components/shared/AppLogo/` (moved from `src/pages/DashboardPage/components/DashboardHeader/components/AppLogo/`)

**File:**
`src/components/shared/AppLogo/AppLogo.tsx`, `src/components/shared/AppLogo/AppLogo.constants.ts`, `src/components/shared/index.ts`, `src/pages/DashboardPage/components/DashboardHeader/components/index.ts`, `src/pages/DashboardPage/components/DashboardHeader/DashboardHeader.tsx`

**Covers:** AC14

**Context:**
The thread page header shows the same logo as the dashboard, so the logo becomes a shared component. The app name becomes a constant because the tab titles use it too.

**Changes:**

1. Move the folder with history: `git mv src/pages/DashboardPage/components/DashboardHeader/components/AppLogo src/components/shared/AppLogo` (its `__tests__/` folder moves with it; its imports are relative and keep working).
2. In `AppLogo.constants.ts` add:

   ```ts
   export const APP_NAME = "Mind Threads";
   ```

3. In `AppLogo.tsx`, import `APP_NAME` from `./AppLogo.constants` and render `{APP_NAME}` instead of the literal `Mind Threads`.
4. In `src/components/shared/index.ts` add `export * from "./AppLogo";`.
5. In `DashboardHeader/components/index.ts` remove `export * from "./AppLogo";`.
6. In `DashboardHeader.tsx` import `AppLogo` from `@/components/shared` and keep `ThreadListModeButton`, `AddNewThread` from `./components`.

**Verification MANUAL:** `npm run ts:check` passes and the dashboard header still shows the logo.

---

### Step 9: Turn the card title into a link that covers the card

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardContent.tsx`

**Covers:** AC1, AC2, AC3, AC4, AC5, AC6, AC7

**Context:**
See the stretched link in `Style notes`. The card root `Box` in `MindThreadCard.tsx` is already `position="relative"`, so the overlay covers exactly the card. The link's name is the thread title. React Router's `Link` lets Ctrl/Cmd+click and middle-click go to the browser, which opens a new tab.

**Changes:**

1. Import `Link as RouterLink` from `react-router`, `LinkOverlay` from `@/components/lib`, and `getThreadPath` from `@/routing/routing.utils`.
2. Wrap the title text:

   ```tsx
   <Text
     data-testid={MindThreadCardTestId.title}
     fontWeight="600"
     fontSize="lg"
     as="h3"
   >
     <LinkOverlay asChild>
       <RouterLink to={getThreadPath(thread.id)}>{thread.title}</RouterLink>
     </LinkOverlay>
   </Text>
   ```

**Verification MANUAL:** On the dashboard, clicking anywhere on a card (grid and list) opens `/threads/<id>`; Tab focuses each card with a visible ring; Enter opens it; Ctrl/Cmd+click and middle-click open a new tab.

---

### Step 10: Keep the card actions above the link overlay

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardActions.tsx`

**Covers:** AC10, AC11

**Context:**
The overlay's `::before` has `z-index: 0`; the actions container must be above it or clicks on the three-dots button would hit the link. The menu items render in a `Portal` (`src/components/lib/Menu/Menu.tsx`), outside the card, so they never reach the link. The click no longer bubbles to a card handler (step 11), so `stopPropagation` is no longer needed.

**Changes:**

1. Add `zIndex="1"` to the actions `Box`.
2. Remove `handleContainerClick`, the `onClick={handleContainerClick}` prop and the now unused `MouseEvent` import.

**Verification MANUAL:** Clicking the three-dots button opens the menu and stays on the dashboard; choosing Edit or Delete opens the matching modal and stays on the dashboard.

---

### Step 11: Remove the card click handler

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`

**Covers:** AC1, AC2

**Context:**
Opening a thread is now the link's job; the `console.log` placeholder in `MindThreadList.tsx:25-27` goes away.

**Changes:**

1. In `MindThreadCard.tsx` remove the `onClick` prop from `MindThreadCardProps` and the destructuring, `handleClick`, and `onClick={handleClick}` on the root `Box`. Keep `cursor="pointer"`.
2. In `MindThreadList.tsx` remove `handleThreadClick`, the `onClick={handleThreadClick}` prop and the now unused `MindThread` type import.

**Verification MANUAL:** `npm run ts:check` and `npm run lint` pass; cards still open the thread page.

---

### Step 12: Add the thread page constants, types and title util

**New files:**

- `src/pages/ThreadPage/ThreadPage.constants.ts`
- `src/pages/ThreadPage/ThreadPage.types.ts`
- `src/pages/ThreadPage/ThreadPage.utils.ts`

**Covers:** AC28, AC37, AC38, AC41, AC44, AC45, AC48

**Changes:**

1. Create `ThreadPage.constants.ts`:

   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("ThreadPage__");

   export const ThreadPageTestId = {
     container: createTestId("container"),
   } as const;

   export const ThreadStatus = {
     Loading: "loading",
     Loaded: "loaded",
     NotFound: "not-found",
     Error: "error",
   } as const;

   export const THREAD_PAGE_MIN_WIDTH = "768px";
   export const LOADING_THREAD_LABEL = "Loading thread";
   export const BACK_TO_DASHBOARD_LABEL = "Back to Dashboard";
   export const THREAD_NOT_FOUND_MESSAGE = "This thread doesn't exist or was deleted.";
   export const THREAD_LOAD_ERROR_MESSAGE = "Couldn't load this thread. Please reload the page.";
   ```

2. Create `ThreadPage.types.ts`:

   ```ts
   import type { MindThread } from "@/types";
   import type { ThreadStatus } from "./ThreadPage.constants";

   export type ThreadStatusType = (typeof ThreadStatus)[keyof typeof ThreadStatus];

   export type GetThreadPageTitleParams = {
     thread: MindThread | null;
     threadStatus: ThreadStatusType;
   };
   ```

3. Create `ThreadPage.utils.ts`:

   ```ts
   import { APP_NAME } from "@/components/shared";
   import { ThreadStatus } from "./ThreadPage.constants";
   import type { GetThreadPageTitleParams } from "./ThreadPage.types";

   const getPageTitle = (pageName: string) => {
     return `${pageName} · ${APP_NAME}`;
   };

   export const getThreadPageTitle = ({ thread, threadStatus }: GetThreadPageTitleParams) => {
     if (thread !== null) {
       return getPageTitle(thread.title);
     }

     if (threadStatus === ThreadStatus.NotFound) {
       return getPageTitle("Thread not found");
     }

     return APP_NAME;
   };
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 13: Add the thread page hooks

**New files:**

- `src/pages/ThreadPage/ThreadPage.hooks.ts`

**Covers:** AC8, AC9, AC29, AC36, AC39, AC40, AC41, AC45, AC49, AC50

**Context:**
`useThreadState` follows `useThreadsState` in `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts:52-83` (see `Style notes`). It does not call `notify`, so no popup is shown on failure (AC50). `useNavigateToDashboard` is shared by the header back arrow and the "Back to Dashboard" button.

**Changes:**

1. Create `ThreadPage.hooks.ts`:

   ```ts
   import { useEffect, useState } from "react";
   import { useNavigate } from "react-router";
   import { useThreadsService } from "@/services";
   import { AppPath } from "@/routing/routing.constants";
   import type { MindThread } from "@/types";
   import { ThreadStatus } from "./ThreadPage.constants";
   import type { ThreadStatusType } from "./ThreadPage.types";

   export const useThreadState = (threadId: string) => {
     const threadsService = useThreadsService();

     const [thread, setThread] = useState<MindThread | null>(null);

     const [threadStatus, setThreadStatus] = useState<ThreadStatusType>(
       ThreadStatus.Loading
     );

     useEffect(() => {
       if (threadStatus !== ThreadStatus.Loading) {
         return;
       }

       let isActive = true;

       const loadThread = async () => {
         try {
           const storedThread = await threadsService.getThread(threadId);

           if (!isActive) {
             return;
           }

           setThread(storedThread);

           setThreadStatus(
             storedThread === null ? ThreadStatus.NotFound : ThreadStatus.Loaded
           );
         } catch {
           if (isActive) {
             setThreadStatus(ThreadStatus.Error);
           }
         }
       };

       loadThread();

       return () => {
         isActive = false;
       };
     }, [threadId, threadStatus, threadsService]);

     return { thread, threadStatus };
   };

   export const useNavigateToDashboard = () => {
     const navigate = useNavigate();

     const navigateToDashboard = () => {
       navigate(AppPath.Dashboard);
     };

     return navigateToDashboard;
   };
   ```

**Verification MANUAL:** `npm run ts:check` and `npm run lint` pass.

---

### Step 14: Create the BackToDashboardIconButton component

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/components/BackToDashboardIconButton/BackToDashboardIconButton.tsx`
- `src/pages/ThreadPage/components/ThreadHeader/components/BackToDashboardIconButton/BackToDashboardIconButton.constants.ts`
- `src/pages/ThreadPage/components/ThreadHeader/components/BackToDashboardIconButton/index.ts`

**Covers:** AC12, AC29, AC30

**Context:**
The back arrow always goes to `/` rather than `navigate(-1)`, so it also works when the thread page was opened in a new tab or from a bookmark. `color="fg"` makes the icon follow the forced color mode of the header.

**Changes:**

1. Create `BackToDashboardIconButton.constants.ts` with `BackToDashboardIconButtonTestId = { container: createTestId("container") }` (prefix `"BackToDashboardIconButton__"`).
2. Create `BackToDashboardIconButton.tsx`:

   ```tsx
   import { LuArrowLeft } from "react-icons/lu";
   import { IconButton } from "@/components/lib";
   import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
   import { useNavigateToDashboard } from "@/pages/ThreadPage/ThreadPage.hooks";
   import { BackToDashboardIconButtonTestId } from "./BackToDashboardIconButton.constants";

   export const BackToDashboardIconButton = () => {
     const navigateToDashboard = useNavigateToDashboard();

     return (
       <IconButton
         data-testid={BackToDashboardIconButtonTestId.container}
         aria-label={BACK_TO_DASHBOARD_LABEL}
         variant="ghost"
         color="fg"
         size="sm"
         onClick={navigateToDashboard}
       >
         <LuArrowLeft />
       </IconButton>
     );
   };
   ```

3. Create `index.ts` exporting `./BackToDashboardIconButton` and `./BackToDashboardIconButton.constants`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 15: Create the ThreadHeaderColorScope component

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope/ThreadHeaderColorScope.tsx`
- `src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope/index.ts`
- `src/pages/ThreadPage/components/ThreadHeader/components/index.ts`

**Covers:** AC17, AC18, AC43, AC47

**Context:**
`LightMode` and `DarkMode` (`src/components/lib/color-mode/components/`) are `display: contents` spans that force the theme tokens for their children, so the header items become a forced dark-text or light-text scope without changing the layout. Without a thread color, the children render as they are and follow the global color mode, like the dashboard header.

**Changes:**

1. Create `ThreadHeaderColorScope.tsx`:

   ```tsx
   import type { ReactNode } from "react";
   import { DarkMode, LightMode } from "@/components/lib";
   import { getContrastColorMode } from "@/utils";

   type ThreadHeaderColorScopeProps = {
     backgroundColor?: string;
     children: ReactNode;
   };

   export const ThreadHeaderColorScope = ({
     backgroundColor,
     children,
   }: ThreadHeaderColorScopeProps) => {
     if (backgroundColor === undefined) {
       return children;
     }

     const colorMode = getContrastColorMode(backgroundColor);

     return colorMode === "light" ? (
       <LightMode>{children}</LightMode>
     ) : (
       <DarkMode>{children}</DarkMode>
     );
   };
   ```

2. Create `index.ts`: `export * from "./ThreadHeaderColorScope";`
3. Create `ThreadHeader/components/index.ts` exporting `./BackToDashboardIconButton` and `./ThreadHeaderColorScope`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 16: Create the ThreadHeader component

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/ThreadHeader.tsx`
- `src/pages/ThreadPage/components/ThreadHeader/ThreadHeader.constants.ts`
- `src/pages/ThreadPage/components/ThreadHeader/index.ts`

**Covers:** AC12, AC13, AC14, AC15, AC16, AC17, AC18, AC20, AC42, AC43, AC46, AC47

**Context:**
A `1fr auto 1fr` grid keeps the logo in the true horizontal center whatever the title length; `minWidth="0"` plus `truncate` stop a long title from pushing into the logo. Padding and bottom border match `DashboardHeader.tsx`. Without a thread (loading, not found, error) the header has no background and no title, like the dashboard header. The header shows only the title from the thread: no counts, date, or actions.

**Changes:**

1. Create `ThreadHeader.constants.ts` with `ThreadHeaderTestId = { container: createTestId("container"), title: createTestId("title") }` (prefix `"ThreadHeader__"`).
2. Create `ThreadHeader.tsx`:

   ```tsx
   import { Box, ColorModeButton, HStack, Text } from "@/components/lib";
   import { AppLogo } from "@/components/shared";
   import type { MindThread } from "@/types";
   import { BackToDashboardIconButton, ThreadHeaderColorScope } from "./components";
   import { ThreadHeaderTestId } from "./ThreadHeader.constants";

   type ThreadHeaderProps = {
     thread: MindThread | null;
   };

   export const ThreadHeader = ({ thread }: ThreadHeaderProps) => {
     const backgroundColor = thread?.color;

     return (
       <Box
         as="header"
         data-testid={ThreadHeaderTestId.container}
         display="grid"
         gridTemplateColumns="1fr auto 1fr"
         alignItems="center"
         gap="4"
         px="6"
         py="4"
         borderBottomWidth="1px"
         borderColor="border"
         backgroundColor={backgroundColor}
       >
         <ThreadHeaderColorScope backgroundColor={backgroundColor}>
           <HStack gap="3" minWidth="0">
             <BackToDashboardIconButton />

             {thread === null ? null : (
               <Text
                 data-testid={ThreadHeaderTestId.title}
                 as="h2"
                 fontSize="lg"
                 fontWeight="semibold"
                 color="fg"
                 truncate
               >
                 {thread.title}
               </Text>
             )}
           </HStack>

           <AppLogo />

           <HStack justifyContent="flex-end">
             <ColorModeButton />
           </HStack>
         </ThreadHeaderColorScope>
       </Box>
     );
   };
   ```

3. Create `index.ts` exporting `./ThreadHeader` and `./ThreadHeader.constants`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 17: Create the ThreadColumn component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumn/ThreadColumn.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumn/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/index.ts`

**Covers:** AC23, AC24, AC25, AC26

**Changes:**

1. Create `ThreadColumn.tsx`:

   ```tsx
   import { Box, Text } from "@/components/lib";

   type ThreadColumnProps = {
     "data-testid"?: string;
     heading?: string;
     message: string;
     isCentered?: boolean;
   };

   export const ThreadColumn = ({
     "data-testid": dataTestId,
     heading,
     message,
     isCentered = false,
   }: ThreadColumnProps) => {
     const alignment = isCentered ? "center" : "flex-start";

     return (
       <Box
         as="section"
         data-testid={dataTestId}
         display="flex"
         flexDirection="column"
         alignItems={alignment}
         justifyContent={alignment}
         gap="3"
         p="4"
         minWidth="0"
       >
         {heading === undefined ? null : (
           <Text as="h3" fontSize="md" fontWeight="semibold" color="fg">
             {heading}
           </Text>
         )}

         <Text color="fg.muted">{message}</Text>
       </Box>
     );
   };
   ```

2. Create `index.ts`: `export * from "./ThreadColumn";`
3. Create `ThreadColumns/components/index.ts`: `export * from "./ThreadColumn";`

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 18: Create the ThreadColumns component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/index.ts`

**Covers:** AC21, AC22, AC23, AC24, AC25, AC26, AC27, AC40

**Context:**
`divideX` draws a left border on every column after the first, giving the vertical separators. Two fixed `280px` tracks plus `1fr` give two equal columns and a third that fills the rest. Together with the page's `768px` minimum width (step 21), narrow windows scroll horizontally instead of stacking.

**Changes:**

1. Create `ThreadColumns.constants.ts`:

   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("ThreadColumns__");

   export const ThreadColumnsTestId = {
     container: createTestId("container"),
     sectionsColumn: createTestId("sections-column"),
     pagesColumn: createTestId("pages-column"),
     contentColumn: createTestId("content-column"),
   } as const;

   export const THREAD_COLUMNS_TEMPLATE = "280px 280px 1fr";

   export const SECTIONS_COLUMN_HEADING = "Sections";
   export const SECTIONS_COLUMN_MESSAGE = "No sections yet.";
   export const PAGES_COLUMN_HEADING = "Pages";
   export const PAGES_COLUMN_MESSAGE = "Select a section to see its pages.";
   export const CONTENT_COLUMN_MESSAGE = "Select a page to see its content.";
   ```

2. Create `ThreadColumns.tsx`:

   ```tsx
   import { Box } from "@/components/lib";
   import { ThreadColumn } from "./components";
   import {
     CONTENT_COLUMN_MESSAGE,
     PAGES_COLUMN_HEADING,
     PAGES_COLUMN_MESSAGE,
     SECTIONS_COLUMN_HEADING,
     SECTIONS_COLUMN_MESSAGE,
     THREAD_COLUMNS_TEMPLATE,
     ThreadColumnsTestId,
   } from "./ThreadColumns.constants";

   export const ThreadColumns = () => {
     return (
       <Box
         data-testid={ThreadColumnsTestId.container}
         display="grid"
         gridTemplateColumns={THREAD_COLUMNS_TEMPLATE}
         flexGrow={1}
         divideX="1px"
         divideColor="border"
       >
         <ThreadColumn
           data-testid={ThreadColumnsTestId.sectionsColumn}
           heading={SECTIONS_COLUMN_HEADING}
           message={SECTIONS_COLUMN_MESSAGE}
         />

         <ThreadColumn
           data-testid={ThreadColumnsTestId.pagesColumn}
           heading={PAGES_COLUMN_HEADING}
           message={PAGES_COLUMN_MESSAGE}
         />

         <ThreadColumn
           data-testid={ThreadColumnsTestId.contentColumn}
           message={CONTENT_COLUMN_MESSAGE}
           isCentered
         />
       </Box>
     );
   };
   ```

3. Create `index.ts` exporting `./ThreadColumns` and `./ThreadColumns.constants`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 19: Create the ThreadMessage component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadMessage/ThreadMessage.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadMessage/ThreadMessage.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadMessage/index.ts`

**Covers:** AC41, AC45, AC49

**Context:**
Same shape as `EmptyThreadList.tsx` (centered message plus an accent button), used for both the not-found and the load-failed states.

**Changes:**

1. Create `ThreadMessage.constants.ts` with `ThreadMessageTestId = { container, message, backButton }` (prefix `"ThreadMessage__"`).
2. Create `ThreadMessage.tsx`:

   ```tsx
   import { Button, Text, VStack } from "@/components/lib";
   import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
   import { useNavigateToDashboard } from "@/pages/ThreadPage/ThreadPage.hooks";
   import { ThreadMessageTestId } from "./ThreadMessage.constants";

   type ThreadMessageProps = {
     message: string;
   };

   export const ThreadMessage = ({ message }: ThreadMessageProps) => {
     const navigateToDashboard = useNavigateToDashboard();

     return (
       <VStack data-testid={ThreadMessageTestId.container} gap="4" alignItems="center" p="10">
         <Text data-testid={ThreadMessageTestId.message} fontSize="lg" color="fg.muted">
           {message}
         </Text>

         <Button
           data-testid={ThreadMessageTestId.backButton}
           background="accent"
           onClick={navigateToDashboard}
         >
           {BACK_TO_DASHBOARD_LABEL}
         </Button>
       </VStack>
     );
   };
   ```

3. Create `index.ts` exporting `./ThreadMessage` and `./ThreadMessage.constants`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 20: Create the ThreadView and ThreadContent components

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadView/ThreadView.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadView/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/ThreadContent.tsx`
- `src/pages/ThreadPage/components/ThreadContent/ThreadContent.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/index.ts`
- `src/pages/ThreadPage/components/index.ts`

**Covers:** AC40, AC41, AC45

**Context:**
Mirrors `DashboardContent` (the `main` area) and `ThreadsSection` (early returns by status). While loading the content area is empty; the full-screen loader covers it.

**Changes:**

1. Create `ThreadView.tsx`:

   ```tsx
   import { ThreadStatus, THREAD_LOAD_ERROR_MESSAGE, THREAD_NOT_FOUND_MESSAGE } from "@/pages/ThreadPage/ThreadPage.constants";
   import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
   import { ThreadColumns } from "../ThreadColumns";
   import { ThreadMessage } from "../ThreadMessage";

   type ThreadViewProps = {
     threadStatus: ThreadStatusType;
   };

   export const ThreadView = ({ threadStatus }: ThreadViewProps) => {
     if (threadStatus === ThreadStatus.Loading) {
       return null;
     }

     if (threadStatus === ThreadStatus.NotFound) {
       return <ThreadMessage message={THREAD_NOT_FOUND_MESSAGE} />;
     }

     if (threadStatus === ThreadStatus.Error) {
       return <ThreadMessage message={THREAD_LOAD_ERROR_MESSAGE} />;
     }

     return <ThreadColumns />;
   };
   ```

2. Create `ThreadView/index.ts`, and `ThreadContent/components/index.ts` exporting `./ThreadColumns`, `./ThreadMessage`, `./ThreadView`.
3. Create `ThreadContent.constants.ts` with `ThreadContentTestId = { container }` (prefix `"ThreadContent__"`).
4. Create `ThreadContent.tsx`:

   ```tsx
   type ThreadContentProps = {
     threadStatus: ThreadStatusType;
   };

   export const ThreadContent = ({ threadStatus }: ThreadContentProps) => {
     return (
       <Box
         data-testid={ThreadContentTestId.container}
         as="main"
         display="flex"
         flexDirection="column"
         flexGrow={1}
         backgroundColor="bg"
       >
         <ThreadView threadStatus={threadStatus} />
       </Box>
     );
   };
   ```

5. Create `ThreadContent/index.ts` exporting `./ThreadContent` and `./ThreadContent.constants`.
6. Create `src/pages/ThreadPage/components/index.ts` exporting `./ThreadHeader` and `./ThreadContent`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 21: Compose the ThreadPage

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC8, AC9, AC27, AC28, AC35, AC36, AC37, AC38, AC39, AC40, AC44, AC48

**Context:**
`#root` is a full-height flex column (`src/index.css`), so `flexGrow={1}` fills the window. `minWidth` keeps the columns side by side below 768px and makes the page scroll horizontally. The loader renders on top of the layout while the status is `Loading`.

**Changes:**

1. Replace the placeholder with:

   ```tsx
   import { useParams } from "react-router";
   import { Box, FullScreenLoader } from "@/components/lib";
   import { useDocumentTitle } from "@/hooks";
   import { ThreadContent, ThreadHeader } from "./components";
   import {
     LOADING_THREAD_LABEL,
     THREAD_PAGE_MIN_WIDTH,
     ThreadPageTestId,
     ThreadStatus,
   } from "./ThreadPage.constants";
   import { useThreadState } from "./ThreadPage.hooks";
   import { getThreadPageTitle } from "./ThreadPage.utils";

   export const ThreadPage = () => {
     const { threadId = "" } = useParams();
     const { thread, threadStatus } = useThreadState(threadId);

     useDocumentTitle(getThreadPageTitle({ thread, threadStatus }));

     return (
       <Box
         data-testid={ThreadPageTestId.container}
         display="flex"
         flexDirection="column"
         flexGrow={1}
         minWidth={THREAD_PAGE_MIN_WIDTH}
       >
         <ThreadHeader thread={thread} />
         <ThreadContent threadStatus={threadStatus} />

         {threadStatus === ThreadStatus.Loading ? (
           <FullScreenLoader label={LOADING_THREAD_LABEL} />
         ) : null}
       </Box>
     );
   };
   ```

**Verification MANUAL:** In the browser: open a thread from the dashboard — header in the thread color with readable text, back arrow and title on the left, logo centered, toggle on the right, three columns with the placeholder texts, tab title `<title> · Mind Threads`; the back arrow and the browser Back button return to the dashboard in the same view mode with the original tab title; `/threads/unknown` shows the not-found message and title; with `localStorage.threads = "not-json"` the error message shows; at a window width below 768px the page scrolls horizontally.

## Phase 2: Unit tests

---

### Step 1: Add the shared router test helper

**New files:**

- `src/__test-fixtures__/router.tsx`

**File:**
`src/__test-fixtures__/index.ts`, `src/__test-fixtures__/threadsService.ts`

**Context:**
Every test that renders a card or a back button now needs a router. One helper renders the component under test at a route and a location marker on every other route, so tests can assert where a click navigated. The services mock gets a `getThread` override so thread page tests can keep loading pending with a deferred promise (`unit-tests.md` rule 15).

**Changes:**

1. Create `router.tsx`:

   ```tsx
   import type { ReactElement } from "react";
   import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
   import { renderWithUIProvider } from "@/components/lib";
   import { AppPath } from "@/routing/routing.constants";

   export const LOCATION_MARKER_TEST_ID = "TestRouter__location";

   type RenderWithRouterParams = {
     ui: ReactElement;
     path?: string;
     initialPath?: string;
   };

   const LocationMarker = () => {
     const location = useLocation();

     return <p data-testid={LOCATION_MARKER_TEST_ID}>{location.pathname}</p>;
   };

   export const renderWithRouter = ({
     ui,
     path = AppPath.Dashboard,
     initialPath = path,
   }: RenderWithRouterParams) => {
     const router = createMemoryRouter(
       [
         { path, element: ui },
         { path: "*", element: <LocationMarker /> },
       ],
       { initialEntries: [initialPath] }
     );

     const renderResult = renderWithUIProvider(<RouterProvider router={router} />);

     return { router, ...renderResult };
   };
   ```

2. Export it from `src/__test-fixtures__/index.ts`.
3. In `threadsService.ts`, add `"getThread"` to the `Pick` in `ThreadsServiceOverrides`, delete it in `resetThreadsServiceOverrides`, and wrap it in `createServicesMock` the same way as `updateThread`.

**Verification:** `npm run test` — the existing suite still compiles and the tests that do not render cards still pass.

---

### Step 2: Test the route helper

**New files:**

- `src/routing/__tests__/routing.utils.test.ts`

**Scenarios:**

- `getThreadPath("test-thread")` returns `"/threads/test-thread"`.
- An id with a reserved character (e.g. `"a/b"`) is encoded (`"/threads/a%2Fb"`).

**Verification:** `npx vitest run src/routing` passes.

---

### Step 3: Test the LinkOverlay adapter

**New files:**

- `src/components/lib/LinkOverlay/__tests__/LinkOverlay.test.tsx`

**Scenarios:**

- With `asChild` and an `<a href="/target">Title</a>` child, renders one link named "Title" with `href="/target"` and the class `chakra-linkbox__overlay`.
- Without `asChild`, renders its own link with the children as text.

**Verification:** `npx vitest run src/components/lib/LinkOverlay` passes.

---

### Step 4: Test the FullScreenLoader

**New files:**

- `src/components/lib/FullScreenLoader/__tests__/FullScreenLoader.test.tsx`

**Covers:** AC36, AC37

**Scenarios:**

- Renders an element with role `status` named by the `label` prop ("Loading thread").
- The container has `position: fixed` (covers the page).

**Verification:** `npx vitest run src/components/lib/FullScreenLoader` passes.

---

### Step 5: Test useDocumentTitle

**New files:**

- `src/hooks/useDocumentTitle/__tests__/useDocumentTitle.test.ts`

**Covers:** AC28, AC35

**Scenarios** (use a `setupHook({ title })` with `renderHook` and `initialProps`; set `document.title = "Dashboard title"` before each test):

- Sets `document.title` to the given title.
- After `rerender` with a new title, `document.title` is the new title.
- After `unmount`, `document.title` is `"Dashboard title"` again, also after the title changed once.

**Verification:** `npx vitest run src/hooks/useDocumentTitle` passes.

---

### Step 6: Test getContrastColorMode

**New files:**

- `src/utils/__tests__/getContrastColorMode.test.ts`

**Covers:** AC17

**Scenarios** (use `it.each`):

- `"#ffffff"` → `"light"`; `"#000000"` → `"dark"`.
- Nord yellow `"#ebcb8b"` → `"light"`; nord 0 `"#2e3440"` → `"dark"`.
- Uppercase hex `"#FF6B6B"` (the card fixture color) → `"light"`.

**Verification:** `npx vitest run src/utils` passes.

---

### Step 7: Test getThread in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC8, AC9, AC41, AC45

**Scenarios** (new `describe("getThread")`, same style as `describe("getThreads")`):

- Resolves the stored thread with the given id (seed `mindThreadFixtures`, ask for `"thread-2"`).
- Resolves `null` for an unknown id.
- Resolves `null` when nothing is stored.
- Rejects with `SyntaxError` when the stored value is malformed JSON (`MALFORMED_JSON`, console error silenced).
- Rejects with `INVALID_THREADS_DATA_ERROR` when the stored value is not a list of threads.

**Verification:** `npx vitest run src/services` passes.

---

### Step 8: Update the tests touched by the AppLogo move

**File:**
`src/components/shared/AppLogo/__tests__/AppLogo.test.tsx`, `src/pages/DashboardPage/components/DashboardHeader/__tests__/DashboardHeader.test.tsx`

**Covers:** AC14

**Changes:**

1. In `DashboardHeader.test.tsx`, import `AppLogoTestId` from `@/components/shared` instead of `../components`.
2. In `AppLogo.test.tsx`, assert the heading name with `APP_NAME` instead of the literal; keep the rest.

**Verification:** `npx vitest run src/components/shared/AppLogo src/pages/DashboardPage/components/DashboardHeader` passes.

---

### Step 9: Rewrite the MindThreadCard tests for the link

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Covers:** AC1–AC7, AC10, AC11

**Changes:**

1. `setup(thread, forMode)` renders the card with `renderWithRouter({ ui: <MindThreadCard ... /> })` (no `onClick` prop) after `userEvent.setup()`, and returns `{ user }`.
2. Remove `mockOnClick` and the "calls onClick" helpers and tests.
3. Add a helper `getLocation()` that reads `screen.getByTestId(LOCATION_MARKER_TEST_ID)` and a helper `getCardLink()` → `screen.getByRole("link", { name: "Test Thread" })`.
4. Scenarios, run for both grid and list layout through the existing shared helper pattern:
   - The card has a link named after the thread title with `href="/threads/test-thread"`.
   - Clicking the card container (not the title) navigates: the location marker shows `/threads/test-thread`.
   - `user.tab()` focuses the link; `user.keyboard("{Enter}")` navigates.
   - Ctrl+click (`user.keyboard("{Control>}")`, click, `"{/Control}"`), Meta+click, and middle-click (`user.pointer({ keys: "[MouseMiddle]", target: link })`) do not navigate in place: the card is still rendered and no location marker exists.
   - Clicking the actions button opens the menu and does not navigate.
   - Choosing Edit / Delete calls `onEdit` / `onDelete` with the thread and does not navigate.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard` passes.

---

### Step 10: Update the CardActions tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/__tests__/CardActions.test.tsx`

**Covers:** AC10

**Changes:**

1. Remove any test that relies on the container stopping click propagation.
2. Add: the actions container has `z-index: 1` (`toHaveStyle({ zIndex: "1" })`), so it stays above the link overlay.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components` passes.

---

### Step 11: Wrap the other dashboard tests that render cards in the router

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/__tests__/MindThreadList.test.tsx`, `src/pages/DashboardPage/components/DashboardContent/components/ThreadsSection/__tests__/ThreadsSection.test.tsx`, `src/pages/DashboardPage/components/DashboardContent/__tests__/DashboardContent.test.tsx`, plus any other test file that `npm run test` reports with "useHref() may be used only in the context of a <Router> component"

**Covers:** AC1, AC2

**Changes:**

1. In each file, `setup()` renders through `renderWithRouter({ ui: <Component /> })` instead of `renderWithUIProvider`.
2. In `MindThreadList.test.tsx`, replace "calls console.log with the thread when a card is clicked" with "opens the clicked thread": clicking the first card's link shows `/threads/thread-1` in the location marker.

**Verification:** `npx vitest run src/pages/DashboardPage/components` passes.

---

### Step 12: Update the DashboardPage tests

**File:**
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC1, AC2, AC10, AC11

**Changes:**

1. `setup()` renders `renderWithRouter({ ui: <DashboardPage /> })` and returns `{ user, unmount }`, as today.
2. Replace the two "does not open the thread when Edit/Delete is chosen" tests (they spy on `console.log`): after choosing the menu item, the modal is open and no location marker is rendered.
3. Add "opens the thread page when a card is clicked in grid view and in list view": seed `mindThreadFixturesWithSameTitle`, click the first "Testing Strategy" link → marker shows `/threads/same-title-1`; render again, switch to list view, click → same path.

**Verification:** `npx vitest run src/pages/DashboardPage/__tests__` passes.

---

### Step 13: Test the thread page title util

**New files:**

- `src/pages/ThreadPage/__tests__/ThreadPage.utils.test.ts`

**Covers:** AC28, AC38, AC44, AC48

**Scenarios:**

- Loaded thread "Testing Strategy" → `"Testing Strategy · Mind Threads"`.
- Loading, no thread → `"Mind Threads"`.
- Not found → `"Thread not found · Mind Threads"`.
- Error → `"Mind Threads"`.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.utils.test.ts` passes.

---

### Step 14: Test the thread page hooks

**New files:**

- `src/pages/ThreadPage/__tests__/ThreadPage.hooks.test.tsx`

**Covers:** AC8, AC29, AC39, AC40, AC41, AC45, AC50

**Context:**
`useNavigateToDashboard` needs a router; render the hooks inside a `MemoryRouter` wrapper. Mock `@/services` once with `createServicesMock` (as in `DashboardPageLoader.test.tsx:37`) and use `threadsServiceOverrides.getThread` with `createDeferred` to keep loading pending.

**Scenarios:**

- `useThreadState`: starts with `Loading` and `thread: null` while `getThread` is pending.
- Resolves to `Loaded` with the seeded thread for a stored id.
- Resolves to `NotFound` with `thread: null` for an unknown id.
- Resolves to `Error` when the stored data is malformed, and no notification is shown.
- `useNavigateToDashboard`: with a `MemoryRouter initialEntries={["/threads/test-thread"]}` wrapper, `renderHook(() => ({ navigateToDashboard: useNavigateToDashboard(), location: useLocation() }))`; after calling `navigateToDashboard()` inside `act`, `result.current.location.pathname` is `"/"`.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.hooks.test.tsx` passes.

---

### Step 15: Test the BackToDashboardIconButton

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/components/BackToDashboardIconButton/__tests__/BackToDashboardIconButton.test.tsx`

**Covers:** AC29, AC30

**Scenarios** (`renderWithRouter({ ui: <BackToDashboardIconButton />, path: AppPath.Thread, initialPath: "/threads/test-thread" })`):

- Renders a button named "Back to Dashboard".
- Clicking it shows `/` in the location marker.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadHeader/components/BackToDashboardIconButton` passes.

---

### Step 16: Test the ThreadHeaderColorScope

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope/__tests__/ThreadHeaderColorScope.test.tsx`

**Covers:** AC17, AC18

**Scenarios** (render a child `<p>Child</p>`):

- With a light background (`"#ebcb8b"`), the child is inside an element with the classes `chakra-theme light`.
- With a dark background (`"#2e3440"`), the child is inside `chakra-theme dark`.
- Without a background, the child has no `.chakra-theme` ancestor.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope` passes.

---

### Step 17: Test the ThreadHeader

**New files:**

- `src/pages/ThreadPage/components/ThreadHeader/__tests__/ThreadHeader.test.tsx`

**Covers:** AC12–AC16, AC18, AC20, AC42, AC43, AC46, AC47

**Context:**
Mock `@/components/lib/color-mode/color-mode.hooks` the same way as `DashboardHeader.test.tsx:10-14`.

**Scenarios** (`setup(thread)` with `renderWithRouter`, thread `{ ...mindThreadFixture, title: "Testing Strategy" }`):

- With a thread: renders, in DOM order, the "Back to Dashboard" button, the "Testing Strategy" heading, the app logo, and the color mode toggle.
- The header background is the thread color (`toHaveStyle({ backgroundColor: "#FF6B6B" })`).
- The header items are inside a forced color scope (`chakra-theme`).
- No sections, pages, "Updated" text, and no Edit/Delete/"Thread actions" buttons are rendered.
- Clicking the toggle calls `toggleColorMode` and the background stays the thread color.
- With `thread={null}`: back button, logo and toggle are rendered; no title; no inline background color; no `chakra-theme` scope.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadHeader` passes.

---

### Step 18: Test the ThreadColumn and ThreadColumns components

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumn/__tests__/ThreadColumn.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/__tests__/ThreadColumns.test.tsx`

**Covers:** AC21–AC26

**Scenarios:**

- `ThreadColumn`: with `heading`, renders an `h3` with it and the message; without `heading`, renders no heading; `isCentered` centers the content (`alignItems`/`justifyContent: center`), otherwise `flex-start`.
- `ThreadColumns`: the container's grid template is `THREAD_COLUMNS_TEMPLATE`; the sections column shows "Sections" and "No sections yet."; the pages column shows "Pages" and "Select a section to see its pages."; the content column shows no heading and "Select a page to see its content."; there are no buttons in the columns (`queryAllByRole("button")` is empty).

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns` passes.

---

### Step 19: Test the ThreadMessage

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadMessage/__tests__/ThreadMessage.test.tsx`

**Covers:** AC41, AC45, AC49

**Scenarios** (`renderWithRouter` at the thread path):

- Renders the given message and a "Back to Dashboard" button.
- Clicking the button shows `/` in the location marker.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadMessage` passes.

---

### Step 20: Test the ThreadView and ThreadContent

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadView/__tests__/ThreadView.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/__tests__/ThreadContent.test.tsx`

**Covers:** AC40, AC41, AC45

**Scenarios:**

- `ThreadView` (`it.each` over statuses): `Loading` renders nothing; `Loaded` renders the columns; `NotFound` renders `THREAD_NOT_FOUND_MESSAGE` and no columns; `Error` renders `THREAD_LOAD_ERROR_MESSAGE` and no columns.
- `ThreadContent`: renders a `main` landmark containing the view for the given status.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent` passes.

---

### Step 21: Rewrite the ThreadPage tests

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC8, AC9, AC13, AC16, AC27, AC28, AC35–AC48, AC50

**Context:**
Replaces the placeholder heading test. Mock `@/services` with `createServicesMock` and the color-mode hooks as in the sibling tests. `setup({ threadId })` calls `userEvent.setup()` and `renderWithRouter({ ui: <ThreadPage />, path: AppPath.Thread, initialPath: getThreadPath(threadId) })`, and returns `{ user, unmount }`. Set `document.title = "Dashboard title"` before each test.

**Scenarios:**

- While `getThread` is pending (deferred override): a `status` named "Loading thread" is shown, the tab title is "Mind Threads", and the header has no title.
- After the deferred resolves: the loader is removed (`waitForElementToBeRemoved` on the stored loader element), the header shows "Testing Strategy" on the thread color, the three columns are shown, and the tab title is "Testing Strategy · Mind Threads".
- A seeded thread opened directly by its address (a reload or bookmark) is shown; unmounting and rendering again shows it again.
- The page container has `min-width: 768px`.
- Unknown id: the not-found message and the "Back to Dashboard" button are shown, no columns, no header title, no header background, tab title "Thread not found · Mind Threads", and no notification (`vi.spyOn(notify, "error")` and `vi.spyOn(notify, "success")`, which keep the real implementation, are not called).
- Malformed storage: the load-error message and button are shown, no header title or background, tab title "Mind Threads", and no notification (same spies).
- After unmount, the tab title is "Dashboard title" again.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.test.tsx` passes.

---

### Step 22: Test the navigation between the dashboard and a thread

**File:**
`src/__tests__/App.test.tsx`

**Covers:** AC1, AC2, AC3, AC29, AC31, AC32, AC33, AC34, AC35

**Context:**
These flows cross both pages, so they run against `App`. Render it with `createMemoryRouter([{ path: "*", element: <App /> }], { initialEntries })` and `RouterProvider`, so the test can call `router.navigate(-1)` to press the browser's Back button.

**Changes:**

1. Replace "renders ThreadPage at /threads/:threadId" with: a seeded thread at `/threads/<id>` shows its title in the thread header.
2. Add:
   - Grid view: seed three threads, click the second card → its thread page; click "Back to Dashboard" → dashboard in grid view with the same titles in the same order.
   - List view: switch to list view, open a thread, `router.navigate(-1)` (inside `act`) → dashboard in list view with the same titles in the same order.
   - Tab title: the title before opening a thread equals the title after returning.
   - Tab: pressing Tab repeatedly reaches every card link (collect `document.activeElement` names).

**Verification:** `npx vitest run src/__tests__/App.test.tsx` passes.

---

### Step 23: Test that the color mode is kept across pages

**New files:**

- `src/__tests__/App.colorMode.test.tsx`

**Covers:** AC19

**Context:**
`App.test.tsx` mocks `useColorMode` for the whole file, so the real next-themes flow needs its own file without the mock.

**Scenarios:**

- Start on a seeded thread page, click "Toggle color mode", click "Back to Dashboard": `document.documentElement` has the class `dark` on the dashboard (and `localStorage.getItem("theme")` is `"dark"`).

**Verification:** `npx vitest run src/__tests__/App.colorMode.test.tsx` passes, then `npm run test:coverage` passes with the 90% thresholds.

## Phase 3: Documentation

---

### Step 1: Update CLAUDE.md

**File:**
`CLAUDE.md`

**Covers:** AC1, AC14, AC28, AC36

**Changes:**

1. **Architecture → React Router**: add that route paths are in `src/routing/routing.constants.ts` (`AppPath`) and thread links are built with `getThreadPath(threadId)` from `src/routing/routing.utils.ts`, imported by file path (not through the `@/routing` barrel) to avoid an import cycle.
2. **Folder structure → `src/pages/`**: describe `ThreadPage` (header in the thread color with back arrow, title, centered logo, color mode toggle; Sections / Pages / content columns; not-found and load-error states). **`src/components/shared/`**: add `AppLogo` (and `APP_NAME`) to the examples. **`src/hooks/`**: add `useDocumentTitle`. **`src/services/`**: add `getThread` (resolves `null` when not found).
3. **Third-party Libraries → Chakra UI**, "Adapter props worth knowing": add `LinkOverlay` (`asChild`, used with react-router `Link` for whole-card links; raise other interactive elements in the card with `zIndex="1"`) and `FullScreenLoader` (`label`, announced as a `status`).
4. **Code Conventions → Test setup**: add that components rendering links or using navigation are rendered with `renderWithRouter` from `@/__test-fixtures__`, which shows the current path in a location marker.

**Verification MANUAL:** Review that each new paragraph matches the code as built and sits in the existing section it describes.

---

### Step 2: Update the README

**File:**
`README.md`

**Changes:**

1. In **Routes**, change the `/threads/:threadId` row to "Thread page (opened from a dashboard card)".
2. In **Project Structure**, add `components/shared/` (components shared between pages, e.g. `AppLogo`).

**Verification MANUAL:** Review that the README routes table and structure tree match the code.
