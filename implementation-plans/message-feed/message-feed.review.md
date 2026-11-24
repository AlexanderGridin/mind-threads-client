# Code review: Chat Page Message Feed

**Reviewed:** staged changes, 56 files · **Date:** 2026-11-24 · **Style:** `implementation-plans/message-feed/message-feed.style.md`

Checks run while reviewing (read-only): `eslint` on the staged files reports no problems. `npm run ts:check` reports errors only in `__tests__` files (`ChatPageView.test.tsx`, `MessageComposer.test.tsx`, `TagRow.test.tsx`). The plan expects these in Phase 1, and Phase 2 fixes them.

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 1 | 2 | 0 |
| Plan mismatch | 0 | 0 | 1 |

## Points

### 1. A long tag overflows the message bubble and adds a horizontal scrollbar to the feed

**Category:** Bug · **Severity:** High · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/TagChip/TagChip.tsx:27-28`, `.../MessageFeed/components/MessageItem/MessageItem.tsx:42-48`

**Problem:** `TagChip` has `flexShrink={0}` and `whiteSpace="nowrap"`, which suit the composer's horizontally scrolling `TagRow`. In the feed, the tags container uses `flexWrap="wrap"`, but a single tag wider than the bubble (80% of the feed width) cannot wrap or shrink. The composer sets no tag length limit. The chip overflows the bubble, and because `MessageList` has `overflowY="auto"`, the browser also turns `overflow-x` into `auto`. The feed then scrolls horizontally, which breaks AC7 ("never scroll horizontally").

**Proposed fix:** Make the nowrap and no-shrink behavior apply only to the removable chip (the composer's), and let the read-only chip shrink and break long words:

```tsx
flexShrink={onRemove ? 0 : 1}
whiteSpace={onRemove ? "nowrap" : "normal"}
minWidth="0"
```

Add `overflowWrap="anywhere"` to the tag `Text`. Extend the `Box` and `Text` adapters if a prop is missing (`Box` already has `minWidth`).

Tests for Phase 2: in `TagChip.test.tsx`, a chip without `onRemove` allows wrapping (no `nowrap`). A `MessageItem` test renders a very long tag and expects the chip to stay inside the bubble.

---

### 2. A stored message with an invalid `createdAt` crashes the thread page

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/usePageMessagesService/usePageMessagesService.utils.ts:1171-1187` (`isChatMessage`), `.../MessageItem/MessageItem.utils.ts:729-731` (`formatMessageDate`)

**Problem:** `isChatMessage` checks only that `createdAt` is a string. `formatMessageDate` calls `Intl.DateTimeFormat.format(new Date(createdAt))`, which throws `RangeError: Invalid time value` for an unparseable date. A hand-edited or damaged `localStorage.messages` entry passes validation, then throws during render, and nothing catches it. The whole thread page goes blank instead of showing the load error with "Try again" (AC18).

**Proposed fix:** Validate the date in `isChatMessage`, so bad data is rejected as invalid stored data:

```ts
typeof message.createdAt === "string" && !Number.isNaN(Date.parse(message.createdAt))
```

Format the line to fit Prettier and the style file.

Test for Phase 2: in `isChatMessageList` tests, return `false` for a message whose `createdAt` is `"not-a-date"`. In the hook tests, `getPageMessages` rejects with `INVALID_MESSAGES_DATA_ERROR` for it.

---

### 3. Deleting a page, section or thread fails halfway when stored messages are invalid

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/useThreadsService.ts:188` (`removeThreadSection`), `:215` (`removeSectionPage`), `:260` (`deleteThread`)

**Problem:** Each cascade delete calls the message delete before the thread's own bookkeeping. The message delete reads storage through `getMessages`, which throws `INVALID_MESSAGES_DATA_ERROR` for malformed data. When it throws, the page or section is already deleted, but the thread's `pageCount` and section count are never updated, and `deleteThread` leaves a thread whose sections and pages are gone. A retry cannot repair it: the early return (`!isPageDeleted`) skips the update, so the counters stay stale. The new Chat page "Try again" flow explicitly supports invalid `messages` data, so this state is reachable.

**Proposed fix:** Run the message cleanup after the thread update, not before it. It still runs on the early-return path:

```ts
if (isPageDeleted && storedThread) {
  threadsStorage.set(/* unchanged */);
}

await pageMessagesService.deletePageMessages(pageId);
```

Apply the same restructuring to `removeThreadSection`. In `deleteThread`, move `deleteThreadMessages` to after the final `threadsStorage.set`. Orphaned messages are then the worst case, instead of stale counters.

Test for Phase 2: in `useThreadsService.test.ts`, with invalid `messages` data seeded, `removeSectionPage` rejects but the thread's `pageCount` is already decremented. Add the same scenario for `removeThreadSection`.

---

### 4. Hard-coded `pr="16px"` on the message list is not in the plan and bypasses spacing tokens

**Category:** Plan mismatch · **Severity:** Low · **Status:** Fixed
**Location:** `.../MessageFeed/components/MessageList/MessageList.tsx:807`

**Problem:** Step 14 does not include any right padding on the scroll area, and the rest of the feature uses Chakra spacing tokens (`p="3"`, `gap="4"`, `pb="3"`). The pixel literal is the only one and will drift from the theme. It also shifts messages 16px away from the right edge, which the plan and AC5 do not mention.

**Proposed fix:** If the padding is intentional (for example, space for the scrollbar), replace it with the token `pr="4"`. Otherwise remove it, so the layout matches the plan. Reject the point if you keep it as is.

---

---

# Round 2: Phase 2 unit tests

**Reviewed:** staged changes, 29 files (fixtures and tests) · **Date:** 2026-11-24 · **Style:** `implementation-plans/message-feed/message-feed.style.md`

Checks run while reviewing (read-only): `npm run ts:check` and `eslint` on the staged files report no problems. `npx vitest run` passes (129 files, 1056 tests) but reports one unhandled error (point 7). The staged tests cover every Phase 2 step of the plan. No step is missing or implemented differently, so this round has no plan-mismatch points.

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 1 | 0 |
| Duplication | 0 | 1 | 0 |
| Style violation | 0 | 0 | 2 |

## Points

### 4. Test helpers and expected values are copied between test files

**Category:** Duplication · **Severity:** Medium · **Status:** Fixed
**Location:** `ChatPageView/__tests__/ChatPageView.test.tsx:62-69,108,122`, `ChatPageView/__tests__/ChatPageView.hooks.test.tsx:35-37`, `PageView/__tests__/PageView.test.tsx:43-44,60`, `MessageFeed/__tests__/MessageFeed.test.tsx:23-24`, `MessageList/__tests__/MessageList.test.tsx:14-15,33`, `MessagesLoadError/__tests__/MessagesLoadError.test.tsx`, `usePageMessagesService/__tests__/usePageMessagesService.test.ts:19-33`, `useThreadsService/__tests__/useThreadsService.test.ts:1025-1034`

**Problem:** `unit-tests.md` rules 5 and 6 say a helper or mock needed in more than one test file lives in one shared file. These are copied:
- `VIEWPORT_HEIGHT = 600` and `ROW_HEIGHT = 100` in four files.
- Helpers that read the text of rendered messages: `getFeedContents` (PageView), `getMessageContent` (ChatPageView), `getRenderedContents` (MessageList).
- `FIRST_PAGE_MESSAGES` (`[chatMessageFixtures[0], chatMessageFixtures[1]]`) in three files, and again inline in `ThreadPageLoader.hooks.test.tsx` and `useThreadsService.test.ts`.
- `MESSAGES_AFTER_PAGE_DELETE`, `MESSAGES_AFTER_SECTION_DELETE` and `MESSAGES_AFTER_THREAD_DELETE` in two files.
- `LOAD_ERROR` and `ADD_MESSAGE_ERROR` in two files.
- `getTryAgainButton` in `ChatPageView.test.tsx` and `MessagesLoadError.test.tsx`.

If a fixture changes, for example a message is added to page 1, every copy must be edited by hand, and a missed one fails far from the cause.

**Proposed fix:**
- In `messages.ts`, export `firstPageMessageFixtures`, `messagesAfterPageDelete`, `messagesAfterSectionDelete` and `messagesAfterThreadDelete`. Derive them from `chatMessageFixtures` with `filter` on ids, not by index.
- In `messages.queries.ts`, add `getFeedMessageContents()`, which returns the text of the rendered `MessageContentTestId.container` elements. Use it in `PageView`, `ChatPageView` and `MessageList`.
- Give `stubVirtualizerLayout` default values (`viewportHeight = 600`, `rowHeight = 100`) and drop the local constants where the defaults are used.
- Move the error strings to one shared fixture constant.
- Import everything from `@/__test-fixtures__`. Keep `getTryAgainButton` local to each file only if the files do not share a message-feed queries file. Otherwise put it in `messages.queries.ts`.

No new test is needed. Run the affected test files after the change.

---

### 5. A query is passed straight to `expect()`

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `ChatPageView/__tests__/ChatPageView.test.tsx:284-286`

**Problem:** `expect(await screen.findByRole("button", { name: TRY_AGAIN_LABEL })).toBeInTheDocument()` breaks `unit-tests.md` rule 13 (store the element in a constant before asserting). The test also looks the same button up earlier with `getTryAgainButton()`.

**Proposed fix:** Store the element first:

```tsx
const tryAgainButton = await screen.findByRole("button", {
  name: TRY_AGAIN_LABEL,
});

expect(tryAgainButton).toBeInTheDocument();
```

---

### 6. `stubVirtualizerLayout` stubs are never restored in `PageView.test.tsx`

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `PageView/__tests__/PageView.test.tsx:96`

**Problem:** `stubVirtualizerLayout` spies on `HTMLElement.prototype` getters. `vitest.config.ts` has no `restoreMocks`, and this file has no `afterEach` with `vi.restoreAllMocks()`, unlike every other file that uses the stub (plan Step 12, `unit-tests.md` rule 8). The stubs stay active for the whole file, so any test later added here that needs real `clientHeight` or `offsetHeight` values gets the fake ones.

**Proposed fix:** Add `afterEach(() => { vi.restoreAllMocks(); })` to `PageView.test.tsx`, with the block formatted as in the sibling files.

---

---

### 7. Test editors are never destroyed, which causes an unhandled error in the full test run

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/__test-fixtures__/composer/composer.editor.ts:10` (`createTestEditor`), `MessageComposer/__tests__/MessageComposer.extensions.test.ts:87,94`, `MessageComposer.commands.test.ts`, `MessageComposer.utils.test.ts`

**Problem:** `createTestEditor` creates a Tiptap `Editor` that no test destroys. ProseMirror's `DOMObserver` keeps a timer, and after the jsdom environment is torn down it fires and throws `ReferenceError: document is not defined`. `npx vitest run` then reports 1 unhandled error, so the run can fail even though every test passes. (Added by the developer from the "outside the staged changes" list.)

**Proposed fix:** Track the editors that `createTestEditor` creates and destroy them after each test. For example, keep a module-level list in `composer.editor.ts`, push each new editor, and export `destroyTestEditors()` that calls `editor.destroy()` on each and empties the list. Call it in an `afterEach` in the three test files that use `createTestEditor`. Alternatively, register the cleanup once with `afterEach` inside the fixture module.

Test: no new test. Run `npx vitest run` in full and confirm that it reports no unhandled errors.
