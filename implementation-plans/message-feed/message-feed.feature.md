# Chat Page Message Feed

**Source:** `implementation-plans/message-feed/message-feed.draft.md`

## Acceptance criteria

- AC1: The feed is shown directly under the composer, with a 16px gap.
- AC2: A Chat page with no messages shows "No messages yet. Write your first message above." once loaded.
- AC3: Sending composer content adds a new message at the top of the feed.
- AC4: Messages are listed newest first, top to bottom.
- AC5: Each message is aligned to the user's side of the feed.
- AC6: A message shows, top to bottom: sent date and time, tags as chips, formatted text.
- AC7: Tag chips wrap onto more rows and never scroll horizontally.
- AC8: A message without tags has no tags block; the text follows the date and time.
- AC9: After a browser reload, a page shows all its messages in the same order.
- AC10: Switching Chat pages shows only the messages of the page switched to.
- AC11: Deleting a Chat page deletes its messages.
- AC12: Bold, italic, lists, line breaks, links and images created in the composer are kept.
- AC13: Scripts, event handler attributes and code-running link/image addresses are removed, scripts do not run, and the rest of the message is shown.
- AC14: Links in a message open in a new browser tab.
- AC15: Any other formatting is removed and its text is kept.
- AC16: With 5,000 messages, scrolling stays smooth because only messages near the visible area are rendered.
- AC17: While messages load, a spinner in a full-page progress overlay blocks the whole application.
- AC18: If loading fails, the overlay is removed and the feed area shows an error message with a "Try again" button.
- AC19: "Try again" shows the overlay with the spinner again and restarts loading.
- AC20: If loading fails, the composer keeps its text and tags.
- AC21: If saving a message fails, the message does not appear in the feed and the error notification "Message could not be sent. Please try again." is shown.
- AC22: If saving a message fails, the composer keeps its text and tags.
- AC23: When a message is saved, the composer is cleared and no confirmation notification is shown.

## Style notes

- Path shorthand: in this plan, `CHAT/` stands for `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/`. Always write the full path in code and commits. — plan convention
- Follow `implementation-plans/message-composer/message-composer.style.md`: named exports, arrow functions, `type` over `interface`, block-bodied arrows with explicit `return`, braces on every `if`, truthiness checks, vertical rhythm, ternaries with `: null` in JSX, `handle[EventName]` handlers, object parameters for two or more arguments. — project convention + `typescript.md`, `react.md`
- New dependencies are pinned to exact versions: `dompurify@3.4.17` and `@tanstack/react-virtual@3.14.26`. Both are more than two weeks old. — developer decision (sanitizer and virtualization choice), `CLAUDE.md` → Package Management
- Message HTML is sanitized with a dedicated DOMPurify instance (`DOMPurify(window)`), never the shared default instance, so the link hook added for messages cannot affect other code. DOMPurify is imported in exactly one file (`MessageContent.utils.ts`). — developer decision
- Virtualization uses `useVirtualizer` from `@tanstack/react-virtual` with dynamic row measurement (`measureElement` + `data-index`). The feed is its own scroll area that fills the space under the composer. Only `MessageList` calls `useVirtualizer`. That component starts with the `"use no memo"` directive, because the React Compiler cannot safely memoize the virtualizer's mutable return value. — developer decision; React Compiler is on (`vite.config.ts`)
- All message reads and writes go through `useThreadsService` (`getPageMessages`, `addPageMessage`). The thread page exposes them through `ThreadPageActionContext`. `ChatPageView` never calls `usePageMessagesService` directly. Reason: `useLocalStorage` caches per hook instance. A separate instance in `ChatPageView` would keep a stale cache after `removeSectionPage` deletes another page's messages, and the next send would write the deleted messages back. — architect decision (same pattern as `addSectionPage`, `src/services/useThreadsService/useThreadsService.ts:132`)
- Deleting a section or a thread also deletes its messages, the same way it already deletes its pages. This keeps the `messages` storage free of orphaned messages. — architect decision
- Chakra is used only through `@/components/lib` adapters. Extend `Box` when a prop is missing. — project convention (`CLAUDE.md`)
- Rich-text descendant styles that Chakra props cannot reach live in CSS modules. They are shared between the composer and the feed through one `richText` class, not copied. — project convention (`MessageComposer.module.css`), `typescript.md` rule 4
- Shared components inside `ChatPageView` (`TagChip`) live in `CHAT/components/`. Sibling folders import them by direct folder path, not through `CHAT/components/index.ts`, to avoid an import cycle. — project convention (same reason as the `@/routing` note in `CLAUDE.md`)
- `tsconfig.app.json` includes test files. During Phase 1, `npm run ts:check` may report errors in `__tests__` files that use changed signatures. Phase 2 fixes them. Phase 1 checks require no errors outside `__tests__`. — project config

## Phase 1: Implementation

---

### Step 1: Add the sanitizer and virtualization dependencies

**File:**
`package.json`

**Covers:** AC13, AC16

**Changes:**

1. Run `npm install --save-exact dompurify@3.4.17 @tanstack/react-virtual@3.14.26`.
2. Confirm that `package.json` lists both packages under `dependencies` with exact versions (no `^` or `~`), and that `package-lock.json` is updated. `dompurify` ships its own types, so do not add `@types/dompurify`.

**Verification MANUAL:** `npm ls dompurify @tanstack/react-virtual` prints exactly `3.4.17` and `3.14.26`, and `npm run build` still succeeds.

---

### Step 2: Add the chat message type

**New files:**

- `src/types/ChatMessage.ts`

**File:**
`src/types/index.ts`

**Covers:** AC3, AC6, AC9

**Context:** Mirrors `src/types/SectionPage.ts`. A message stores `threadId` and `sectionId` as well as `pageId`, so that deleting a section or a thread can remove its messages without looking up pages.

**Changes:**

1. Create `src/types/ChatMessage.ts`:

   ```ts
   export type ChatMessage = {
     id: string;
     threadId: string;
     sectionId: string;
     pageId: string;
     content: string;
     tags: string[];
     createdAt: string;
   };

   export type NewChatMessage = Pick<
     ChatMessage,
     "threadId" | "sectionId" | "pageId" | "content" | "tags"
   >;
   ```

2. Add `export * from "./ChatMessage";` to `src/types/index.ts`, keeping alphabetical order (before `./MindThread`).

**Verification MANUAL:** `import type { ChatMessage, NewChatMessage } from "@/types"` compiles (`npm run ts:check`).

---

### Step 3: Create the page messages service helpers

**New files:**

- `src/services/usePageMessagesService/usePageMessagesService.constants.ts`
- `src/services/usePageMessagesService/usePageMessagesService.types.ts`
- `src/services/usePageMessagesService/usePageMessagesService.utils.ts`

**Covers:** AC3, AC9

**Context:** Follows `src/services/useSectionPagesService/` file by file.

**Changes:**

1. `usePageMessagesService.constants.ts`:

   ```ts
   export const MESSAGES_STORAGE_KEY = "messages";
   export const INVALID_MESSAGES_DATA_ERROR = "Stored messages data is invalid";
   ```

2. `usePageMessagesService.types.ts`:

   ```ts
   import type { ChatMessage, NewChatMessage } from "@/types";

   export type UsePageMessagesServiceReturn = {
     getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
     createMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
     deletePageMessages: (pageId: string) => Promise<void>;
     deleteSectionMessages: (sectionId: string) => Promise<void>;
     deleteThreadMessages: (threadId: string) => Promise<void>;
   };

   export type ChatMessagePredicate = (message: ChatMessage) => boolean;
   ```

3. `usePageMessagesService.utils.ts`: add `buildMessage` and `isChatMessageList`, following `buildPage` and `isSectionPageList` in `useSectionPagesService.utils.ts`:

   ```ts
   export const buildMessage = ({
     threadId,
     sectionId,
     pageId,
     content,
     tags,
   }: NewChatMessage): ChatMessage => {
     return {
       id: crypto.randomUUID(),
       threadId,
       sectionId,
       pageId,
       content,
       tags: [...tags],
       createdAt: new Date().toISOString(),
     };
   };

   const isStringList = (value: unknown): value is string[] => {
     return (
       Array.isArray(value) &&
       value.every((item) => {
         return typeof item === "string";
       })
     );
   };

   const isChatMessage = (value: unknown): value is ChatMessage => {
     if (typeof value !== "object" || value === null) {
       return false;
     }

     const message = value as Partial<Record<keyof ChatMessage, unknown>>;

     return (
       typeof message.id === "string" &&
       typeof message.threadId === "string" &&
       typeof message.sectionId === "string" &&
       typeof message.pageId === "string" &&
       typeof message.content === "string" &&
       isStringList(message.tags) &&
       typeof message.createdAt === "string" &&
       !Number.isNaN(Date.parse(message.createdAt))
     );
   };

   export const isChatMessageList = (value: unknown): value is ChatMessage[] => {
     return Array.isArray(value) && value.every(isChatMessage);
   };
   ```

   The `value === null` check is strict on purpose (`typeof null === "object"`), the same as in the sibling util. `createdAt` must also parse as a date: `formatMessageDate` throws `RangeError` on an invalid date, which would blank the thread page, so damaged data is rejected here and shown as the load error (AC18).

**Verification MANUAL:** `npm run ts:check` reports no errors in the three new files.

---

### Step 4: Create the page messages service hook

**New files:**

- `src/services/usePageMessagesService/usePageMessagesService.ts`
- `src/services/usePageMessagesService/index.ts`

**File:**
`src/services/index.ts`

**Covers:** AC3, AC4, AC9, AC10, AC11

**Context:** Same shape as `useSectionPagesService.ts`. Messages are stored newest first: `createMessage` prepends, the same way `createThread` does, so filtering by page keeps the newest-first order without sorting. The three delete methods share one private helper instead of repeating filter-and-save.

**Changes:**

1. `usePageMessagesService.ts`:

   ```ts
   export const usePageMessagesService = (): UsePageMessagesServiceReturn => {
     const messagesStorage = useLocalStorage<ChatMessage[]>({
       key: MESSAGES_STORAGE_KEY,
       throwOnError: true,
     });

     const getMessages = async (): Promise<ChatMessage[]> => {
       const storedMessages = messagesStorage.read();

       if (!storedMessages) {
         return [];
       }

       if (!isChatMessageList(storedMessages)) {
         throw new Error(INVALID_MESSAGES_DATA_ERROR);
       }

       return storedMessages;
     };

     const getPageMessages = async (pageId: string): Promise<ChatMessage[]> => {
       const storedMessages = await getMessages();

       return storedMessages.filter((message) => {
         return message.pageId === pageId;
       });
     };

     const createMessage = async (
       newMessage: NewChatMessage
     ): Promise<ChatMessage> => {
       const createdMessage = buildMessage(newMessage);
       const storedMessages = await getMessages();

       messagesStorage.set([createdMessage, ...storedMessages]);

       return createdMessage;
     };

     const deleteMatchingMessages = async (
       isMatching: ChatMessagePredicate
     ): Promise<void> => {
       const storedMessages = await getMessages();

       const remainingMessages = storedMessages.filter((message) => {
         return !isMatching(message);
       });

       if (remainingMessages.length !== storedMessages.length) {
         messagesStorage.set(remainingMessages);
       }
     };

     const deletePageMessages = async (pageId: string): Promise<void> => {
       await deleteMatchingMessages((message) => {
         return message.pageId === pageId;
       });
     };

     // deleteSectionMessages and deleteThreadMessages follow the same shape,
     // matching on message.sectionId and message.threadId.

     return {
       getPageMessages,
       createMessage,
       deletePageMessages,
       deleteSectionMessages,
       deleteThreadMessages,
     };
   };
   ```

2. `index.ts`:

   ```ts
   export * from "./usePageMessagesService";
   export * from "./usePageMessagesService.types";
   ```

3. Add `export * from "./usePageMessagesService";` to `src/services/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes for `src/services/`. In the dev server console, calling the hook is not possible directly, so check the types only: `usePageMessagesService` is importable from `@/services`.

---

### Step 5: Route message reads, writes and cascade deletes through the threads service

**Files:**
`src/services/useThreadsService/useThreadsService.ts`
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.constants.ts`

**Covers:** AC3, AC9, AC10, AC11

**Context:** `useThreadsService` already owns every write that spans entities (`addSectionPage`, `removeSectionPage`). Keeping message reads and writes on the same instance as the cascade deletes keeps a single `messages` cache per thread page (see Style notes). `addPageMessage` checks that the page still exists, so a message is never saved for a page deleted in another tab. The check mirrors the section check in `addSectionPage`.

**Changes:**

1. In `useThreadsService.constants.ts`, add `export const PAGE_NOT_FOUND_ERROR = "Page not found";`.
2. In `useThreadsService.types.ts`, import `ChatMessage` and `NewChatMessage` from `@/types` and extend `UseThreadsServiceReturn`:

   ```ts
   getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
   addPageMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
   ```

3. In `useThreadsService.ts`:
   - Import `usePageMessagesService` from `"../usePageMessagesService"` and create it next to the other services: `const pageMessagesService = usePageMessagesService();`.
   - Add the two methods:

     ```ts
     const getPageMessages = async (pageId: string): Promise<ChatMessage[]> => {
       return pageMessagesService.getPageMessages(pageId);
     };

     const addPageMessage = async (
       newMessage: NewChatMessage
     ): Promise<ChatMessage> => {
       const threadPages = await sectionPagesService.getThreadPages(
         newMessage.threadId
       );

       const pageExists = threadPages.some((page) => {
         return page.id === newMessage.pageId;
       });

       if (!pageExists) {
         throw new Error(PAGE_NOT_FOUND_ERROR);
       }

       return pageMessagesService.createMessage(newMessage);
     };
     ```

   - In `removeSectionPage`, replace the early return with `if (isPageDeleted && storedThread) { ...update the thread... }` and, after that block, add `await pageMessagesService.deletePageMessages(pageId);`. The messages are removed even when the page was already deleted elsewhere.
   - In `removeThreadSection`, do the same: wrap the thread update in `if (isSectionDeleted && storedThread) { ... }` and add `await pageMessagesService.deleteSectionMessages(sectionId);` after it.
   - In `deleteThread`, add `await pageMessagesService.deleteThreadMessages(threadId);` after the final `threadsStorage.set(filteredThreads);`.
   - The message cleanup always runs last. `getMessages` throws on invalid stored data. If the cleanup ran first, a damaged `messages` key would stop the delete halfway: the page or section would be gone, but the thread's counters would stay stale and a retry could not repair them. With the cleanup last, the worst case is orphaned messages.
   - Add `getPageMessages` and `addPageMessage` to the returned object.

**Verification MANUAL:** `npm run ts:check` passes outside `__tests__`. In the dev server, deleting a page, a section and a thread still works as before.

---

### Step 6: Expose message reads and writes from the thread page loader

**Files:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`

**Covers:** AC3, AC10, AC11

**Context:** `useThreadState` owns the page's single `threadsService` instance, so it hands the two message methods through unchanged. Message state stays in `ChatPageView`, because only the open Chat page needs it.

**Changes:**

1. In `ThreadPageLoader.hooks.ts`, at the end of `useThreadState`, add to the returned object:

   ```ts
   getPageMessages: threadsService.getPageMessages,
   addPageMessage: threadsService.addPageMessage,
   ```

2. In `ThreadPageLoader.types.ts`, import `ChatMessage` and `NewChatMessage` from `@/types` and add to `ThreadPageAction`:

   ```ts
   getPageMessages: (pageId: string) => Promise<ChatMessage[]>;
   addPageMessage: (newMessage: NewChatMessage) => Promise<ChatMessage>;
   ```

3. In `ThreadPageLoader.tsx`, destructure `getPageMessages` and `addPageMessage` from `useThreadState(threadId)` and add both to the `ThreadPageActionContext.Provider` value object (inline object, no `useMemo`, as the existing entries are).

**Verification MANUAL:** `npm run ts:check` passes outside `__tests__`, and the thread page still loads in the dev server.

---

### Step 7: Make the composer clear only after a successful send

**Files:**
`CHAT/components/MessageComposer/MessageComposer.types.ts`
`CHAT/components/MessageComposer/MessageComposer.hooks.ts`
`CHAT/components/MessageComposer/MessageComposer.tsx`

**Covers:** AC22, AC23

**Context:** Today `useComposerSend` calls `onSend` and clears the editor and tags right away (`MessageComposer.hooks.ts:209`). The composer must keep its content when saving fails, so `onSend` now reports the outcome and the composer clears only on success. The error notification belongs to the caller, which knows what failed. `sendCommand` keeps calling `send()` without awaiting it, the same way `loadThread()` is called in `ThreadPageLoader.hooks.ts`.

**Changes:**

1. In `MessageComposer.types.ts`:
   - `ComposerCommandContext.send` becomes `send: () => Promise<void>;`.
   - `UseComposerSendParams.onSend` becomes `onSend: (message: ComposerMessage) => Promise<boolean>;`.
2. In `MessageComposer.hooks.ts`, change `useComposerSend`:

   ```ts
   const send = async () => {
     if (!hasComposerContent(editor)) {
       return;
     }

     const isSent = await onSend({ content: editor.getHTML(), tags });

     if (!isSent) {
       return;
     }

     editor.chain().setMeta("addToHistory", false).clearContent().focus().run();

     resetTags();
   };
   ```

3. In `MessageComposer.tsx`, change the props type to `onSend: (message: ComposerMessage) => Promise<boolean>;`. Nothing else changes there.

**Verification MANUAL:** `npm run ts:check` reports no errors outside `__tests__` (the `ChatPageView` call site is fixed in Step 16).

---

### Step 8: Extend the Box adapter with the props the feed needs

**File:**
`src/components/lib/Box/Box.tsx`

**Covers:** AC5, AC12, AC16

**Context:** The virtualized list needs a translated inner window and `data-index` on measured rows. Message bubbles need `maxWidth`. Sanitized content needs `className` and `dangerouslySetInnerHTML`. The composer already extended `Box` the same way (`git show 898ccc1 -- src/components/lib/Box/Box.tsx`).

**Changes:**

1. Add these optional props to `BoxProps` (the component body stays unchanged, because it spreads the props):

   ```ts
   className?: string;
   dangerouslySetInnerHTML?: { __html: string };
   "data-index"?: number;
   left?: string;
   transform?: string;
   pb?: string;
   maxWidth?: string;
   ```

**Verification MANUAL:** `npm run ts:check` passes, and existing screens look unchanged in the dev server.

---

### Step 9: Share the rich-text content styles between the composer and the feed

**New files:**

- `CHAT/ChatPageView.module.css`

**Files:**
`CHAT/components/MessageComposer/MessageComposer.module.css`
`CHAT/components/MessageComposer/MessageComposer.hooks.ts`

**Covers:** AC12, AC15

**Context:** The feed must display italic, lists, images and links the same way the composer does. Chakra's preflight resets them, and the composer restores them in `MessageComposer.module.css`. The styles move to one `richText` class instead of being copied. The `pre` rule stays in the composer, because the feed strips code blocks (AC15).

**Changes:**

1. Create `CHAT/ChatPageView.module.css` with a `.richText` class. Move the `em`, `ul`, `ol`, `img` and `a` rules from `MessageComposer.module.css`, re-scoped from `.editor X` to `.richText X`, together with the comment about Chakra's preflight. Add:

   ```css
   .richText {
     overflow-wrap: anywhere;
   }

   /* Tiptap saves an empty line as an empty paragraph; keep its height so
      blank lines written in the composer stay visible in the feed. */
   .richText p:empty {
     min-height: 1lh;
   }
   ```

2. Remove the moved rules from `MessageComposer.module.css`. Keep `.editor`, the placeholder rule and `.editor pre`.
3. In `MessageComposer.hooks.ts`, import the shared module (`import chatPageViewStyles from "../../ChatPageView.module.css";`) and give the editor both classes in `useComposerEditor`:

   ```ts
   class: `${styles.editor} ${chatPageViewStyles.richText}`,
   ```

**Verification MANUAL:** In the dev server, italic text, bullet and numbered lists, images and links in the composer look exactly as they did before.

---

### Step 10: Move TagChip up to ChatPageView and make its remove button optional

**New files:**

- `CHAT/components/TagChip/` (moved from `CHAT/components/MessageComposer/components/TagRow/components/TagChip/`)
- `CHAT/components/index.ts`

**Files:**
`src/components/lib/Text/Text.tsx`
`CHAT/components/TagChip/TagChip.tsx`
`CHAT/components/MessageComposer/components/TagRow/TagRow.tsx`
`CHAT/components/MessageComposer/components/TagRow/components/index.ts` (deleted)

**Covers:** AC6, AC7

**Context:** Feed messages show the same chips as the composer, but without a remove button. Moving the chip to the closest common parent, and making `onRemove` optional, avoids a second chip component with the same styles.

**Changes:**

1. `git mv` the whole `TagChip/` folder, including its `__tests__/`, to `CHAT/components/TagChip/`. The tests import `../TagChip`, so their imports stay valid.
2. Delete `CHAT/components/MessageComposer/components/TagRow/components/index.ts` and the now empty `components/` folder.
3. In `TagRow.tsx`, change the import to `import { TagChip } from "../../../TagChip";`.
4. In `src/components/lib/Text/Text.tsx`, add `overflowWrap?: string;` to `TextProps` (the component body spreads the props).
5. In `TagChip.tsx`, make `onRemove` optional and render the button only when it is given. The chip keeps `flexShrink={0}` and `whiteSpace="nowrap"` only when it is removable (the composer's scrolling row). The read-only chip shrinks, wraps, and breaks long words, so a long tag never overflows the bubble or adds a horizontal scrollbar to the feed (AC7):

   ```tsx
   type TagChipProps = {
     tag: string;
     onRemove?: (tag: string) => void;
   };

   export const TagChip = ({ tag, onRemove }: TagChipProps) => {
     const handleRemove = () => {
       onRemove?.(tag);
     };

     return (
       <Box
         /* unchanged props, except: */
         flexShrink={onRemove ? 0 : 1}
         whiteSpace={onRemove ? "nowrap" : "normal"}
         minWidth="0"
         pr={onRemove ? "1" : "2"}
       >
         <Text
           data-testid={TagChipTestId.name}
           fontSize="xs"
           overflowWrap="anywhere"
         >
           {tag}
         </Text>

         {onRemove ? (
           <IconButton /* unchanged props */ onClick={handleRemove}>
             <LuX aria-hidden />
           </IconButton>
         ) : null}
       </Box>
     );
   };
   ```

6. Create `CHAT/components/index.ts`:

   ```ts
   export * from "./MessageComposer";
   export * from "./TagChip";
   ```

   (`MessageFeed` is added in Step 15.)

**Verification MANUAL:** In the dev server, composer tags still show a working remove button. `npm run ts:check` passes outside `__tests__`. Step 17 checks that a long tag wraps in the feed.

---

### Step 11: Add the message status constants, types and the page messages hook

**New files:**

- `CHAT/ChatPageView.types.ts`
- `CHAT/ChatPageView.hooks.ts`

**File:**
`CHAT/ChatPageView.constants.ts`

**Covers:** AC3, AC10, AC17, AC18, AC19, AC21, AC22, AC23

**Context:** Follows the `useThreadState` loading pattern (`ThreadPageLoader.hooks.ts:78`): the status is the effect trigger, `Loading` runs the load, and retrying only sets the status back to `Loading`. `ChatPageView` is keyed by page id in `PageView.tsx:26`, so switching pages remounts it and loads only that page's messages (AC10). `sendMessage` returns whether the save worked, so the composer knows whether to clear (Step 7). On success it shows no notification (AC23).

**Changes:**

1. In `ChatPageView.constants.ts`, remove `COMPOSER_MESSAGE_LOG_LABEL` and add:

   ```ts
   export const MessagesStatus = {
     Loading: "loading",
     Loaded: "loaded",
     Error: "error",
   } as const;

   export const SEND_MESSAGE_ERROR_MESSAGE =
     "Message could not be sent. Please try again.";
   ```

2. `ChatPageView.types.ts`:

   ```ts
   import type { MessagesStatus } from "./ChatPageView.constants";

   export type MessagesStatusType =
     (typeof MessagesStatus)[keyof typeof MessagesStatus];
   ```

   Check how `ThreadStatusType` is declared in `src/pages/ThreadPage/ThreadPage.types.ts` and use the same form.

3. `ChatPageView.hooks.ts`:

   ```ts
   export const usePageMessages = (page: SectionPage) => {
     const { getPageMessages, addPageMessage } = useThreadPageAction();

     const [messages, setMessages] = useState<ChatMessage[]>([]);

     const [messagesStatus, setMessagesStatus] = useState<MessagesStatusType>(
       MessagesStatus.Loading
     );

     useEffect(() => {
       if (messagesStatus !== MessagesStatus.Loading) {
         return;
       }

       let isActive = true;

       const loadMessages = async () => {
         try {
           const storedMessages = await getPageMessages(page.id);

           if (!isActive) {
             return;
           }

           setMessages(storedMessages);
           setMessagesStatus(MessagesStatus.Loaded);
         } catch {
           if (isActive) {
             setMessagesStatus(MessagesStatus.Error);
           }
         }
       };

       loadMessages();

       return () => {
         isActive = false;
       };
     }, [page.id, messagesStatus, getPageMessages]);

     const retryLoadingMessages = () => {
       setMessagesStatus(MessagesStatus.Loading);
     };

     const sendMessage = async ({ content, tags }: ComposerMessage) => {
       try {
         const createdMessage = await addPageMessage({
           threadId: page.threadId,
           sectionId: page.sectionId,
           pageId: page.id,
           content,
           tags,
         });

         setMessages((currentMessages) => {
           return [createdMessage, ...currentMessages];
         });

         return true;
       } catch {
         notify.error(SEND_MESSAGE_ERROR_MESSAGE);

         return false;
       }
     };

     return { messages, messagesStatus, retryLoadingMessages, sendMessage };
   };
   ```

   Imports: `useThreadPageAction` from `@/pages/ThreadPage/components/ThreadPageLoader` (as `PageView.tsx` does), `notify` from `@/components/lib`, `ChatMessage` and `SectionPage` from `@/types`, and `ComposerMessage` from `./components/MessageComposer/MessageComposer.types`.

**Verification MANUAL:** `npm run ts:check` passes outside `__tests__`.

---

### Step 12: Create the sanitized message content component

**New files:**

- `CHAT/components/MessageFeed/components/MessageContent/MessageContent.tsx`
- `CHAT/components/MessageFeed/components/MessageContent/MessageContent.constants.ts`
- `CHAT/components/MessageFeed/components/MessageContent/MessageContent.utils.ts`
- `CHAT/components/MessageFeed/components/MessageContent/index.ts`

**Covers:** AC12, AC13, AC14, AC15

**Context:** DOMPurify with a strict allowlist keeps only what the composer can produce for the feed. Removed tags keep their text (`KEEP_CONTENT` is on by default), while `<script>` and its contents are dropped completely. `ALLOWED_URI_REGEXP` allows only `http`/`https` addresses. DOMPurify still allows `data:` URLs on `<img src>` (pasted and uploaded images are data URLs), but not on links. A hook on a dedicated instance forces new-tab links. Sanitizing happens at render time, so stored messages are never trusted, including messages edited by hand in `localStorage`. It runs only for the rows the virtualizer renders.

**Changes:**

1. `MessageContent.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("MessageContent__");

   export const MessageContentTestId = {
     container: createTestId("container"),
   } as const;

   export const MESSAGE_ALLOWED_TAGS = [
     "p",
     "br",
     "strong",
     "em",
     "ul",
     "ol",
     "li",
     "a",
     "img",
   ];

   export const MESSAGE_ALLOWED_ATTRIBUTES = ["href", "src", "alt"];
   export const MESSAGE_ALLOWED_URI_PATTERN = /^https?:/i;
   export const LINK_TAG_NAME = "A";
   export const LINK_TARGET = "_blank";
   export const LINK_REL = "noopener noreferrer";
   ```

2. `MessageContent.utils.ts`:

   ```ts
   import DOMPurify from "dompurify";

   // A dedicated instance, so the link hook below does not leak into other
   // DOMPurify users.
   const messagePurifier = DOMPurify(window);

   messagePurifier.addHook("afterSanitizeAttributes", (node) => {
     if (node.tagName === LINK_TAG_NAME) {
       node.setAttribute("target", LINK_TARGET);
       node.setAttribute("rel", LINK_REL);
     }
   });

   export const sanitizeMessageContent = (content: string) => {
     return messagePurifier.sanitize(content, {
       ALLOWED_TAGS: MESSAGE_ALLOWED_TAGS,
       ALLOWED_ATTR: MESSAGE_ALLOWED_ATTRIBUTES,
       ALLOWED_URI_REGEXP: MESSAGE_ALLOWED_URI_PATTERN,
     });
   };
   ```

3. `MessageContent.tsx`:

   ```tsx
   import { Box } from "@/components/lib";
   import chatPageViewStyles from "../../../../ChatPageView.module.css";

   type MessageContentProps = {
     content: string;
   };

   export const MessageContent = ({ content }: MessageContentProps) => {
     return (
       <Box
         data-testid={MessageContentTestId.container}
         className={chatPageViewStyles.richText}
         dangerouslySetInnerHTML={{ __html: sanitizeMessageContent(content) }}
       />
     );
   };
   ```

4. `index.ts`: `export * from "./MessageContent";`.

**Verification MANUAL:** `npm run ts:check` passes. The component is rendered from Step 13 on.

---

### Step 13: Create the message item component

**New files:**

- `CHAT/components/MessageFeed/components/MessageItem/MessageItem.tsx`
- `CHAT/components/MessageFeed/components/MessageItem/MessageItem.constants.ts`
- `CHAT/components/MessageFeed/components/MessageItem/MessageItem.utils.ts`
- `CHAT/components/MessageFeed/components/MessageItem/index.ts`

**Covers:** AC5, AC6, AC7, AC8

**Context:** The bubble only lays out its three parts. Right alignment is done by the row in `MessageList`, so the item stays reusable. Tags reuse the read-only `TagChip` (Step 10) in a wrapping row. The composer's `TagRow` uses `overflowX="auto"`, which AC7 forbids for the feed.

**Changes:**

1. `MessageItem.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("MessageItem__");

   export const MessageItemTestId = {
     container: createTestId("container"),
     sentAt: createTestId("sent-at"),
     tags: createTestId("tags"),
   } as const;

   export const MESSAGE_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
     dateStyle: "medium",
     timeStyle: "short",
   };
   ```

2. `MessageItem.utils.ts`:

   ```ts
   const messageDateFormatter = new Intl.DateTimeFormat(
     undefined,
     MESSAGE_DATE_FORMAT_OPTIONS
   );

   export const formatMessageDate = (createdAt: string) => {
     return messageDateFormatter.format(new Date(createdAt));
   };
   ```

3. `MessageItem.tsx`:

   ```tsx
   type MessageItemProps = {
     message: ChatMessage;
   };

   export const MessageItem = ({ message }: MessageItemProps) => {
     return (
       <Box
         data-testid={MessageItemTestId.container}
         display="flex"
         flexDirection="column"
         gap="2"
         maxWidth="80%"
         minWidth="0"
         p="3"
         borderRadius="lg"
         borderWidth="1px"
         borderColor="border"
         backgroundColor="bg.muted"
       >
         <Text
           data-testid={MessageItemTestId.sentAt}
           fontSize="xs"
           color="fg.muted"
         >
           {formatMessageDate(message.createdAt)}
         </Text>

         {message.tags.length ? (
           <Box
             data-testid={MessageItemTestId.tags}
             display="flex"
             flexWrap="wrap"
             gap="1.5"
           >
             {message.tags.map((tag) => {
               return <TagChip key={tag} tag={tag} />;
             })}
           </Box>
         ) : null}

         <MessageContent content={message.content} />
       </Box>
     );
   };
   ```

   Import `TagChip` from `"../../../TagChip"` and `MessageContent` from `"../MessageContent"`.

4. `index.ts`: `export * from "./MessageItem";`.

**Verification MANUAL:** `npm run ts:check` passes. The component is rendered from Step 14 on.

---

### Step 14: Create the virtualized message list

**New files:**

- `CHAT/components/MessageFeed/components/MessageList/MessageList.tsx`
- `CHAT/components/MessageFeed/components/MessageList/MessageList.constants.ts`
- `CHAT/components/MessageFeed/components/MessageList/index.ts`

**Covers:** AC4, AC5, AC16

**Context:** Rows have variable height (images, lists, wrapped chips), so each rendered row is measured with `virtualizer.measureElement` and keyed by message id (`getItemKey`). Prepending a new message then keeps the measured sizes of existing rows. The rows stay in normal flow inside one window translated to the first visible row's offset (TanStack's "dynamic" example). Spacing comes from row padding, so it is included in the measured height. The list is the scroll element and fills the remaining height of the feed. It has `pr="4"` (16px) so messages do not touch the scrollbar.

**Changes:**

1. `MessageList.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("MessageList__");

   export const MessageListTestId = {
     container: createTestId("container"),
     row: createTestId("row"),
   } as const;

   export const MESSAGE_ESTIMATED_HEIGHT = 96;
   export const MESSAGE_LIST_OVERSCAN = 5;
   ```

2. `MessageList.tsx`:

   ```tsx
   type MessageListProps = {
     messages: ChatMessage[];
   };

   export const MessageList = ({ messages }: MessageListProps) => {
     "use no memo"; // useVirtualizer returns a mutable instance the compiler cannot memoize.

     const scrollElementRef = useRef<HTMLDivElement>(null);

     const virtualizer = useVirtualizer({
       count: messages.length,
       getScrollElement: () => {
         return scrollElementRef.current;
       },
       estimateSize: () => {
         return MESSAGE_ESTIMATED_HEIGHT;
       },
       getItemKey: (index) => {
         return messages[index].id;
       },
       overscan: MESSAGE_LIST_OVERSCAN,
     });

     const virtualItems = virtualizer.getVirtualItems();
     const firstItemStart = virtualItems[0]?.start ?? 0;

     return (
       <Box
         ref={scrollElementRef}
         data-testid={MessageListTestId.container}
         flexGrow={1}
         minHeight="0"
         overflowY="auto"
         pr="4"
       >
         <Box
           position="relative"
           width="100%"
           height={`${virtualizer.getTotalSize()}px`}
         >
           <Box
             position="absolute"
             top="0"
             left="0"
             width="100%"
             transform={`translateY(${firstItemStart}px)`}
           >
             {virtualItems.map((virtualItem) => {
               return (
                 <Box
                   key={virtualItem.key}
                   ref={virtualizer.measureElement}
                   data-index={virtualItem.index}
                   data-testid={MessageListTestId.row}
                   display="flex"
                   justifyContent="flex-end"
                   pb="3"
                 >
                   <MessageItem message={messages[virtualItem.index]} />
                 </Box>
               );
             })}
           </Box>
         </Box>
       </Box>
     );
   };
   ```

   Import `useVirtualizer` from `@tanstack/react-virtual` and `MessageItem` from `"../MessageItem"`.

3. `index.ts`: `export * from "./MessageList";`.

**Verification MANUAL:** `npm run ts:check` passes, and `npm run lint` reports no errors for `MessageList.tsx`. If it shows a `react-hooks/incompatible-library` warning, that is expected and is handled by the directive.

---

### Step 15: Create the load error and the feed container

**New files:**

- `CHAT/components/MessageFeed/components/MessagesLoadError/MessagesLoadError.tsx`
- `CHAT/components/MessageFeed/components/MessagesLoadError/MessagesLoadError.constants.ts`
- `CHAT/components/MessageFeed/components/MessagesLoadError/index.ts`
- `CHAT/components/MessageFeed/components/index.ts`
- `CHAT/components/MessageFeed/MessageFeed.tsx`
- `CHAT/components/MessageFeed/MessageFeed.constants.ts`
- `CHAT/components/MessageFeed/index.ts`

**File:**
`CHAT/components/index.ts`

**Covers:** AC1, AC2, AC17, AC18, AC19

**Context:** The loading overlay reuses `FullScreenLoader`, the same way `ThreadPageLayout.tsx:148` does. The loader is fixed, full-screen and opaque, so it blocks the whole application (AC17). It is rendered next to the feed content, not instead of the composer, so the composer stays mounted and keeps its state through failures and retries (AC20). `MessagesLoadError` follows `ThreadsLoadError.tsx`, adding a "Try again" button. The empty placeholder reuses `ThreadColumnMessage`, the muted text that the other thread columns use for empty states.

**Changes:**

1. `MessagesLoadError.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("MessagesLoadError__");

   export const MessagesLoadErrorTestId = {
     container: createTestId("container"),
     message: createTestId("message"),
   } as const;

   export const MESSAGES_LOAD_ERROR_MESSAGE = "Couldn't load the messages.";
   export const TRY_AGAIN_LABEL = "Try again";
   ```

2. `MessagesLoadError.tsx`: a `Box` (`p="4"`, `borderRadius="md"`, `borderWidth="1px"`, `borderColor="red"`, `display="flex"`, `flexDirection="column"`, `alignItems="flex-start"`, `gap="3"`) containing `<Text data-testid={MessagesLoadErrorTestId.message} color="fg">{MESSAGES_LOAD_ERROR_MESSAGE}</Text>` and `<Button size="sm" variant="outline" onClick={onRetry}>{TRY_AGAIN_LABEL}</Button>`. Props: `onRetry: () => void`.
3. `components/index.ts`:

   ```ts
   export * from "./MessageContent";
   export * from "./MessageItem";
   export * from "./MessageList";
   export * from "./MessagesLoadError";
   ```

4. `MessageFeed.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("MessageFeed__");

   export const MessageFeedTestId = {
     container: createTestId("container"),
   } as const;

   export const EMPTY_FEED_MESSAGE =
     "No messages yet. Write your first message above.";
   export const LOADING_MESSAGES_LABEL = "Loading messages";
   ```

5. `MessageFeed.tsx`:

   ```tsx
   type MessageFeedProps = {
     messages: ChatMessage[];
     messagesStatus: MessagesStatusType;
     onRetry: () => void;
   };

   export const MessageFeed = ({
     messages,
     messagesStatus,
     onRetry,
   }: MessageFeedProps) => {
     const isLoaded = messagesStatus === MessagesStatus.Loaded;

     return (
       <Box
         data-testid={MessageFeedTestId.container}
         display="flex"
         flexDirection="column"
         flexGrow={1}
         minHeight="0"
       >
         {messagesStatus === MessagesStatus.Error ? (
           <MessagesLoadError onRetry={onRetry} />
         ) : null}

         {isLoaded && messages.length ? (
           <MessageList messages={messages} />
         ) : null}

         {isLoaded && !messages.length ? (
           <ThreadColumnMessage message={EMPTY_FEED_MESSAGE} />
         ) : null}

         <FullScreenLoader
           shown={messagesStatus === MessagesStatus.Loading}
           label={LOADING_MESSAGES_LABEL}
         />
       </Box>
     );
   };
   ```

   Imports: `Box` and `FullScreenLoader` from `@/components/lib`; `MessagesStatus` from `"../../ChatPageView.constants"`; `MessagesStatusType` from `"../../ChatPageView.types"`; `ThreadColumnMessage` from `@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumnMessage`.

6. `MessageFeed/index.ts`: `export * from "./MessageFeed";`.
7. Add `export * from "./MessageFeed";` to `CHAT/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes outside `__tests__`.

---

### Step 16: Wire the feed into ChatPageView

**File:**
`CHAT/ChatPageView.tsx`
`CHAT/ChatPageView.utils.ts` (deleted)
`CHAT/__tests__/ChatPageView.utils.test.ts` (deleted)

**Covers:** AC1, AC3, AC17, AC18, AC19, AC20, AC21, AC22, AC23

**Context:** The console-log placeholder from the composer story is replaced by real saving. Its util and the util's test are deleted together, because the unit no longer exists. Chakra spacing token `4` is 16px (AC1). The view grows to fill the column, and only the feed list scrolls.

**Changes:**

1. Delete `CHAT/ChatPageView.utils.ts` and `CHAT/__tests__/ChatPageView.utils.test.ts`.
2. Rewrite `ChatPageView.tsx`:

   ```tsx
   type ChatPageViewProps = {
     page: SectionPage;
   };

   export const ChatPageView = ({ page }: ChatPageViewProps) => {
     const { messages, messagesStatus, retryLoadingMessages, sendMessage } =
       usePageMessages(page);

     return (
       <Box
         data-testid={ChatPageViewTestId.container}
         display="flex"
         flexDirection="column"
         gap="4"
         flexGrow={1}
         minHeight="0"
       >
         <MessageComposer onSend={sendMessage} />

         <MessageFeed
           messages={messages}
           messagesStatus={messagesStatus}
           onRetry={retryLoadingMessages}
         />
       </Box>
     );
   };
   ```

   Import `MessageComposer` and `MessageFeed` from `"./components"`, `usePageMessages` from `"./ChatPageView.hooks"`, and `SectionPage` from `@/types`.

**Verification MANUAL:** `npm run ts:check` reports errors only in `PageView.tsx` (fixed in Step 17) and `__tests__` files.

---

### Step 17: Pass the selected page to ChatPageView

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/PageView.tsx`

**Covers:** AC3, AC9, AC10, AC11

**Changes:**

1. Change `<ChatPageView key={selectedPage.id} />` to `<ChatPageView key={selectedPage.id} page={selectedPage} />`.

**Verification MANUAL:** In the dev server, open a Chat page:
- The empty placeholder appears 16px under the composer.
- Sending text with tags, bold, a list, a link and an image adds a right-aligned message at the top, and the composer clears with no toast.
- Messages are newest first and survive a reload.
- Switching pages shows only that page's messages.
- Deleting the page and re-creating one with the same name shows an empty feed.
- Long tag lists wrap, and a single very long tag (80 characters, no spaces) wraps inside the bubble without a horizontal scrollbar in the feed.
- Links open in a new tab.
- Setting `localStorage.messages` to invalid JSON and reopening the page shows the error with "Try again". Fixing the value and clicking "Try again" loads the messages, and composer text typed before the retry is kept.
- In DevTools, `localStorage.setItem` patched to throw makes sending show "Message could not be sent. Please try again." with the composer content kept.
- Setting one stored message's `createdAt` to `"garbage"` shows the load error with "Try again" instead of a blank page.
- With `localStorage.messages` set to `{"a":1}`, deleting a page still removes it and decrements the thread's page count.
- `npm run ts:check` reports errors only in `__tests__` files.

## Phase 2: Unit tests

---

### Step 1: Add shared message, virtualizer and send fixtures

**New files:**

- `src/__test-fixtures__/messages/messages.ts`
- `src/__test-fixtures__/messages/messages.storage.ts`
- `src/__test-fixtures__/messages/messages.queries.ts`
- `src/__test-fixtures__/messages/index.ts`
- `src/__test-fixtures__/virtualizer/virtualizer.ts`
- `src/__test-fixtures__/virtualizer/index.ts`

**Files:**
`src/__test-fixtures__/index.ts`
`src/__test-fixtures__/threads/threadsService.ts`
`src/__test-fixtures__/composer/composer.interactions.ts`
`src/__test-fixtures__/composer/composer.editor.ts`

**Covers:** AC3–AC23 (shared helpers)

**Context:** These helpers are needed by more than one test file (`unit-tests.md` rules 5 and 6). They follow the existing `pages/` fixtures. Test files import them from `@/__test-fixtures__` and do not declare local copies of the expected message lists, the viewport and row sizes, the error strings, the message-content reader or the try-again query.

**Changes:**

1. `messages.ts`:
   - `chatMessageFixtures: ChatMessage[]`, stored newest first:
     - two messages on `sectionPageFixtures[0]`: one with two tags and bold text, one with no tags;
     - one message on `sectionPageFixtures[1]`;
     - one on `sectionPageFixtures[2]` (another section);
     - one on `sectionPageFixtures[3]` (another thread).
     - Each uses that page's `threadId`/`sectionId` and a distinct ISO `createdAt`.
   - derived from `chatMessageFixtures` with `filter` on ids, not by index, so a changed fixture cannot break the copies:
     - `firstPageMessageFixtures`: the messages of `sectionPageFixtures[0]`;
     - `messagesAfterPageDelete`, `messagesAfterSectionDelete`, `messagesAfterThreadDelete`: the messages left after deleting that page, its section or its thread.
   - `buildNewMessage(overrides: Partial<NewChatMessage> = {})`, defaulting to page 1's ids, `content: "<p>Hello</p>"`, `tags: []`.
   - `buildPageMessages({ page, count })`: returns `count` valid messages for `page`, newest first, with ids `message-${index}` (used for the 5,000-message test).
2. `messages.storage.ts`: `seedMessages(messages)` and `readStoredMessages()` using `MESSAGES_STORAGE_KEY`, the same as `pages.storage.ts`.
3. `messages.queries.ts`: `getFeedMessages()` returns `screen.getAllByTestId(MessageItemTestId.container)`. `queryFeedMessages()` is the `queryAll` variant.
   - `getFeedMessageContents()` returns the text of every rendered `MessageContentTestId.container`, in DOM order.
   - `getTryAgainButton()` returns the `TRY_AGAIN_LABEL` button.
4. `virtualizer.ts`: `stubVirtualizerLayout({ viewportHeight = 600, rowHeight = 100 } = {})`. Both values are optional, so tests call `stubVirtualizerLayout()` and do not repeat the numbers. It uses `vi.spyOn` on `HTMLElement.prototype` so that jsdom reports a non-zero size to the virtualizer:
   - the scroll element reports `viewportHeight`;
   - each measured row reports `rowHeight`.
   Before writing it, read `observeElementRect` and `measureElement` in `node_modules/@tanstack/virtual-core/dist/esm/index.js` to confirm which properties the installed version reads (`offsetHeight`/`offsetWidth` or `getBoundingClientRect`). Follow `stubTextOverflow` in `src/components/lib/__test-fixtures__/layout/layout.ts` for the spy style.
5. `threadsService.ts`: add `getPageMessages` and `addPageMessage` to `ThreadsServiceOverrides`, `resetThreadsServiceOverrides` and the wrapped service in `createServicesMock`, in the same style as `removeSectionPage`. Also export:
   - `LOAD_MESSAGES_ERROR` and `ADD_MESSAGE_ERROR` strings;
   - `failPageMessagesLoad()` and `failPageMessageAdd()`, which set the matching override to throw those errors.
6. `composer.interactions.ts`: add `sendComposerMessage({ user, text })`, which calls `typeInComposer` and then clicks `getSendButton()`.
7. `composer.editor.ts`: `createTestEditor` records every editor it creates, and `destroyTestEditors()` destroys them all. The three composer tests that use `createTestEditor` (`MessageComposer.extensions.test.ts`, `.commands.test.ts`, `.utils.test.ts`) call it in `afterEach`. Without it, ProseMirror's observer timer fires after jsdom is torn down and the full run reports `document is not defined` as an unhandled error.
8. Export `./messages` and `./virtualizer` from `src/__test-fixtures__/index.ts`.

**Verification:** `npm run ts:check` reports no errors in `src/__test-fixtures__/`.

---

### Step 2: Test the page messages service utils

**New files:**

- `src/services/usePageMessagesService/__tests__/usePageMessagesService.utils.test.ts`

**Covers:** AC3, AC9

**Changes:**

1. Follow `src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`.
2. `buildMessage`:
   - returns the new message fields;
   - returns a `crypto.randomUUID()` id (spy on it);
   - sets `createdAt` to the current ISO time (fake timers);
   - copies the `tags` array instead of keeping the same reference.
3. `isChatMessageList`:
   - `true` for `chatMessageFixtures` and `[]`;
   - `false` for a non-array;
   - `false` for `null` items;
   - `false` for a message missing each required field (`it.each`);
   - `false` for non-string tags;
   - `false` for a message whose `createdAt` is not a valid date (`"not-a-date"`).

**Verification:** `npx vitest run src/services/usePageMessagesService/__tests__/usePageMessagesService.utils.test.ts` passes.

---

### Step 3: Test the page messages service hook

**New files:**

- `src/services/usePageMessagesService/__tests__/usePageMessagesService.test.ts`

**Covers:** AC3, AC4, AC9, AC10, AC11

**Changes:**

1. `setupHook()` renders `usePageMessagesService` with `renderHook`. Seed storage with `seedMessages`.
2. Scenarios:
   - `getPageMessages` returns only the page's messages, newest first;
   - it returns `[]` when storage is empty;
   - it rejects with `INVALID_MESSAGES_DATA_ERROR` for invalid data;
   - it rejects for `MALFORMED_JSON`;
   - `createMessage` stores the new message first and returns it (`readStoredMessages`);
   - `createMessage` rejects when `localStorage.setItem` throws;
   - `deletePageMessages`, `deleteSectionMessages` and `deleteThreadMessages` each remove only the matching messages (`it.each`);
   - a delete with no match leaves storage untouched (spy on `setItem`, expect no call).
3. Assert awaited results against constants with `toStrictEqual` (`unit-tests.md` rules 11 and 17). The expected lists are `firstPageMessageFixtures` and the `messagesAfter*Delete` fixtures.

**Verification:** `npx vitest run src/services/usePageMessagesService` passes.

---

### Step 4: Test message routing and cascade deletes in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC3, AC11

**Changes:**

1. Seed messages with `seedMessages(chatMessageFixtures)` in the new tests. Compare the stored messages with `firstPageMessageFixtures` and the `messagesAfter*Delete` fixtures.
2. Scenarios:
   - `getPageMessages` returns the page's messages;
   - `addPageMessage` stores and returns the message for an existing page;
   - `addPageMessage` rejects with `PAGE_NOT_FOUND_ERROR` for an unknown page and stores nothing;
   - `removeSectionPage` deletes the page's messages and keeps the others;
   - `removeSectionPage` deletes the messages even when the page was already deleted;
   - `removeThreadSection` deletes the section's messages;
   - `deleteThread` deletes the thread's messages;
   - with invalid `messages` data seeded, `removeSectionPage` rejects but the page is already deleted and the thread's page count is already decremented;
   - the same for `removeThreadSection` (section deleted, counters updated) and `deleteThread` (thread removed);
   - after `removeSectionPage` on the same hook instance, `addPageMessage` for another page does not bring back the deleted messages (regression test for the shared-cache decision).

**Verification:** `npx vitest run src/services/useThreadsService` passes.

---

### Step 5: Test the loader's message actions

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**Covers:** AC3, AC10

**Changes:**

1. Add a `describe` for the message actions of `useThreadState`:
   - `getPageMessages` resolves the seeded page's messages;
   - `addPageMessage` resolves the created message and stores it.
2. Reuse the file's existing `setupHook` and services mock.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader` passes.

---

### Step 6: Update the composer tests for the async send

**Files:**
`CHAT/components/MessageComposer/__tests__/MessageComposer.test.tsx`
`CHAT/components/MessageComposer/__tests__/MessageComposer.hooks.test.ts`
`CHAT/components/MessageComposer/__tests__/MessageComposer.commands.test.ts` (only if it builds a context with `send`)

**Covers:** AC22, AC23

**Changes:**

1. In `setup()` / `setupHook()`, the `onSend` mock resolves `true` by default (`vi.fn().mockResolvedValue(true)`). Add a `setup` option `{ isSent = true }`, so only the failure tests pass `false` (`unit-tests.md` rule 14).
2. Keep all existing send scenarios passing. Where they assert the cleared editor or tags, wait for the cleared state with `findBy*`, because clearing now happens after the awaited `onSend`.
3. New scenarios:
   - when `onSend` resolves `false`, the editor keeps its text and the tags stay;
   - while `onSend` is pending (`createDeferred`), the editor is not cleared yet, and it clears once the promise resolves `true`.
4. In the commands test, make the context's `send` a `vi.fn().mockResolvedValue(undefined)`.

**Verification:** `npx vitest run CHAT/components/MessageComposer` (full path) passes.

---

### Step 7: Test the new Box adapter props

**File:**
`src/components/lib/Box/__tests__/Box.test.tsx`

**Covers:** AC12, AC16

**Changes:**

1. Add scenarios:
   - `dangerouslySetInnerHTML` renders the given HTML;
   - `className` is applied;
   - `data-index` is rendered as an attribute.

**Verification:** `npx vitest run src/components/lib/Box` passes.

---

### Step 8: Test the read-only TagChip

**File:**
`CHAT/components/TagChip/__tests__/TagChip.test.tsx`

**Covers:** AC6

**Changes:**

1. Give `setup` an `onRemove` option that is passed by default, so the existing tests are unchanged.
2. Add a test: without `onRemove`, the tag name is shown and there is no remove button (`queryByRole("button")` with `.not.toBeInTheDocument()`).
3. Add a test: a chip without `onRemove` can shrink and wrap (`flexShrink` is `1` and `white-space` is `normal` when jsdom resolves the Chakra styles; otherwise leave it to the manual check in Phase 1, Step 17). Keep the existing assertions that a removable chip does not wrap.
4. Run `TagRow.test.tsx` as well, to confirm the moved import.

**Verification:** `npx vitest run CHAT/components/TagChip CHAT/components/MessageComposer/components/TagRow` (full paths) passes.

---

### Step 9: Test the page messages hook

**New files:**

- `CHAT/__tests__/ChatPageView.hooks.test.tsx`

**Covers:** AC3, AC17, AC18, AC19, AC21, AC22, AC23

**Changes:**

1. Set up `vi.mock("@/services", ...)` with `createServicesMock`. Reset the overrides in `beforeEach`.
2. Use `failPageMessagesLoad()` and `failPageMessageAdd()` for the rejecting services. `setupHook()` renders `usePageMessages(sectionPageFixtures[0])` with a `ThreadPageLoader` wrapper, after seeding threads, sections, pages and messages.
3. Scenarios:
   - starts in `Loading` and then becomes `Loaded` with the page's messages;
   - becomes `Error` when `getPageMessages` rejects;
   - `retryLoadingMessages` goes back to `Loading` and loads the messages after a fixed override;
   - `sendMessage` resolves `true`, prepends the created message and shows no notification;
   - `sendMessage` resolves `false` when `addPageMessage` rejects, keeps `messages` unchanged and shows `SEND_MESSAGE_ERROR_MESSAGE` (`findByText`).

**Verification:** `npx vitest run CHAT/__tests__/ChatPageView.hooks.test.tsx` (full path) passes.

---

### Step 10: Test the message content sanitizer and component

**New files:**

- `CHAT/components/MessageFeed/components/MessageContent/__tests__/MessageContent.utils.test.ts`
- `CHAT/components/MessageFeed/components/MessageContent/__tests__/MessageContent.test.tsx`

**Covers:** AC12, AC13, AC14, AC15

**Changes:**

1. Utils (`it.each` tables, expected strings in constants):
   - **Kept:** `<strong>`, `<em>`, `<ul>/<ol>/<li>`, `<br>`, multiple paragraphs, an `https` link, a `data:image/png` image with `alt`, and an `https` image.
   - **Removed:**
     - `<script>` with its contents, while the surrounding text stays;
     - `onclick`/`onerror` attributes;
     - `javascript:` in `href` and in `src`;
     - a `data:` link `href`.
   - **Stripped, text kept:** `<s>`, `<u>`, `<pre><code>`, `<h1>` and `style` attributes.
   - **Links:** every link gets `target="_blank"` and `rel="noopener noreferrer"`, including a link that already had another `target`.
   - The default DOMPurify instance is not affected: `DOMPurify.sanitize('<a href="https://x.test">x</a>')` gets no `target`.
2. Component:
   - renders the sanitized HTML (a bold element is found inside `MessageContentTestId.container`);
   - an injected `<img src=x onerror>` does not call a `window` spy;
   - a rendered link has `target="_blank"`.

**Verification:** `npx vitest run CHAT/components/MessageFeed/components/MessageContent` (full path) passes.

---

### Step 11: Test the message item

**New files:**

- `CHAT/components/MessageFeed/components/MessageItem/__tests__/MessageItem.utils.test.ts`
- `CHAT/components/MessageFeed/components/MessageItem/__tests__/MessageItem.test.tsx`

**Covers:** AC5, AC6, AC7, AC8

**Changes:**

1. Utils: `formatMessageDate` equals `new Intl.DateTimeFormat(undefined, MESSAGE_DATE_FORMAT_OPTIONS).format(new Date(iso))` for a fixed ISO date.
2. Component (`setup({ message })`):
   - shows the formatted date, the tag chips and the content, in that DOM order (use the existing `isFollowing` fixture);
   - shows no tags block for a message without tags, and the content follows the date;
   - the chips have no remove buttons;
   - the tags container uses wrapping layout: assert that the tags container is not the composer's horizontally scrolling row, by checking `getComputedStyle(tags).flexWrap === "wrap"` if jsdom resolves Chakra styles, otherwise drop this assertion and leave AC7 to the manual check in Phase 1, Step 17.

**Verification:** `npx vitest run CHAT/components/MessageFeed/components/MessageItem` (full path) passes.

---

### Step 12: Test the virtualized message list

**New files:**

- `CHAT/components/MessageFeed/components/MessageList/__tests__/MessageList.test.tsx`

**Covers:** AC4, AC5, AC16

**Changes:**

1. `beforeEach`: `stubVirtualizerLayout()`. `afterEach`: `vi.restoreAllMocks()`.
2. Scenarios:
   - renders the given messages in the given (newest-first) order;
   - with `buildPageMessages({ count: 5000 })`, renders far fewer rows than 5,000 (for example fewer than 30), and the first rendered row is the newest message;
   - after scrolling the container (`fireEvent.scroll` with a stubbed `scrollTop`), later messages are rendered and the first ones are not;
   - each row carries `data-index`.

**Verification:** `npx vitest run CHAT/components/MessageFeed/components/MessageList` (full path) passes.

---

### Step 13: Test the load error and the feed container

**New files:**

- `CHAT/components/MessageFeed/components/MessagesLoadError/__tests__/MessagesLoadError.test.tsx`
- `CHAT/components/MessageFeed/__tests__/MessageFeed.test.tsx`

**Covers:** AC2, AC17, AC18, AC19

**Changes:**

1. `MessagesLoadError`:
   - shows `MESSAGES_LOAD_ERROR_MESSAGE` and a `TRY_AGAIN_LABEL` button;
   - clicking it calls `onRetry` once (use the shared `getTryAgainButton()`).
2. `MessageFeed` (`setup({ messages, messagesStatus })`, `stubVirtualizerLayout` for the list case):
   - `Loading` shows the `status` role named `LOADING_MESSAGES_LABEL` and no placeholder, list or error;
   - `Loaded` with no messages shows `EMPTY_FEED_MESSAGE`;
   - `Loaded` with messages shows the list;
   - `Error` shows the error and no loader;
   - clicking "Try again" calls `onRetry`.

**Verification:** `npx vitest run CHAT/components/MessageFeed` (full path) passes.

---

### Step 14: Rewrite the ChatPageView tests as integration tests

**File:**
`CHAT/__tests__/ChatPageView.test.tsx`

**Covers:** AC1, AC3, AC4, AC17, AC18, AC19, AC20, AC21, AC22, AC23

**Changes:**

1. Remove the console-log tests and the `console.log` spy.
2. Mock `@/services` with `createServicesMock`. In `setup()`, seed threads, sections, pages (and messages when needed), and render `<ThreadPageLoader threadId={...}><ChatPageView page={sectionPageFixtures[0]} /></ThreadPageLoader>`. Call `stubVirtualizerLayout()` in `beforeEach`. Use `failPageMessagesLoad()` and `failPageMessageAdd()` for the failing services, and `firstPageMessageFixtures` for the expected feed.
3. Scenarios:
   - the feed container follows the composer container (`isFollowing`) (AC1; the 16px gap is checked manually);
   - an empty page shows the placeholder;
   - `sendComposerMessage` adds the message at the top of the feed above older ones, clears the editor and shows no notification (AC3, AC4, AC23);
   - while `getPageMessages` is pending (`createDeferred` override), the loader is shown; it is removed once the promise resolves (`waitForElementToBeRemoved`) (AC17);
   - when loading rejects:
     - the loader is removed and the error with "Try again" is shown;
     - clicking "Try again" shows the loader again, and after a successful load the messages are shown (AC18, AC19);
   - type text and add a tag after a failed load, then retry into another failure: the composer still has the text and the tag chip (AC20);
   - when `addPageMessage` rejects:
     - no new message appears;
     - the notification `SEND_MESSAGE_ERROR_MESSAGE` is shown;
     - the editor still holds the text and the tag (AC21, AC22).

**Verification:** `npx vitest run CHAT/__tests__/ChatPageView.test.tsx` (full path) passes.

---

### Step 15: Cover page switching, deletion and reload at the column and page level

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/__tests__/PageView.test.tsx`
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC9, AC10, AC11

**Changes:**

1. `PageView.test.tsx`: seed `chatMessageFixtures`, call `stubVirtualizerLayout()` in `beforeEach` and `vi.restoreAllMocks()` in `afterEach`, so the prototype stubs do not outlive a test. Add:
   - selecting page 1 shows only page 1's messages; switching to page 2 shows only page 2's message (AC10);
   - a message sent on page 1 is still shown, in the same order, after unmounting and rendering the tree again (AC9: the reload is simulated by a fresh render over the same `localStorage`).
2. `ThreadPage.test.tsx`: add a test where deleting the selected page through the page card menu removes its messages from storage (`readStoredMessages`), while messages of other pages remain (AC11).
3. Run `ThreadPage.test.tsx`, `ThreadColumns.test.tsx` and `ThreadPageLayout.test.tsx` in full. Fix any query that now matches both loaders by querying the `status` role with its `name` (`LOADING_THREAD_LABEL` vs `LOADING_MESSAGES_LABEL`).

**Verification:** `npm run test` passes in full, and `npm run test:coverage` stays at or above the 90% thresholds.

## Phase 3: Documentation

---

### Step 1: Document the message feed libraries and data flow in CLAUDE.md

**File:**
`CLAUDE.md`

**Covers:** AC3, AC12–AC16

**Context:** The developer's memory says CLAUDE.md holds examples and conventions, not inventories of new methods. Only the non-obvious decisions are documented.

**Changes:**

1. Under **Third-party Libraries**, after the Tiptap paragraph, add a short **DOMPurify and TanStack Virtual** paragraph covering:
   - the chat feed (`MessageFeed`, next to `MessageComposer` under `ChatPageView`) renders stored message HTML only through `sanitizeMessageContent`;
   - it uses a dedicated DOMPurify instance with an allowlist (bold, italic, lists, line breaks, links, images; http/https links, data-URL images), and forces links to open in a new tab;
   - `MessageList` virtualizes with `useVirtualizer`, measures rows dynamically and opts out of the React Compiler with `"use no memo"`;
   - tests stub layout with `stubVirtualizerLayout` from `@/__test-fixtures__`.
2. In the Tiptap paragraph, add one sentence:
   - `MessageComposer`'s `onSend` returns `Promise<boolean>`;
   - the composer clears only when it resolves `true`;
   - the caller shows the error notification.

**Verification MANUAL:** Reread the Third-party Libraries section. It explains why sanitizing and virtualization are done this way, names the fixtures, and does not list service methods.

---

### Step 2: Document where message reads and writes go

**File:**
`CLAUDE.md`

**Covers:** AC9, AC10, AC11

**Changes:**

1. In the **Folder structure** → `src/services/` bullet, after the `removeSectionPage` sentence, add one sentence:
   - messages are stored under the `messages` key by `usePageMessagesService`;
   - they are read and written only through `useThreadsService`, so a thread page shares one cache with the cascade deletes for pages, sections and threads.

**Verification MANUAL:** The `src/services/` bullet explains the single-instance rule in one sentence, and nothing else in CLAUDE.md is duplicated.
