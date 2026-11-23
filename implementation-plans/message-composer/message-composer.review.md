# Code review: Chat page: message composer

**Reviewed:** staged changes, 52 files · **Date:** 2026-11-15 · **Style:** `implementation-plans/message-composer/message-composer.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 0 | 2 |

The staged code matches the plan and the acceptance criteria for Phase 1. Unit tests (Phase 2) and docs (Phase 3) have not started, so their absence is not a point.

## Points

### 1. Ctrl+Z after Send brings the sent message back

**Category:** Bug · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.hooks.ts:210`

**Problem:** `clearContent()` runs as a normal ProseMirror transaction, so it lands in the undo history. After Send, pressing Ctrl+Z restores the message that was just sent, but not its tags, which `resetTags` has already cleared. AC31 says Send empties the editor, and AC33 says a sent message is not kept anywhere.

**Proposed fix:** Keep the clear out of the undo history:

```ts
editor
  .chain()
  .setMeta("addToHistory", false)
  .clearContent()
  .focus()
  .run();
```

Test to add in Phase 2: a `useComposerSend` or `MessageComposer` test that types text, sends, triggers undo (Ctrl+Z), and expects the editor to stay empty.

---

### 2. Every toolbar button is exposed as a toggle button

**Category:** Bug · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbarButton/ComposerToolbarButton.tsx:16`, `:29`

**Problem:** `isActive` defaults to `false` and is passed straight to `aria-pressed`. Bold, Italic, Insert link, Insert image and the other buttons therefore render `aria-pressed="false"`, so assistive technology announces them as toggle buttons. They never report a pressed state, even when Bold is active in the editor. The plan added `aria-pressed` only for the Tag button (AC28).

**Proposed fix:** Remove the default and let `aria-pressed` be omitted when `isActive` is not given:

```tsx
export const ComposerToolbarButton = ({
  command,
  isActive,
  onCommand,
}: ComposerToolbarButtonProps) => {
  // ...
  <IconButton
    aria-pressed={isActive}
    variant={isActive ? "subtle" : "ghost"}
```

The Tag button still passes a boolean from `ComposerToolbar`, so AC28 is unchanged.

Test to add in Phase 2: `ComposerToolbarButton` renders without `aria-pressed` when `isActive` is not passed, and with `aria-pressed="true"` when it is `true`.

---

# Review round 2: Phase 2 unit tests

**Reviewed:** staged changes, 33 files · **Date:** 2026-11-23 · **Style:** `implementation-plans/message-composer/message-composer.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Plan mismatch | 0 | 2 | 3 |
| Style violation | 0 | 1 | 1 |
| Duplication | 0 | 1 | 2 |

The staged changes are the Phase 2 tests and fixtures. `tsc` passes. Prettier flags one file. No test asserts wrong behavior, but two round 1 follow-ups and the plan's test list are only partly covered. Point numbering continues from round 1.

## Points

### 3. No test for "Ctrl+Z after Send keeps the editor empty"

**Category:** Plan mismatch · **Severity:** Medium · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.test.tsx` (`describe("sending")`)

**Problem:** Round 1 point 1 fixed the undo bug in `MessageComposer.hooks.ts:211` (`setMeta("addToHistory", false)`) and named the Phase 2 test that guards it. That test was not written. Removing the meta again would not fail any test, and Ctrl+Z after Send would bring back the sent message.

**Proposed fix:** Add to `describe("sending")`:

```tsx
it("keeps the editor empty when undo is pressed after sending", async () => {
  const { user } = setup();

  await typeInComposer({ user, text: "Hello" });

  const sendButton = getSendButton();
  await user.click(sendButton);
  await user.keyboard("{Control>}z{/Control}");

  const editor = getComposerEditor();
  expect(editor.textContent).toBe("");
});
```

---

### 4. Unexplained 30 s timeout added to an unrelated test

**Category:** Plan mismatch · **Severity:** Medium · **Status:** Rejected
**Reason:** The test was flaky, and the 30 s timeout was added on purpose to stop the failure.
**Location:** `src/pages/ThreadPage/components/DeletePageModalContainer/__tests__/DeletePageModalContainer.test.tsx:186`

**Problem:** `waitForElementToBeRemoved(modalTitle, { timeout: 30_000 })` is not in the plan and has no comment. A 30 s limit (the default is 1 s) hides whatever makes the modal slow to close. A real regression there would surface as a 30 s hang instead of a fast failure.

**Proposed fix:** Revert to `await waitForElementToBeRemoved(modalTitle);`. If the test then fails, find the cause (likely the new `ThreadPageLoader` tree or polyfills) and fix that. If a longer wait is really needed, use a named constant with a comment saying why, and the smallest value that passes.

---

### 5. Queries passed straight into `expect()` and user events in the new tests

**Category:** Style violation · **Severity:** Medium · **Status:** Fixed
**Location:** `MessageComposer.test.tsx:103`, `:146`, `:151`, `:166`, `:195`, `:199`, `:210`, `:214`, `:252`, `:270`, `:288`, `:296`, `:297`, `:304`, `:353` (the same pattern repeats further down the file); `ThreadColumns.test.tsx:136`, `:140`, `:157`, `:163`; `PagesColumn.test.tsx` (last `expect(getPageSelectButton(...))`)

**Problem:** `unit-tests.md` rules 13 and 18 say to store an element in a constant before asserting on it or passing it to `user.click()`. The new tests use `expect(getEditorElement("ul")).not.toBeInTheDocument()`, `user.click(getToolbarButton(...))`, and `expect(screen.getByTestId(...)).toBeInTheDocument()`. The existing lib tests that do this are older and are not part of this point.

**Proposed fix:** Store each result first, then assert or click:

```tsx
const bulletList = getEditorElement("ul");
expect(bulletList).not.toBeInTheDocument();

const linkButton = getToolbarButton(insertLinkCommand.label);
await user.click(linkButton);
```

---

### 6. Test helpers and constants copied between test files

**Category:** Duplication · **Severity:** Medium · **Status:** Fixed
**Location:** `MessageComposer.test.tsx:51-53`, `:70-72` and `MessageComposer.utils.test.ts:11-12`, `:14-21` (PNG bytes, data URL prefix, PNG file builder); the `FileReader` error spy in `MessageComposer.test.tsx` and `MessageComposer.utils.test.ts`; `getButton` in `ComposerToolbar.test.tsx` and `ComposerToolbarButton.test.tsx` (the shared `getToolbarButton` does the same); `getSendButton` in `MessageComposer.test.tsx` and `ComposerFooter.test.tsx`

**Problem:** `unit-tests.md` rules 5 and 6 say a helper or mock used in more than one file lives in one shared place. These copies will drift. For example, a change to the FileReader failure simulation would have to be made twice.

**Proposed fix:** Move the PNG constants, `createPngFile`, `createTextFile` and a `mockFileReaderError()` helper into `src/__test-fixtures__/composer/` (for example `composer.files.ts`), and export them from its `index.ts`. Replace the local `getButton` with `getToolbarButton`. Note that `getSendButton` in `ComposerFooter.test.tsx` uses a test ID while the other uses a role, so keep one `getSendButton` fixture based on the role query and use it in both.

---

### 7. "Shows a very long tag in full" cannot fail

**Category:** Plan mismatch · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/__tests__/TagChip.test.tsx` ("shows a very long tag name in full")

**Problem:** AC29 says tags are not truncated. The test only checks `textContent`, which stays complete even if CSS ellipsis or clamping is added to the chip. A regression would pass.

**Proposed fix:** Also assert the styles that keep it whole: the container has `whiteSpace: "nowrap"` and `flexShrink: "0"`, and the name element does not have `textOverflow: "ellipsis"`.

---

### 8. `IconButton` test names `height` but never asserts it

**Category:** Plan mismatch · **Severity:** Low · **Status:** Fixed
**Location:** `src/components/lib/IconButton/__tests__/IconButton.test.tsx:83-95`

**Problem:** The test is titled "applies height, minWidth, and px as styles" and passes `height: "4"`, but `toHaveStyle` only checks `minWidth` and `paddingInline`. Dropping the `height` prop from the adapter would not fail it.

**Proposed fix:** Add `height: "4"` to the `toHaveStyle` call, using whatever value Chakra resolves for the `4` token if it differs from the raw string.

---

### 9. Coverage config change that is not in the plan

**Category:** Plan mismatch · **Severity:** Low · **Status:** Rejected
**Reason:** Intentional: it excludes types from the coverage run and report.
**Location:** `vitest.config.ts:17`

**Problem:** `"**/types/**"` was added to the coverage exclusions. It is not in the plan and nothing in the composer needs it. It stops `src/types/` from showing up in coverage reports.

**Proposed fix:** Remove the line, or keep it and tell the developer it is intentional (reject this point).

---

### 10. `PagesColumn.test.tsx` fails the Prettier check

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx` (two blank lines after `getPageSelectButton`)

**Problem:** `prettier --check` reports this file. `npm run lint`/format steps in CI may flag it.

**Proposed fix:** Run `npx prettier --write` on the file (removes the extra blank line).

---

### 11. Test hardcodes the file read error message from the implementation

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `MessageComposer.utils.test.ts:13` (`FILE_READ_ERROR_MESSAGE = "File could not be read"`), `MessageComposer.utils.ts:40`

**Problem:** The expected message is a copy of a string literal in `readFileAsDataUrl`. If one changes, the other does not, and the test either breaks for no real reason or keeps passing against the wrong text. The utils file also has a second, different message at line 36.

**Proposed fix:** Export the messages as constants from `MessageComposer.constants.ts`, use them in `readFileAsDataUrl`, and import the constant in the test.

---

### 12. Repeated `changeTagInput` + `addTag` blocks in the hooks test

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.hooks.test.ts` (the `useComposerTags` tests)

**Problem:** About eight tests repeat the same two `act()` blocks to add a tag. The `"unset"` sentinel in the invalid-URL test also exists only to satisfy the type. `unit-tests.md` rule 4 asks for small helpers for repeated logic.

**Proposed fix:** Add a helper in the test file, for example:

```ts
const addTagWithInput = ({ result, tag }: AddTagParams) => {
  act(() => {
    result.current.changeTagInput(tag);
  });

  act(() => {
    result.current.addTag();
  });
};
```

and use it in each test.

---
