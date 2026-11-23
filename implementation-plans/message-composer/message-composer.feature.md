# Chat page: message composer

**Source:** `implementation-plans/message-composer/message-composer.draft.md`

## Acceptance criteria

Page view

- AC1: Selecting a page card highlights it and opens a page view for that page next to the Sections and Pages columns.
- AC2: A Chat page view shows the page name above the message composer, at the top of the view.
- AC3: Selecting another page switches the page view to it.
- AC4: With no page selected, no page view is shown and a hint asks to select a page.
- AC5: Deleting the selected page closes the page view and shows the hint again.
- AC6: After a browser reload, no page is selected (assumption accepted: there is no route yet).
- AC7: Returning to a page after switching away or closing it shows an empty composer (assumption accepted: drafts are not kept).

Text formatting

- AC8: The empty composer shows a placeholder that invites writing a message and mentions Ctrl+Enter to send.
- AC9: Bold, Italic, Underline, and Strikethrough toolbar buttons toggle that formatting on the selected text.
- AC10: Ctrl/Cmd+B, Ctrl/Cmd+I, and Ctrl/Cmd+U apply bold, italic, and underline the same way as the toolbar buttons (assumption accepted).
- AC11: The Bullet list and Numbered list buttons turn the current line into a list item and back.
- AC12: The Code block button inserts a code block with placeholder text and an empty line below it.
- AC13: After a toolbar action, the editor keeps its focus and selection.
- AC14: The editor scrolls vertically once it reaches its maximum height.
- AC15: The toolbar buttons wrap onto the next line when the composer is narrow.

Links

- AC16: The Insert link button opens a small inline URL field in the composer.
- AC17: Confirming a valid http/https URL inserts a link; the selected text becomes the link text, or the URL when nothing is selected.
- AC18: An inserted link opens in a new browser tab.

Images

- AC19: The Insert image button opens a file picker limited to images.
- AC20: A picked image is inserted at the cursor, scaled to the editor width, with an empty line below it.
- AC21: No file size limit applies.

Tags

- AC22: The Tag button shows a tag row with a text field; using it again hides the field.
- AC23: Enter or comma in the tag field adds a tag chip and clears the field.
- AC24: Stored tags are lowercased, trimmed, and have spaces replaced with hyphens.
- AC25: Leaving the tag field with text typed adds the text as a tag.
- AC26: Escape closes the tag field and discards its text; added tags stay.
- AC27: A tag chip's remove button removes the tag.
- AC28: The Tag button is shown as active while the tag row is open or at least one tag exists.
- AC29: Tags that do not fit scroll the row horizontally; no truncation and no limits.

Sending

- AC30: The Send button is disabled while the editor has no text, image, or code; tags alone do not enable it.
- AC31: Send or Ctrl/Cmd+Enter writes the content and tags to the console, empties the editor, clears the tags, closes the tag field, and focuses the editor.
- AC32: Ctrl+Enter with no content does nothing.
- AC33: A sent message is not shown or stored anywhere.

Error handling and user feedback

- AC34: Confirming an empty or invalid URL shows "Enter a valid http or https URL" inline, inserts nothing, and keeps the field open.
- AC35: Picking a non-image file shows an error notification saying only images are supported, and nothing is inserted.
- AC36: An image that cannot be read shows an error notification saying the image could not be loaded, and nothing is inserted.
- AC37: An empty or duplicate tag is ignored without a message.
- AC38: A formatting button with no selection affects the text typed next, with no error.

## Style notes

- The editor is built on Tiptap 3 (`@tiptap/react`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extensions`), all pinned to exactly `3.32.2`. `document.execCommand()` is never used. Source: developer decision (story discovery note and step 6 answer).
- Every composer action is a command object with `execute(context)`. The toolbar buttons, the Send button, and the keyboard shortcuts (Ctrl/Cmd+B/I/U, Ctrl/Cmd+Enter) are invokers. The `ComposerCommandContext` (Tiptap editor plus composer UI actions) is the receiver. Actions that carry data (insert link, insert image) are built by command factories (`createInsertLinkCommand(url)`). Typing in the tag field (adding and removing chips) is tag-field input, not a composer action, so it stays in `useComposerTags`. Tiptap's own extra shortcuts that the story does not mention (undo/redo, Shift+Enter) stay as Tiptap provides them. Source: developer note in the story; boundary chosen by the architect.
- New composer files follow the project's file-based layout (`MessageComposer.hooks.ts`, `.utils.ts`, `.types.ts`, `.constants.ts`), even with several hooks. Two more concern files follow the `<Name>.<concern>.ts` convention: `MessageComposer.commands.ts` and `MessageComposer.extensions.ts`. Source: project convention (`ThreadPageLoader.hooks.ts`, `ThreadPageLoader.context.ts`, `Notifications.toaster.ts`), which wins over `react.md` rule 6.
- Content styles that Chakra style props cannot reach (the placeholder pseudo-element, lists, code blocks, images, and links inside the Tiptap document) go in `MessageComposer.module.css`. Layout styles (max height, scrolling, wrapping) stay as Chakra props on lib adapters, so tests can check them with `toHaveStyle`. Source: project convention (`ColorPicker.module.css`).
- Chakra is used only through `@/components/lib` adapters. When an adapter lacks a prop, extend the adapter. Never import `@chakra-ui/react` in feature code. The one exception is the hidden native `<input type="file">`, which has no visual part. Source: project convention (`CLAUDE.md` → Third-party Libraries).
- Page selection mirrors section selection: `usePageSelection` derives `selectedPage` from `pages`, so deleting the page (or its section) clears the selection without extra code. Switching to another section clears the selected page, so the page view closes and the hint shows. Selecting the section that is already selected keeps the page. Returning to the earlier section does not restore the page. Source: developer decision (plan review). `PageCard` mirrors `SectionCard` (select button, `aria-current`, page color background in `ContrastColorScope`). No shared card component is extracted. Source: project convention (`useSectionSelection`, `SectionCard.tsx`) and the earlier developer decision on mirroring card parts (`delete-thread-section-page.feature.md`).
- Context values are inline objects split into value and action contexts, with no `useMemo`. Source: developer decision from `create-thread-section.feature.md`.
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied. New code follows `typescript.md` rules 8, 9, and 11. Source: developer decision from `create-thread-section.feature.md`.
- Component props types stay in the component file and are not exported, unless another file needs them. Source: `react.md` rule 4 and project convention (`PageCard.tsx`).
- Test IDs are created with `initTestIdCreator("<Component>__")` in `<Component>.constants.ts` and imported by file path. Each component's `index.ts` exports only the component. Source: project convention (`SectionCard.constants.ts`).
- Formatting is 2 spaces, double quotes, 80 columns. Source: project convention (`.prettierrc.json`).

Path shorthand used in prose only (file lists always give full paths):

- `ThreadColumns/components` = `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components`
- `MessageComposer/` = `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer`

## Phase 1: Implementation

After Step 6, `npm run ts:check` reports errors in test files that render `PageCard`, `PageList`, or `PagesColumnContent` without the new selection props. Phase 2 fixes them. `npm run build` type-checks tests too, so it passes only after Phase 2.

---

### Step 1: Install the Tiptap packages

**File:**
`package.json`

**Covers:** AC9, AC10, AC11, AC12, AC17, AC20 (prerequisite)

**Context:** Tiptap gives reliable toggling, lists, undo, and selection handling without `document.execCommand()`. Version `3.32.2` is the newest release older than two weeks (published 2026-10-30), and every `@tiptap/*` package must use the same version because they peer-depend on each other exactly. `@tiptap/core` is a peer of `@tiptap/react`. It is listed explicitly so it is pinned, and commands import `Editor` and `Extension` from it.

**Changes:**

1. Run:
   ```bash
   npm install --save-exact @tiptap/core@3.32.2 @tiptap/pm@3.32.2 @tiptap/react@3.32.2 @tiptap/starter-kit@3.32.2 @tiptap/extension-image@3.32.2 @tiptap/extensions@3.32.2
   ```
2. Check that `package.json` lists the six packages under `dependencies` with exact versions (no `^` or `~`), and that `package-lock.json` is updated.
3. Run `npm audit`. If it reports a new finding from these packages, stop and tell the developer before continuing.

**Verification MANUAL:** `package.json` shows the six `@tiptap/*` packages at exactly `3.32.2`, and `npm run ts:check` still passes.

---

### Step 2: Extend the `Box` adapter with layout props

**File:**
`src/components/lib/Box/Box.tsx`

**Covers:** AC14, AC15, AC29 (prerequisite)

**Context:** The composer needs wrapping (toolbar), horizontal scrolling (tag row), and a capped, scrolling editor area. These are Chakra style props that the adapter does not forward yet.

**Changes:**

1. Add these optional props to `BoxProps`, next to the related existing ones:
   ```ts
   flexWrap?: string;
   overflowX?: string;
   whiteSpace?: string;
   maxHeight?: string;
   borderTopWidth?: string;
   marginLeft?: string;
   ```
2. No other change is needed: the component already spreads `...props` onto `ChakraBox`.

**Verification MANUAL:** `npm run ts:check` passes, and `<Box flexWrap="wrap" maxHeight="16rem" />` type-checks.

---

### Step 3: Add `aria-pressed` and `disabled` to the `IconButton` adapter

**File:**
`src/components/lib/IconButton/IconButton.tsx`

**Covers:** AC28 (prerequisite)

**Context:** The Tag button must show an active state that assistive technology can read. `aria-pressed` provides that and gives tests a stable attribute to check.

**Changes:**

1. Add to `IconButtonProps`:
   ```ts
   "aria-pressed"?: boolean;
   disabled?: boolean;
   ```
2. Nothing else changes: `...props` already forwards them.
3. Added during implementation, for the tag chip's remove button (Step 18): `height?: string;`, `minWidth?: string;`, and `px?: string;`. Forwarded the same way.

**Verification MANUAL:** `npm run ts:check` passes, and `<IconButton aria-pressed={true} ...>` type-checks.

---

### Step 4: Extend the `Input` adapter for inline fields

**Files:**
`src/components/lib/Input/Input.tsx`
`src/components/lib/Input/Input.constants.ts`

**Covers:** AC16, AC23, AC25, AC26, AC34 (prerequisite)

**Context:** The link field and the tag field are label-less inline inputs that react to Enter, comma, Escape, and blur, and the link field shows an inline error. Chakra's `Field.ErrorText` renders only when `Field.Root` is `invalid`, so `invalid` is derived from `errorText`.

**Changes:**

1. In `Input.constants.ts`, add:
   ```ts
   export const INPUT_ERROR_TEXT_TEST_ID = "error-text";
   ```
2. In `InputProps`, add:
   ```ts
   onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
   onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
   autoFocus?: boolean;
   "aria-label"?: string;
   errorText?: string;
   ```
   Import `KeyboardEvent` and `FocusEvent` as types from `"react"`.
3. Destructure `errorText = ""` next to `label`, and pass `invalid={Boolean(errorText)}` to `Field.Root`.
4. After `ChakraInput`, render the error text with a ternary, using the same test ID prefix pattern as the label:
   ```tsx
   {errorText ? (
     <Field.ErrorText
       data-testid={
         testId ? `${testId}__${INPUT_ERROR_TEXT_TEST_ID}` : INPUT_ERROR_TEXT_TEST_ID
       }
     >
       {errorText}
     </Field.ErrorText>
   ) : null}
   ```
5. The new handlers and `aria-label` reach `ChakraInput` through `...restProps`. Leave the existing behavior unchanged.

**Verification MANUAL:** `npm run ts:check` passes, and the Add page form still looks and behaves the same in the browser.

---

### Step 5: Add page selection to `ThreadPageLoader`

**Files:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`

**Covers:** AC1, AC3, AC4, AC5, AC6, plus the section-switch rule (developer decision, see Style notes)

**Context:** Mirrors `useSectionSelection`. `selectedPage` is derived from `pages`, so when `removePage` or `removeSection` drops the page, the selection clears by itself (AC5). The state lives only in memory, so a reload starts with no selection (AC6). Switching sections clears the page explicitly, rather than through a `selectedPage` filtered by section, so that going back to the earlier section does not bring the page back. `useSectionSwitch` wraps `selectSection`, so `useSectionSelection` and `usePageSelection` stay independent of each other.

**Changes:**

1. In `ThreadPageLoader.types.ts`:
   - Add `selectedPage: SectionPage | null;` to `ThreadPageValue`.
   - Add `selectPage: (pageId: string) => void;` to `ThreadPageAction`.
   - Add:
     ```ts
     export type UsePageSelectionParams = {
       pages: SectionPage[];
     };

     export type UseSectionSwitchParams = {
       selectedSection: ThreadSection | null;
       selectSection: (sectionId: string) => void;
       clearSelectedPage: () => void;
     };
     ```
2. In `ThreadPageLoader.hooks.ts`, add after `useSectionSelection`:
   ```ts
   export const usePageSelection = ({ pages }: UsePageSelectionParams) => {
     const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

     const selectedPage =
       pages.find((page) => {
         return page.id === selectedPageId;
       }) ?? null;

     const selectPage = (pageId: string) => {
       setSelectedPageId(pageId);
     };

     const clearSelectedPage = () => {
       setSelectedPageId(null);
     };

     return { selectedPage, selectPage, clearSelectedPage };
   };
   ```
3. In `ThreadPageLoader.hooks.ts`, add after `usePageSelection`:
   ```ts
   export const useSectionSwitch = ({
     selectedSection,
     selectSection,
     clearSelectedPage,
   }: UseSectionSwitchParams) => {
     const switchSection = (sectionId: string) => {
       if (sectionId === selectedSection?.id) {
         return;
       }

       selectSection(sectionId);
       clearSelectedPage();
     };

     return switchSection;
   };
   ```
4. In `ThreadPageLoader.tsx`:
   - After `useSectionSelection`, call `const { selectedPage, selectPage, clearSelectedPage } = usePageSelection({ pages });`.
   - Then call `const switchSection = useSectionSwitch({ selectedSection, selectSection, clearSelectedPage });`.
   - In the action context value, replace `selectSection,` with `selectSection: switchSection,` and add `selectPage`. Add `selectedPage` to the value context value. `ThreadPageAction.selectSection` keeps its type, so `SectionsColumn` does not change.

**Verification MANUAL:** `npm run ts:check` reports no errors in production files.

---

### Step 6: Make `PageCard` selectable

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.constants.ts`

**Covers:** AC1

**Context:** Follow `SectionsColumn/components/SectionCard/SectionCard.tsx` exactly: a full-width select button holds the icon and name, the actions menu stays outside it, and the selected card takes the page color as its background inside `ContrastColorScope`.

**Changes:**

1. In `PageCard.constants.ts`, add `selectButton: createTestId("select-button"),` to `PageCardTestId`.
2. In `PageCard.tsx`:
   - Add `isSelected: boolean;` and `onSelect: (pageId: string) => void;` to `PageCardProps`.
   - Add `const handleSelect = () => { onSelect(page.id); };` (block body).
   - Restructure the JSX like `SectionCard`:
     - On the outer `Box`, keep `ref`, the test ID, `display`, `alignItems`, `justifyContent`, `gap`, `pr="1"`, `minWidth`, and the border props. Drop `py` and `pl`. Set `backgroundColor={isSelected ? page.color : "bg"}`.
     - Wrap the content in `<ContrastColorScope backgroundColor={isSelected ? page.color : undefined}>`.
     - Turn the existing inner icon and name `Box` into the select button: `data-testid={PageCardTestId.selectButton}`, `as="button"`, `type="button"`, `aria-current={isSelected}`, `display="flex"`, `alignItems="center"`, `gap="2"`, `flexGrow={1}`, `minWidth="0"`, `py="2"`, `pl="3"`, `textAlign="left"`, `cursor="pointer"`, and `onClick={handleSelect}`.
     - Keep `<PageCardActions />` after the button, inside the scope.

**Verification MANUAL:** `npm run ts:check` reports errors only where `PageCard` is rendered without the new props (fixed in Step 7 and Phase 2).

---

### Step 7: Pass page selection through the Pages column

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/PageList.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PagesColumnContent/PagesColumnContent.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn.tsx`

**Covers:** AC1, AC3

**Context:** Same prop flow as `SectionsColumn` → `SectionList` → `SectionCard`, with `selectedSectionId` and `onSelectSection`.

**Changes:**

1. `PageList.tsx`: add `selectedPageId: string | null;` and `onSelectPage: (pageId: string) => void;` to the props. Pass `isSelected={page.id === selectedPageId}` and `onSelect={onSelectPage}` to each `PageCard`.
2. `PagesColumnContent.tsx`: add the same two props and pass them to `PageList`.
3. `PagesColumn.tsx`: read `selectedPage` from `useThreadPageValue()` and `selectPage` from `useThreadPageAction()`. Pass `selectedPageId={selectedPage ? selectedPage.id : null}` and `onSelectPage={selectPage}` to `PagesColumnContent`.

**Verification MANUAL:** In the browser, clicking a page card highlights it with its color, clicking another moves the highlight, and the actions menu still opens without selecting.

---

### Step 8: Add the composer types and constants

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.types.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.constants.ts`

**Covers:** AC8, AC12, AC14, AC30, AC34, AC35, AC36 (contracts)

**Context:** These are the contracts of the Command pattern: the receiver (`ComposerCommandContext`), the action (`ComposerAction`), and the invokable, describable command (`ComposerCommand`).

**Changes:**

1. `MessageComposer.types.ts`:
   ```ts
   import type { Editor } from "@tiptap/core";
   import type { IconType } from "react-icons";

   export type ComposerCommandContext = {
     editor: Editor;
     openLinkField: () => void;
     openImagePicker: () => void;
     toggleTagField: () => void;
     send: () => void;
   };

   export type ComposerAction = {
     execute: (context: ComposerCommandContext) => void;
   };

   export type ComposerShortcut = {
     key: string; // Tiptap key name, e.g. "Mod-b"
     label: string; // shown in tooltips, e.g. "Ctrl+B"
   };

   export type ComposerCommand = ComposerAction & {
     id: string;
     label: string;
     shortcut?: ComposerShortcut;
   };

   export type ComposerToolbarCommand = ComposerCommand & {
     icon: IconType;
   };

   export type ComposerMessage = {
     content: string;
     tags: string[];
   };

   export type ComposerImage = {
     src: string;
     alt: string;
   };

   export type CreateComposerExtensionsParams = {
     getCommandContext: () => ComposerCommandContext | null;
   };
   ```
2. `MessageComposer.constants.ts`:
   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("MessageComposer__");

   export const MessageComposerTestId = {
     container: createTestId("container"),
     editorArea: createTestId("editor-area"),
     editor: createTestId("editor"),
     imageInput: createTestId("image-input"),
   } as const;

   export const COMPOSER_PLACEHOLDER = "Write a message… (Ctrl+Enter to send)";
   export const COMPOSER_EDITOR_LABEL = "Message";
   export const COMPOSER_EDITOR_MAX_HEIGHT = "16rem";
   export const CODE_BLOCK_PLACEHOLDER = "// Enter code here";
   export const IMAGE_FILE_ACCEPT = "image/*";
   export const IMAGE_MIME_PREFIX = "image/";
   export const ALLOWED_LINK_PROTOCOLS = ["http:", "https:"];
   export const CONTENT_NODE_TYPES = ["image", "codeBlock"];
   export const COMPOSER_SHORTCUTS_PRIORITY = 1000;

   export const INVALID_LINK_URL_MESSAGE = "Enter a valid http or https URL";
   export const UNSUPPORTED_IMAGE_MESSAGE = "Only image files are supported.";
   export const IMAGE_LOAD_ERROR_MESSAGE =
     "Couldn't load the image. Please try again.";
   ```
   Add a one-line comment above `COMPOSER_SHORTCUTS_PRIORITY`: it must be higher than Tiptap's default (100), so the composer shortcuts run before StarterKit's own `Mod-b` and `Mod-Enter` (hard break) bindings.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 9: Add the composer utils

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.utils.ts`

**Covers:** AC10, AC24, AC30, AC32, AC34, AC35, AC36, AC37

**Changes:**

1. Add these pure helpers, each an exported arrow function with a block body:
   - `normalizeTag(value: string)` returns `value.trim().toLowerCase().replace(/\s+/g, "-")`.
   - `isValidHttpUrl(value: string)` returns `false` when `!URL.canParse(value)`. Otherwise it returns `ALLOWED_LINK_PROTOCOLS.includes(new URL(value).protocol)`.
   - `isImageFile(file: File)` returns `file.type.startsWith(IMAGE_MIME_PREFIX)`.
   - `readFileAsDataUrl(file: File)` returns `Promise<string>`. Create a `FileReader`. On `load`, resolve when `typeof reader.result === "string"`, otherwise reject. Reject on `error` and `abort` too. Then call `reader.readAsDataURL(file)`.
   - `hasComposerContent(editor: Editor)` returns `true` when `editor.state.doc.textContent.trim()` is non-empty. Otherwise it walks `doc.descendants` and returns whether any node's `type.name` is in `CONTENT_NODE_TYPES`. Return `false` from the callback once a match is found, so the walk stops early.
     ```ts
     export const hasComposerContent = (editor: Editor) => {
       const { doc } = editor.state;

       if (doc.textContent.trim()) {
         return true;
       }

       let hasContentNode = false;

       doc.descendants((node) => {
         if (CONTENT_NODE_TYPES.includes(node.type.name)) {
           hasContentNode = true;
         }

         return !hasContentNode;
       });

       return hasContentNode;
     };
     ```
   - `getCommandTooltip(command: ComposerCommand)` returns `` `${command.label} (${command.shortcut.label})` `` when `command.shortcut` is set, otherwise `command.label`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 10: Add the composer commands

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.commands.ts`

**Covers:** AC9, AC10, AC11, AC12, AC13, AC16, AC17, AC19, AC20, AC22, AC31, AC38

**Context:** Each command is a plain object whose `execute` works on the receiver. Every editor command starts with `chain().focus()`, so focus and the stored selection come back to the editor after a toolbar click (AC13). With an empty selection, toggles set the stored mark for the next typed text (AC38).

**Changes:**

1. Formatting commands (`ComposerToolbarCommand`, icons from `react-icons/lu`):
   ```ts
   export const boldCommand: ComposerToolbarCommand = {
     id: "bold",
     label: "Bold",
     icon: LuBold,
     shortcut: { key: "Mod-b", label: "Ctrl+B" },
     execute: ({ editor }) => {
       editor.chain().focus().toggleBold().run();
     },
   };
   ```
   Do the same for `italicCommand` (`LuItalic`, `Mod-i`, `Ctrl+I`, `toggleItalic`), `underlineCommand` (`LuUnderline`, `Mod-u`, `Ctrl+U`, `toggleUnderline`), and `strikethroughCommand` (`LuStrikethrough`, label `Strikethrough`, no shortcut, `toggleStrike`).
2. Structure and insert commands:
   - `bulletListCommand` (`LuList`, `Bullet list`, `toggleBulletList`) and `numberedListCommand` (`LuListOrdered`, `Numbered list`, `toggleOrderedList`).
   - `insertLinkCommand` (`LuLink`, `Insert link`): `execute: ({ openLinkField }) => { openLinkField(); }`.
   - `codeBlockCommand` (`LuSquareCode`, `Code block`):
     ```ts
     editor
       .chain()
       .focus()
       .insertContent([
         {
           type: "codeBlock",
           content: [{ type: "text", text: CODE_BLOCK_PLACEHOLDER }],
         },
         { type: "paragraph" },
       ])
       .run();
     ```
   - `insertImageCommand` (`LuImage`, `Insert image`): calls `openImagePicker()`.
3. `tagCommand` (`LuTag`, label `Tag`): calls `toggleTagField()`.
4. `sendCommand: ComposerCommand` (id `send`, label `Send`, shortcut `{ key: "Mod-Enter", label: "Ctrl+Enter" }`): calls `send()`.
5. Command factories for actions that carry data:
   ```ts
   export const createInsertLinkCommand = (url: string): ComposerAction => {
     return {
       execute: ({ editor }) => {
         if (editor.state.selection.empty) {
           editor
             .chain()
             .focus()
             .insertContent({
               type: "text",
               text: url,
               marks: [{ type: "link", attrs: { href: url } }],
             })
             .run();

           return;
         }

         editor.chain().focus().setLink({ href: url }).run();
       },
     };
   };
   ```
   `createInsertImageCommand = (image: ComposerImage): ComposerAction` inserts `[{ type: "image", attrs: image }, { type: "paragraph" }]` with `chain().focus().insertContent(...).run()`.
6. Groups used by the invokers:
   ```ts
   export const FORMATTING_COMMANDS = [
     boldCommand,
     italicCommand,
     underlineCommand,
     strikethroughCommand,
   ];

   export const STRUCTURE_COMMANDS = [
     bulletListCommand,
     numberedListCommand,
     insertLinkCommand,
     codeBlockCommand,
     insertImageCommand,
   ];

   export const SHORTCUT_COMMANDS: ComposerCommand[] = [
     boldCommand,
     italicCommand,
     underlineCommand,
     sendCommand,
   ];
   ```

**Verification MANUAL:** `npm run ts:check` passes after Step 11. Tiptap adds `toggleUnderline`, `setLink`, and the other chain methods to the `Editor` type only once `@tiptap/starter-kit` is imported in the project, so type errors on those methods before Step 11 are expected.

---

### Step 11: Add the Tiptap extensions and the content stylesheet

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.extensions.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.module.css`

**Covers:** AC8, AC10, AC14, AC17, AC18, AC20, AC31, AC32

**Context:** StarterKit 3 already includes Bold, Italic, Underline, Strike, the lists, CodeBlock, Link, and UndoRedo. Features outside the story are switched off, so Markdown input rules cannot create headings or quotes that the composer does not support. The shortcut extension maps keys to the same command objects the toolbar uses (AC10). It reads the receiver through `getCommandContext`, because the extension is created once, while the context (tags, send) changes on every render.

**Changes:**

1. `MessageComposer.extensions.ts`:
   ```ts
   const createComposerShortcuts = ({
     getCommandContext,
   }: CreateComposerExtensionsParams) => {
     const runCommand = (command: ComposerCommand) => {
       const context = getCommandContext();

       if (!context) {
         return false;
       }

       command.execute(context);

       return true;
     };

     return Extension.create({
       name: "composerShortcuts",
       priority: COMPOSER_SHORTCUTS_PRIORITY,
       addKeyboardShortcuts() {
         return Object.fromEntries(
           SHORTCUT_COMMANDS.filter((command) => {
             return Boolean(command.shortcut);
           }).map((command) => {
             return [command.shortcut?.key, () => runCommand(command)];
           })
         );
       },
     });
   };
   ```
   Keep `addKeyboardShortcuts` as a method: Tiptap binds `this` inside it. Rewrite the inner arrow `() => runCommand(command)` with a block body (`typescript.md` rule 9). If TypeScript rejects `command.shortcut?.key` as a possibly undefined key, build the entries with a `for...of` over the commands that have a shortcut.

   Then export the full extension list:
   ```ts
   export const createComposerExtensions = ({
     getCommandContext,
   }: CreateComposerExtensionsParams) => {
     return [
       StarterKit.configure({
         heading: false,
         blockquote: false,
         horizontalRule: false,
         code: false,
         link: {
           openOnClick: false,
           autolink: false,
           HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
         },
       }),
       Image.configure({ allowBase64: true }),
       Placeholder.configure({ placeholder: COMPOSER_PLACEHOLDER }),
       createComposerShortcuts({ getCommandContext }),
     ];
   };
   ```
   Imports: `Extension` from `@tiptap/core`, `StarterKit` from `@tiptap/starter-kit`, `Image` from `@tiptap/extension-image`, `Placeholder` from `@tiptap/extensions`.
2. `MessageComposer.module.css`: one root class `.editor` for the ProseMirror element, using Chakra CSS variables for colors:
   - `.editor { outline: none; padding: 0.75rem; min-height: 4rem; }`
   - Placeholder: `.editor :global(p.is-editor-empty:first-child)::before { content: attr(data-placeholder); color: var(--chakra-colors-fg-muted); float: left; height: 0; pointer-events: none; }`
   - Lists (Chakra's reset removes markers): `.editor ul { list-style: disc; padding-left: 1.5rem; }` and `.editor ol { list-style: decimal; padding-left: 1.5rem; }`.
   - Code: `.editor pre { font-family: var(--chakra-fonts-mono); background: var(--chakra-colors-bg-muted); border-radius: 0.375rem; padding: 0.5rem 0.75rem; white-space: pre-wrap; }`.
   - Images (AC20): `.editor img { display: block; max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.25rem 0; }`.
   - Links: `.editor a { color: var(--chakra-colors-accent); text-decoration: underline; }`.
   - Italic (added after a bug report): `.editor em { font-style: italic; }`. Chakra's preflight sets `font: inherit` on every element, which resets the browser's default italic on `<em>`. Bold is not affected, because preflight sets `font-weight` on `b, strong`.

**Verification MANUAL:** `npm run ts:check` passes (including the chain types used in Step 10).

---

### Step 12: Add the editor, content, and send hooks

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.hooks.ts`

**Covers:** AC8, AC30, AC31, AC32

**Context:** `useEditor` in Tiptap 3 does not re-render on every transaction, so `useEditorState` subscribes only to "has content" for the Send button.

**Changes:**

1. Add `useComposerEditor`:
   ```ts
   export const useComposerEditor = ({
     getCommandContext,
   }: CreateComposerExtensionsParams) => {
     return useEditor({
       immediatelyRender: true,
       extensions: createComposerExtensions({ getCommandContext }),
       editorProps: {
         attributes: {
           class: styles.editor,
           role: "textbox",
           "aria-multiline": "true",
           "aria-label": COMPOSER_EDITOR_LABEL,
           "data-testid": MessageComposerTestId.editor,
         },
       },
     });
   };
   ```
   `styles` is the default import of `./MessageComposer.module.css` (CSS modules are the one allowed default import). If the installed types still return `Editor | null`, keep the return type as is. `MessageComposer` handles `null` in Step 20.
2. Add `useHasComposerContent`:
   ```ts
   export const useHasComposerContent = (editor: Editor) => {
     return useEditorState({
       editor,
       selector: ({ editor: currentEditor }) => {
         return hasComposerContent(currentEditor);
       },
     });
   };
   ```
3. Add `useComposerSend`, which takes `{ editor, tags, resetTags, onSend }` (add `UseComposerSendParams` to `MessageComposer.types.ts`):
   ```ts
   const send = () => {
     if (!hasComposerContent(editor)) {
       return;
     }

     onSend({ content: editor.getHTML(), tags });
     editor.chain().clearContent().focus().run();
     resetTags();
   };

   return send;
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 13: Add the tag state hook

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.hooks.ts`

**Covers:** AC22, AC23, AC24, AC25, AC26, AC27, AC28, AC31, AC37

**Context:** On Escape, the text is cleared with `flushSync` before the field unmounts. A browser may fire `blur` while removing the focused input, and the `blur` handler would otherwise still see the old text and add it as a tag, which breaks AC26.

**Changes:**

1. Add `useComposerTags()` with state `tags: string[]`, `tagInput: string`, and `isTagFieldOpen: boolean`, and these actions (block-bodied arrow functions):
   - `toggleTagField`: flips `isTagFieldOpen`.
   - `changeTagInput(value)`: sets `tagInput`.
   - `addTag`: `const tag = normalizeTag(tagInput);`. If `tag` is truthy and not in `tags`, append it. Always clear `tagInput` (AC23, AC25, AC37).
   - `removeTag(tagToRemove)`: filters it out.
   - `discardTagInput`: `flushSync(() => { setTagInput(""); });` and then `setIsTagFieldOpen(false);` (AC26).
   - `resetTags`: clears `tags` and `tagInput`, and closes the field (AC31).
2. Return the state, the actions, and `isTagRowShown: isTagFieldOpen || tags.length > 0`. The same flag drives the row (AC22) and the Tag button's active state (AC28).

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 14: Add the link field hook

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.hooks.ts`

**Covers:** AC16, AC17, AC34

**Changes:**

1. Add `useLinkField()` with state `isLinkFieldOpen`, `linkUrl`, and `linkError` (empty string when there is no error), and these actions:
   - `openLinkField`: resets `linkUrl` and `linkError`, then opens.
   - `closeLinkField`: closes.
   - `changeLinkUrl(value)`: sets `linkUrl` and clears `linkError`.
   - `validateLinkUrl`: returns the trimmed URL when `isValidHttpUrl(url)` is true. Otherwise it sets `linkError` to `INVALID_LINK_URL_MESSAGE` and returns `null`.
2. Return the state and the actions.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 15: Add the image insertion hook

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.hooks.ts`

**Covers:** AC19, AC20, AC21, AC35, AC36

**Context:** Errors use `notify.error` from `@/components/lib`, the same feedback channel as `useCreateModal`. No size check is done (AC21).

**Changes:**

1. Add `useImageInsertion({ insertImage })`, where `insertImage: (image: ComposerImage) => void` (add `UseImageInsertionParams` to the types file):
   ```ts
   const imageInputRef = useRef<HTMLInputElement>(null);

   const openImagePicker = () => {
     imageInputRef.current?.click();
   };

   const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
     const input = event.currentTarget;
     const file = input.files?.[0];

     input.value = "";

     if (!file) {
       return;
     }

     if (!isImageFile(file)) {
       notify.error(UNSUPPORTED_IMAGE_MESSAGE);

       return;
     }

     try {
       const src = await readFileAsDataUrl(file);

       insertImage({ src, alt: file.name });
     } catch {
       notify.error(IMAGE_LOAD_ERROR_MESSAGE);
     }
   };

   return { imageInputRef, openImagePicker, handleImageChange };
   ```
   Clearing `input.value` lets the same file be picked again.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 16: Create the toolbar button and toolbar components

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbarButton/ComposerToolbarButton.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbarButton/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbar/ComposerToolbar.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbar/ComposerToolbar.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbar/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/index.ts`

**Covers:** AC9, AC11, AC12, AC15, AC16, AC19, AC22, AC28

**Context:** The toolbar is the invoker. It knows commands only as data and hands the chosen one to `onCommand`. Follow `src/components/lib/AddIconButton/AddIconButton.tsx` for the tooltip-plus-icon-button shape.

**Changes:**

1. `ComposerToolbarButton.tsx`, with props `command: ComposerToolbarCommand`, `isActive?: boolean` (no default, so non-toggle buttons get no `aria-pressed` attribute; the Tag button always passes a boolean), and `onCommand: (command: ComposerCommand) => void`:
   ```tsx
   const { icon: CommandIcon } = command;

   const handleClick = () => {
     onCommand(command);
   };

   return (
     <Tooltip label={getCommandTooltip(command)}>
       <IconButton
         aria-label={command.label}
         aria-pressed={isActive}
         variant={isActive ? "subtle" : "ghost"}
         size="xs"
         onClick={handleClick}
       >
         <CommandIcon aria-hidden />
       </IconButton>
     </Tooltip>
   );
   ```
2. `ComposerToolbar.constants.ts`: `ComposerToolbarTestId` with `container` and `divider`.
3. `ComposerToolbar.tsx`, with props `isTagActive: boolean` and `onCommand`. Render a `Box` with `data-testid={ComposerToolbarTestId.container}`, `display="flex"`, `flexWrap="wrap"` (AC15), `alignItems="center"`, `gap="1"`, `px="2"`, `py="1"`, and `borderBottomWidth="1px"`. Inside:
   - `FORMATTING_COMMANDS.map(...)` as `ComposerToolbarButton`s (`key={command.id}`);
   - a divider `Box` (`data-testid` divider, `width="1px"`, `height="4"`, `backgroundColor="border"`);
   - `STRUCTURE_COMMANDS.map(...)`;
   - a `Box` with `marginLeft="auto"` wrapping `<ComposerToolbarButton command={tagCommand} isActive={isTagActive} onCommand={onCommand} />`.
4. Barrels: each component's `index.ts` exports only its component. `components/index.ts` re-exports the composer subcomponents (add entries as they are created in Steps 16 to 19).

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 17: Create the inline link field

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/LinkField/LinkField.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/LinkField/LinkField.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/LinkField/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/index.ts`

**Covers:** AC16, AC17, AC34

**Changes:**

1. `LinkField.constants.ts`: `LinkFieldTestId` with `container` and `input`, plus `LINK_URL_LABEL = "Link URL"`, `LINK_URL_PLACEHOLDER = "https://…"`, `CONFIRM_LINK_LABEL = "Add link"`, and `CANCEL_LINK_LABEL = "Cancel"`.
2. `LinkField.tsx`, with props `url`, `error`, `onChange: (value: string) => void`, `onConfirm: () => void`, and `onCancel: () => void`:
   - `handleKeyDown(event)`: on `Enter`, call `event.preventDefault()` and then `onConfirm()`. On `Escape`, call `event.preventDefault()` and then `onCancel()`.
   - Render a `Box` (`display="flex"`, `alignItems="center"`, `gap="2"`, `px="3"`, `py="2"`, `borderBottomWidth="1px"`) with `Input` (`size="sm"`, `autoFocus`, `aria-label={LINK_URL_LABEL}`, `placeholder`, `value={url}`, `errorText={error}`, `onChange`, `onKeyDown={handleKeyDown}`, `data-testid={LinkFieldTestId.input}`), then `Button` `size="xs"` `background="accent"` `onClick={onConfirm}` "Add link", then `Button` `size="xs"` `variant="ghost"` `onClick={onCancel}` "Cancel".
3. Export it from `components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 18: Create the tag row and tag chip

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/TagRow.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/TagRow.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/TagChip.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/TagChip.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/TagChip.utils.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/index.ts`

**Covers:** AC22, AC23, AC25, AC26, AC27, AC29

**Context:** The label helper sits in `.utils.ts`, the same way `getPageActionsLabel` does in `PageCardActions.utils.ts`.

**Changes:**

1. `TagChip.utils.ts`: `getRemoveTagLabel(tag)` returns `` `Remove tag ${tag}` ``.
2. `TagChip.constants.ts`: `TagChipTestId` with `container` and `name`.
3. `TagChip.tsx`, with props `tag` and `onRemove: (tag: string) => void`. Use `handleRemove` to call `onRemove(tag)`. Render a `Box` (test ID container, `display="flex"`, `alignItems="center"`, `gap="1"`, `flexShrink={0}`, `whiteSpace="nowrap"`, `pl="2"`, `pr="1"`, `borderRadius="full"`, `borderWidth="1px"`, `borderColor="border"`, `backgroundColor="bg.muted"`) holding `Text` (test ID name, `fontSize="xs"`) and an `IconButton` (`size="2xs"`, `variant="ghost"`, `height="4"`, `minWidth="4"`, `px="0"`, `aria-label={getRemoveTagLabel(tag)}`, `onClick={handleRemove}`) with `<LuX aria-hidden />`. Do not truncate the name (AC29).
4. `TagRow.constants.ts`: `TagRowTestId` with `container` and `input`, plus `TAG_INPUT_LABEL = "Tag name"` and `TAG_INPUT_PLACEHOLDER = "tag name, Enter to add…"`.
5. `TagRow.tsx`, with props `tags`, `tagInput`, `isTagFieldOpen`, `onTagInputChange`, `onAddTag`, `onDiscardTagInput`, and `onRemoveTag`:
   - `handleKeyDown(event)`: on `Enter` or `,`, call `event.preventDefault()` and then `onAddTag()`. On `Escape`, call `event.preventDefault()` and then `onDiscardTagInput()`.
   - `handleBlur()`: calls `onAddTag()` (AC25).
   - Render a `Box` (test ID container, `display="flex"`, `flexDirection="column"`, `alignItems="stretch"`, `gap="2"`, `px="3"`, `py="2"`, `borderBottomWidth="1px"`) with two parts, in this order (changed during implementation so the field is full width with the tags underneath):
     - When `isTagFieldOpen` is true (ternary), `Input` (`size="sm"`, `autoFocus`, `aria-label={TAG_INPUT_LABEL}`, `placeholder`, `value={tagInput}`, `onChange={onTagInputChange}`, `onKeyDown`, `onBlur`, test ID input) at full width.
     - When `tags.length` is non-zero (ternary), a chip row `Box` (`display="flex"`, `alignItems="center"`, `gap="1.5"`, `overflowX="auto"`) holding `tags.map(...)` as `TagChip`s (`key={tag}`).
6. Barrels: export `TagChip` from `TagRow/components/index.ts`, and `TagRow` from the composer's `components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 19: Create the composer footer

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerFooter/ComposerFooter.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerFooter/ComposerFooter.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerFooter/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/index.ts`

**Covers:** AC30, AC31

**Changes:**

1. `ComposerFooter.constants.ts`: `ComposerFooterTestId` with `sendButton` and `hint`, plus `SEND_HINT = "Ctrl + Enter to send"`.
2. `ComposerFooter.tsx`, with props `canSend: boolean` and `onSend: () => void`. Render a `Box` (`display="flex"`, `alignItems="center"`, `justifyContent="space-between"`, `px="3"`, `py="2"`, `borderTopWidth="1px"`) holding `Text` (test ID hint, `fontSize="xs"`, `color="fg.muted"`) with `SEND_HINT`, and `Button` (test ID sendButton, `size="xs"`, `disabled={!canSend}`, `background="accent"`, `onClick={onSend}`) with `<LuSend aria-hidden />` followed by `sendCommand.label`.
3. Export it from `components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 20: Assemble the `MessageComposer` component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/index.ts`

**Covers:** AC8 to AC38 (composer behavior)

**Context:** `MessageComposer` wires the hooks into a receiver (`commandContext`) and is the only place that executes commands. The receiver is copied into a ref after each render, so the keyboard shortcuts in the Tiptap extension always see the current tags and `send`. Writing the ref in an effect, rather than during render, keeps the React Compiler's ref rules satisfied.

**Changes:**

1. Props: `onSend: (message: ComposerMessage) => void`.
2. Body, in this order:
   ```tsx
   const commandContextRef = useRef<ComposerCommandContext | null>(null);

   const getCommandContext = () => {
     return commandContextRef.current;
   };

   const handleInsertImage = (image: ComposerImage) => {
     const context = getCommandContext();

     if (context) {
       createInsertImageCommand(image).execute(context);
     }
   };

   const editor = useComposerEditor({ getCommandContext });
   const tagsState = useComposerTags();
   const linkField = useLinkField();
   const hasContent = useHasComposerContent(editor);

   const { imageInputRef, openImagePicker, handleImageChange } =
     useImageInsertion({ insertImage: handleInsertImage });

   const send = useComposerSend({
     editor,
     tags: tagsState.tags,
     resetTags: tagsState.resetTags,
     onSend,
   });

   const commandContext: ComposerCommandContext = {
     editor,
     openLinkField: linkField.openLinkField,
     openImagePicker,
     toggleTagField: tagsState.toggleTagField,
     send,
   };

   const runCommand = (command: ComposerAction) => {
     command.execute(commandContext);
   };

   useEffect(() => {
     commandContextRef.current = commandContext;
   });
   ```
   `handleInsertImage` runs against `getCommandContext()` rather than `commandContext`, because the image hook needs it before `commandContext` exists. The image is read asynchronously, so by the time it runs the ref is always set.

   If `useComposerEditor` returns `Editor | null` with the installed types, split the component: `MessageComposer` calls `useComposerEditor` and renders `editor ? <ComposerContent editor={editor} ... /> : null`, and the rest of the body moves into a private `ComposerContent` component in `components/ComposerContent/`. Not needed: the installed types return `Editor`, so `MessageComposer` stays one component.
3. Handlers (block bodies):
   - `handleConfirmLink`: `const url = linkField.validateLinkUrl();`. If `url` is set, call `linkField.closeLinkField()` and then `runCommand(createInsertLinkCommand(url))`. An invalid URL keeps the field open with the error (AC34).
   - `handleCancelLink`: `linkField.closeLinkField(); editor.commands.focus();`.
   - `handleDiscardTagInput`: `tagsState.discardTagInput(); editor.commands.focus();`.
   - `handleSend`: `runCommand(sendCommand);`.
4. JSX: a `Box` (test ID container, `display="flex"`, `flexDirection="column"`, `borderWidth="1px"`, `borderColor="border"`, `borderRadius="lg"`, `backgroundColor="bg"`) containing, in order:
   - `<ComposerToolbar isTagActive={tagsState.isTagRowShown} onCommand={runCommand} />`;
   - `linkField.isLinkFieldOpen ? <LinkField ... /> : null`;
   - `tagsState.isTagRowShown ? <TagRow ... /> : null`, with `onAddTag={tagsState.addTag}`, `onDiscardTagInput={handleDiscardTagInput}`, and so on;
   - `<Box data-testid={MessageComposerTestId.editorArea} maxHeight={COMPOSER_EDITOR_MAX_HEIGHT} overflowY="auto"><EditorContent editor={editor} /></Box>` (AC14);
   - `<input ref={imageInputRef} type="file" accept={IMAGE_FILE_ACCEPT} hidden data-testid={MessageComposerTestId.imageInput} onChange={handleImageChange} />` (AC19);
   - `<ComposerFooter canSend={hasContent} onSend={handleSend} />`.
5. `index.ts`: `export * from "./MessageComposer";`.

**Verification MANUAL:** Temporarily render `<MessageComposer onSend={console.log} />` anywhere, or wait for Step 23. Formatting, lists, the code block, the link field, image insertion, tags, and Send all behave as the acceptance criteria describe.

---

### Step 21: Create the `ChatPageView` component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/ChatPageView.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/ChatPageView.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/ChatPageView.utils.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/index.ts`

**Covers:** AC2, AC31, AC33

**Context:** `ChatPageView` is the body of a Chat page. The message list will join it in a follow-up story. For now, sending only logs to the console (story decision). Only one page type exists, so there is no type switch yet. Add one in `PageView` when a second type arrives.

**Changes:**

1. `ChatPageView.constants.ts`: `ChatPageViewTestId` with `container`, plus `COMPOSER_MESSAGE_LOG_LABEL = "Composer message:"`.
2. `ChatPageView.utils.ts`:
   ```ts
   export const logComposerMessage = (message: ComposerMessage) => {
     console.log(COMPOSER_MESSAGE_LOG_LABEL, message);
   };
   ```
3. `ChatPageView.tsx`: no props. Render `<Box data-testid={ChatPageViewTestId.container} display="flex" flexDirection="column" gap="3"><MessageComposer onSend={logComposerMessage} /></Box>`.
4. Barrels: `ChatPageView/index.ts` exports the component. `PageView/components/index.ts` exports `ChatPageView`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 22: Create the `PageView` container

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/PageView.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/index.ts`

**Covers:** AC1, AC2, AC3, AC4, AC5, AC7

**Context:** This is the page view root that the story's discovery notes describe. It reuses `ThreadColumn` (heading on top) and the existing content column test ID and hint, so the current `ThreadColumns` tests keep passing. `key={selectedPage.id}` remounts the composer on every page switch, so the composer always starts empty (AC7).

**Changes:**

1. `PageView.tsx`:
   ```tsx
   export const PageView = () => {
     const { selectedPage } = useThreadPageValue();

     if (!selectedPage) {
       return (
         <ThreadColumn data-testid={ThreadColumnsTestId.contentColumn} isCentered>
           <ThreadColumnMessage message={CONTENT_COLUMN_MESSAGE} />
         </ThreadColumn>
       );
     }

     return (
       <ThreadColumn
         data-testid={ThreadColumnsTestId.contentColumn}
         heading={selectedPage.name}
       >
         <ChatPageView key={selectedPage.id} />
       </ThreadColumn>
     );
   };
   ```
   Import `ThreadColumn` and `ThreadColumnMessage` by relative path (`../ThreadColumn`, `../ThreadColumnMessage`), and the constants from `../../ThreadColumns.constants`, as `PagesColumn.tsx` does.
2. `PageView/index.ts`: `export * from "./PageView";`.
3. `ThreadColumns/components/index.ts`: add `export * from "./PageView";`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 23: Show `PageView` in the thread columns

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`

**Covers:** AC1, AC3, AC4, AC5

**Changes:**

1. Replace the third column (`<ThreadColumn data-testid={ThreadColumnsTestId.contentColumn} isCentered>...</ThreadColumn>`) with `<PageView />`.
2. Remove the imports that are now unused (`ThreadColumn`, `ThreadColumnMessage`, `CONTENT_COLUMN_MESSAGE`).

**Verification MANUAL:** In `npm run start`, open a thread, select a section, then a page. Its name and the composer appear in the third column. Switching pages swaps the view and empties the composer. Deleting the selected page brings back "Select a page to see its content." Reloading clears the selection. Selecting another section closes the page view and shows the hint. Clicking the section that is already selected keeps the page open. Sending a message logs `Composer message: { content, tags }` in the console, and the composer resets.

## Phase 2: Unit tests

---

### Step 1: Add jsdom support for ProseMirror and shared composer fixtures

**New files:**

- `src/__test-fixtures__/composer/composer.editor.ts`
- `src/__test-fixtures__/composer/composer.interactions.ts`
- `src/__test-fixtures__/composer/composer.queries.ts`
- `src/__test-fixtures__/composer/index.ts`

**Files:**
`vitest.setup.ts`
`src/__test-fixtures__/index.ts`

**Covers:** test infrastructure for AC8 to AC38

**Context:** ProseMirror measures positions when it scrolls the selection into view, and jsdom has no layout APIs. The polyfills sit next to the existing `ResizeObserver` and `scrollIntoView` ones.

**Changes:**

1. In `vitest.setup.ts`, add:
   ```ts
   const createEmptyRectList = () => {
     return Object.assign([], { item: () => null }) as unknown as DOMRectList;
   };

   Range.prototype.getBoundingClientRect = () => {
     return new DOMRect();
   };

   Range.prototype.getClientRects = createEmptyRectList;
   Element.prototype.getClientRects = createEmptyRectList;

   document.elementFromPoint = () => {
     return null;
   };
   ```
   Keep `Element.prototype.getClientRects` only if a test fails without it.
2. `composer.editor.ts`:
   - `createTestEditor(content = "")` returns `new Editor({ extensions: createComposerExtensions({ getCommandContext: () => null }), content })`, imported from the composer's `MessageComposer.extensions` by full path.
   - `createCommandContext({ editor, ...overrides })` returns a `ComposerCommandContext` whose UI actions are `vi.fn()`.
   - `selectAllText(editor)` runs `editor.commands.selectAll()`.
3. `composer.queries.ts`: `getComposerEditor()` returns `screen.getByRole("textbox", { name: COMPOSER_EDITOR_LABEL })`. `getToolbarButton(label)` returns `screen.getByRole("button", { name: label })`.
4. `composer.interactions.ts`, with the `type User = ReturnType<typeof userEvent.setup>` alias as in `pages.interactions.ts`:
   - `typeInComposer({ user, text })` clicks the editor and types the text.
   - `selectAllInComposer(user)` clicks the editor and presses `{Control>}a{/Control}`.
   - `addComposerTag({ user, tag })` clicks the Tag button when the tag field is not open, types the tag, and presses Enter.
   - `pickComposerFile({ user, file })` calls `user.upload` on the `MessageComposerTestId.imageInput` element.
5. Export the folder from `src/__test-fixtures__/index.ts`.

**Verification:** `npm run test` still passes; the fixtures compile.

---

### Step 2: Test the `Input` adapter additions

**File:**
`src/components/lib/Input/__tests__/Input.test.tsx`

**Covers:** AC23, AC25, AC26, AC34 (adapter level)

**Changes:**

1. Shows `errorText` with the error test ID and marks the input `aria-invalid`.
2. Shows no error text when `errorText` is empty.
3. Calls `onKeyDown` with the key and `onBlur` when focus leaves.
4. Focuses the input on mount with `autoFocus`.
5. Exposes `aria-label` as the input's accessible name.

**Verification:** `npx vitest run src/components/lib/Input` passes.

---

### Step 3: Test the `IconButton` and `Box` adapter additions

**Files:**
`src/components/lib/IconButton/__tests__/IconButton.test.tsx`
`src/components/lib/Box/__tests__/Box.test.tsx`

**Covers:** AC14, AC15, AC28, AC29 (adapter level)

**Changes:**

1. `IconButton` sets `aria-pressed="true"` and `aria-pressed="false"` from the prop.
2. `IconButton` is disabled with `disabled`, and applies `height`, `minWidth`, and `px` as styles.
3. `Box` applies `flexWrap`, `overflowX`, `whiteSpace`, `maxHeight`, `borderTopWidth`, and `marginLeft` as styles (`toHaveStyle`).

**Verification:** `npx vitest run src/components/lib/IconButton src/components/lib/Box` passes.

---

### Step 4: Test `usePageSelection` and `useSectionSwitch`

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**Covers:** AC1, AC3, AC5, AC6, plus the section-switch rule (developer decision)

**Changes:**

Add a `describe("usePageSelection")` block that mirrors the existing `useSectionSelection` block, using `sectionPageFixtures` and a `setupHook()` with `renderHook` and `rerender`:

1. Selects no page at first (also covers AC6: state is not restored).
2. Selects the page with the given id.
3. Moves the selection when another page is selected.
4. Clears the selection when the selected page leaves `pages` (AC5).
5. Keeps the selection when another page is removed or added.
6. `clearSelectedPage` clears the selection.

Add a `describe("useSectionSwitch")` block. Its `setupHook()` takes `selectedSection` and passes `selectSection` and `clearSelectedPage` as `vi.fn()` mocks:

1. Switching to a different section calls `selectSection` with its id and calls `clearSelectedPage`.
2. Switching when no section is selected calls both.
3. Switching to the already selected section calls neither.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader` passes.

---

### Step 5: Test the selectable `PageCard`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/__tests__/PageCard.test.tsx`

**Covers:** AC1

**Changes:**

1. Update `setup()` to accept `isSelected` (default `false`) and pass an `onSelect` `vi.fn()`, so the existing tests compile.
2. Calls `onSelect` with the page id when the select button is clicked.
3. Does not call `onSelect` when the page is deleted from its actions menu.
4. Not selected: `aria-current="false"` and no page color background.
5. Selected: `aria-current="true"` and the page color as the background. Mirror the matching `SectionCard.test.tsx` cases.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard` passes.

---

### Step 6: Test selection in `PageList` and `PagesColumn`

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/__tests__/PageList.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx`

**Covers:** AC1, AC3

**Changes:**

1. `PageList`: update `setup()` with `selectedPageId` and `onSelectPage`. Only the card with `selectedPageId` has `aria-current="true"`. Clicking a card calls `onSelectPage` with its id.
2. `PagesColumn` (rendered in `ThreadPageLoader` with seeded fixtures): selecting a page card marks it as current, and selecting another moves the mark.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn` passes.

---

### Step 7: Test the composer utils

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.utils.test.ts`

**Covers:** AC24, AC30, AC34, AC35, AC36, AC37

**Changes:**

1. `normalizeTag`: `"  My Tag  "` → `"my-tag"`, `"a   b"` → `"a-b"`, `"   "` → `""`.
2. `isValidHttpUrl`: true for `http://` and `https://` URLs; false for `""`, `"example.com"`, `"ftp://x.org"`, and `"javascript:alert(1)"`.
3. `isImageFile`: true for `image/png`, false for `text/plain` and for an empty type.
4. `readFileAsDataUrl`: resolves to a `data:image/png;base64,` string for a PNG `File`. Rejects when the reader errors: spy on `FileReader.prototype.readAsDataURL` with an implementation that dispatches `new ProgressEvent("error")` on the reader.
5. `hasComposerContent` (with `createTestEditor`): false for `""`, `"<p></p>"`, and `"<p>   </p>"`; true for text, for an image only, and for a code block only.
6. `getCommandTooltip`: `"Bold (Ctrl+B)"` for `boldCommand`, and `"Strikethrough"` for `strikethroughCommand`.

**Verification:** `npx vitest run MessageComposer.utils` passes.

---

### Step 8: Test the composer commands

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.commands.test.ts`

**Covers:** AC9, AC11, AC12, AC16, AC17, AC19, AC20, AC22, AC31, AC38

**Context:** Commands run against a real headless editor from `createTestEditor`, so no Tiptap mocks are needed. Assert on `editor.getHTML()`.

**Changes:**

1. Each formatting command wraps selected text in its tag (`strong`, `em`, `u`, `s`), and a second run removes it (AC9).
2. With an empty selection, bold applies to text inserted next (`editor.commands.insertContent("x")`) (AC38).
3. The bullet and numbered list commands wrap the paragraph in `ul > li` and `ol > li`, and a second run unwraps it (AC11).
4. The code block command inserts `<pre><code>// Enter code here</code></pre><p></p>` (AC12).
5. `insertLinkCommand`, `insertImageCommand`, `tagCommand`, and `sendCommand` call `openLinkField`, `openImagePicker`, `toggleTagField`, and `send` on the context.
6. `createInsertLinkCommand`: with selected text, links that text. With no selection, inserts the URL as the link text. Both outputs include `target="_blank"` and `rel="noopener noreferrer"` (AC17, AC18).
7. `createInsertImageCommand` inserts an `img` with the `src` and `alt`, followed by an empty paragraph (AC20).

**Verification:** `npx vitest run MessageComposer.commands` passes.

---

### Step 9: Test the composer extensions

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.extensions.test.ts`

**Covers:** AC10, AC18, AC20, AC32

**Changes:**

1. Build an editor with `createComposerExtensions({ getCommandContext })`, where `getCommandContext` returns `createCommandContext({ editor })`. Trigger the shortcuts with `editor.commands.keyboardShortcut("Mod-b")` (and `Mod-i`, `Mod-u`) on selected text: the matching mark is applied (AC10).
2. `Mod-Enter` calls the context's `send` and does not insert a `<br>` (AC32: the hard break binding is overridden).
3. When `getCommandContext` returns `null`, `Mod-Enter` does not throw.
4. Headings are disabled: `setContent("<h1>x</h1>")` yields a paragraph.
5. A base64 image survives `setContent` (AC20).

**Verification:** `npx vitest run MessageComposer.extensions` passes.

---

### Step 10: Test the composer state hooks

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.hooks.test.ts`

**Covers:** AC22 to AC28, AC34, AC37

**Context:** `useComposerTags` and `useLinkField` are pure state hooks, so `renderHook` covers them. The editor-bound hooks (`useComposerEditor`, `useHasComposerContent`, `useComposerSend`, `useImageInsertion`) are tested through `MessageComposer` in Step 15.

**Changes:**

1. `useComposerTags`, with a `setupHook()`:
   - The field toggles open and closed. `isTagRowShown` is false at first, true when the field is open, and true when it is closed with at least one tag.
   - `addTag` normalizes and appends, then clears the input. Empty and duplicate tags are ignored.
   - `removeTag` removes only that tag.
   - `discardTagInput` clears the input, closes the field, and keeps the tags.
   - `resetTags` clears everything.
2. `useLinkField`:
   - Opens with an empty URL and no error.
   - `validateLinkUrl` returns the trimmed valid URL.
   - For `""` and `"example.com"`, it returns `null` and sets `INVALID_LINK_URL_MESSAGE`.
   - `changeLinkUrl` clears the error.
   - `closeLinkField` closes.

**Verification:** `npx vitest run MessageComposer.hooks` passes.

---

### Step 11: Test `ComposerToolbar` and `ComposerToolbarButton`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbar/__tests__/ComposerToolbar.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerToolbarButton/__tests__/ComposerToolbarButton.test.tsx`

**Covers:** AC9, AC11, AC12, AC15, AC16, AC19, AC22, AC28

**Changes:**

1. `ComposerToolbarButton`: has the command label as its accessible name, shows `getCommandTooltip(command)` on hover (reuse the tooltip fixture from `@/components/lib/__test-fixtures__`), calls `onCommand` with the command on click, and reflects `isActive` in `aria-pressed`.
2. `ComposerToolbar`: renders the formatting buttons, then the divider, then the structure buttons, then the Tag button, in that order (use `isFollowing` from `@/__test-fixtures__`). The container has `flexWrap: wrap` (AC15). The Tag button's `aria-pressed` follows `isTagActive`.

**Verification:** `npx vitest run ComposerToolbar` passes.

---

### Step 12: Test `LinkField`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/LinkField/__tests__/LinkField.test.tsx`

**Covers:** AC16, AC34

**Changes:**

1. The input is focused on mount.
2. Typing calls `onChange`.
3. Enter and the "Add link" button call `onConfirm`.
4. Escape and the "Cancel" button call `onCancel`.
5. `error` is shown as inline text.

**Verification:** `npx vitest run LinkField` passes.

---

### Step 13: Test `TagRow` and `TagChip`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/__tests__/TagRow.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/__tests__/TagChip.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/components/TagChip/__tests__/TagChip.utils.test.ts`

**Covers:** AC22, AC23, AC25, AC26, AC27, AC29

**Changes:**

1. `TagChip.utils`: `getRemoveTagLabel("ideas")` returns `"Remove tag ideas"`.
2. `TagChip`: shows the full tag name (a very long one is not truncated), and the remove button, named `Remove tag <tag>`, calls `onRemove` with the tag.
3. `TagRow`:
   - Renders a chip per tag.
   - Shows the input only when `isTagFieldOpen` is true.
   - Enter and comma call `onAddTag`, and the comma is not typed into the value.
   - Escape calls `onDiscardTagInput`.
   - Blur calls `onAddTag`.
   - The chip row has `overflowX: auto`, and chips have `flexShrink: 0` (AC29).

**Verification:** `npx vitest run TagRow TagChip` passes.

---

### Step 14: Test `ComposerFooter`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/ComposerFooter/__tests__/ComposerFooter.test.tsx`

**Covers:** AC30, AC31

**Changes:**

1. Shows the `SEND_HINT`.
2. The Send button is disabled when `canSend` is false, and clicking it does not call `onSend`.
3. When `canSend` is true, clicking Send calls `onSend`.

**Verification:** `npx vitest run ComposerFooter` passes.

---

### Step 15: Test `MessageComposer` end to end

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/__tests__/MessageComposer.test.tsx`

**Covers:** AC8 to AC14, AC16, AC17, AC19, AC20, AC22, AC23, AC25, AC26, AC28, AC30 to AC32, AC34 to AC38

**Context:** Render with `renderWithUIProvider`, a real editor, and an `onSend` `vi.fn()`. `setup({ applyAccept = true } = {})` passes `applyAccept` to `userEvent.setup()`. Only the non-image test passes `false`, so user-event does not filter the file before the component sees it (`unit-tests.md` rule 14). Use the composer interactions from Phase 2 Step 1.

**Changes:**

1. Placeholder: the empty editor's first paragraph has `data-placeholder` equal to `COMPOSER_PLACEHOLDER` (AC8).
2. Formatting:
   - Type "Hello", select all, click Bold: the editor contains `strong`. Clicking Bold again removes it (AC9).
   - Same check for Italic, Underline, and Strikethrough (use `it.each`).
   - Ctrl+B, Ctrl+I, and Ctrl+U on selected text apply the marks (AC10).
   - After clicking Bold, the editor has focus (`toHaveFocus`) and typing continues in bold (AC13, AC38).
3. Lists and code: the list buttons toggle `ul`/`ol` (AC11), and Code block inserts `pre` with the placeholder text, followed by an empty paragraph (AC12).
4. The editor area has `max-height: 16rem` and `overflow-y: auto` (AC14).
5. Links:
   - Insert link shows a focused URL field (AC16).
   - Typing a valid URL and pressing Enter inserts an `a[href]` with the URL as its text and closes the field (AC17).
   - With text selected, the selected text becomes the link text (AC17).
   - `""` and `"example.com"` show `INVALID_LINK_URL_MESSAGE`, insert nothing, and keep the field open (AC34).
   - Cancel closes the field.
6. Images:
   - Clicking Insert image calls `click` on the hidden input (spy on `HTMLInputElement.prototype.click`), and the input has `accept="image/*"` (AC19).
   - Picking a PNG inserts an `img` whose `src` starts with `data:image/png` (find it with `findBy`), followed by an empty paragraph (AC20).
   - With `setup({ applyAccept: false })`, picking a text file shows the `UNSUPPORTED_IMAGE_MESSAGE` notification and inserts nothing (AC35).
   - When `FileReader` errors (same spy as in Step 7), the `IMAGE_LOAD_ERROR_MESSAGE` notification shows and nothing is inserted (AC36).
7. Tags:
   - The Tag button toggles the tag field (AC22).
   - Enter and comma add a normalized chip and clear the field (AC23, AC24).
   - Tabbing out with text adds it (AC25).
   - Escape closes the field, discards the text, and keeps the chips (AC26).
   - A duplicate is ignored with no notification (AC37).
   - The Tag button is `aria-pressed` while open, and also when it is closed with tags (AC28).
8. Sending:
   - Send is disabled when empty, and stays disabled with only tags (AC30).
   - After typing, clicking Send calls `onSend` with `{ content: "<p>Hello</p>", tags: ["ideas"] }` (`toHaveBeenCalledWith`, which compares deeply). The editor is then empty, there are no chips, the tag field is closed, and the editor has focus (AC31).
   - Ctrl+Enter sends the same way (AC31).
   - Ctrl+Enter on an empty editor does not call `onSend` (AC32).
   - An image-only message enables Send (AC30).

**Verification:** `npx vitest run MessageComposer.test` passes.

---

### Step 16: Test `ChatPageView`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/__tests__/ChatPageView.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/__tests__/ChatPageView.utils.test.ts`

**Covers:** AC2, AC31, AC33

**Changes:**

1. `ChatPageView.utils`: `logComposerMessage` calls `console.log` with `COMPOSER_MESSAGE_LOG_LABEL` and the message. Spy with `vi.spyOn(console, "log").mockImplementation(() => {})`, and restore it in `afterEach`.
2. `ChatPageView`:
   - Renders the composer.
   - Sending "Hello" logs `{ content: "<p>Hello</p>", tags: [] }` to the console.
   - Nothing else appears in the view after sending (AC33: no message list).

**Verification:** `npx vitest run ChatPageView` passes.

---

### Step 17: Test `PageView`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/__tests__/PageView.test.tsx`

**Covers:** AC2, AC3, AC4, AC7

**Context:** Render `<ThreadPageLoader threadId=...><PagesColumn /><PageView /></ThreadPageLoader>` with seeded threads, sections, and pages (as `ThreadColumns.test.tsx` does), and select a section and a page through the UI.

**Changes:**

1. With no page selected, shows `CONTENT_COLUMN_MESSAGE` and no composer (AC4).
2. After selecting "Brainstorm", the content column shows an `h3` named "Brainstorm", followed by the composer (`isFollowing`) (AC2).
3. Selecting "Shortlist" replaces the heading (AC3).
4. Typing in the composer, switching to "Shortlist", and switching back leaves the editor empty (AC7).

**Verification:** `npx vitest run PageView` passes.

---

### Step 18: Test the page view wiring in `ThreadColumns` and `ThreadPage`

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/__tests__/ThreadColumns.test.tsx`
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC1, AC4, AC5, AC6, plus the section-switch rule (developer decision)

**Changes:**

1. `ThreadColumns`: keep the existing content column message test (AC4). Add:
   - Selecting a page shows its page view in the content column next to the Sections and Pages columns (AC1).
   - After selecting a page, selecting another section brings back `CONTENT_COLUMN_MESSAGE`. Selecting the first section again still shows the hint, and no page card is `aria-current="true"`.
   - After selecting a page, clicking its already selected section keeps the page view.
2. `ThreadPage` (full page with the delete modal):
   - Deleting the selected page through its actions menu (`openPageDeleteMenu` and the deletion fixtures) brings back `CONTENT_COLUMN_MESSAGE` (AC5).
   - Deleting the section of the selected page does the same.
3. `ThreadPage`: after unmounting and rendering the page again with the same storage (a simulated reload), no page is selected and the hint is shown (AC6).

**Verification:** `npm run test` passes in full, and `npm run build` and `npm run lint` pass.

## Phase 3: Documentation

---

### Step 1: Document the Tiptap editor and the composer command pattern in `CLAUDE.md`

**File:**
`CLAUDE.md`

**Covers:** AC9 to AC38 (how the composer is built)

**Context:** Tiptap is a new third-party library with project rules attached: no `execCommand`, every action is a command, and jsdom polyfills are needed. That is a convention, not an inventory. Following the memory note, list only the rule and one example, not every command.

**Changes:**

1. Under `## Third-party Libraries`, after the Chakra UI paragraph, add a **Tiptap** paragraph:
   - The message composer (`MessageComposer`, under the thread page's `PageView`) uses Tiptap 3. All `@tiptap/*` packages share one exact version. `document.execCommand()` is not used.
   - Every composer action is a command object (`ComposerCommand`, `execute(context)`) in `MessageComposer.commands.ts`. Toolbar buttons, the Send button, and keyboard shortcuts invoke the same objects. Example: `boldCommand` backs both the Bold button and Ctrl/Cmd+B. Actions that carry data use factories such as `createInsertLinkCommand(url)`.
   - Commands are tested against a real headless editor (`createTestEditor` from `@/__test-fixtures__`). `vitest.setup.ts` polyfills the Range and `elementFromPoint` layout APIs that ProseMirror needs in jsdom.
2. In the `src/__test-fixtures__/` folder-structure bullet, nothing changes (it already describes shared fixtures generally).

**Verification MANUAL:** Read the new Tiptap paragraph in `CLAUDE.md`. It names the version rule, the command pattern with one example, and the test setup. It does not list every command or file.
