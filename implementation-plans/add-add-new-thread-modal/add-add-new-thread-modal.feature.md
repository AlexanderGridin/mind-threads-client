# Add a "Add new thread" modal

## Implementation Steps

---

### Step 1: Add the `ThreadFormValue` type and default form value

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/AddNewThreadModal.types.ts`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/AddNewThreadModal.constants.ts`

**Context:**
`ThreadFormValue` should reuse the existing `MindThread` type (`src/types/MindThread.ts`) rather than duplicating field definitions, since it only needs the two fields the form edits.

**Changes:**

1. In `AddNewThreadModal.types.ts`, define:
   ```ts
   import type { MindThread } from "@/types";

   export type ThreadFormValue = Pick<MindThread, "title" | "color">;
   ```
2. In `AddNewThreadModal.constants.ts`, define the test ids and the default form value, reusing the existing Nord Aurora swatches as the default color:
   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";
   import { NORD_AURORA_SWATCHES } from "@/components/lib/ColorPicker/ColorPicker.constants";
   import type { ThreadFormValue } from "./AddNewThreadModal.types";

   const createTestId = initTestIdCreator("AddNewThreadModal__");

   export const AddNewThreadModalTestId = {
     container: createTestId("container"),
   } as const;

   export const ADD_NEW_THREAD_MODAL_TITLE = "Add new thread";

   export const DEFAULT_THREAD_FORM_VALUE: ThreadFormValue = {
     title: "",
     color: NORD_AURORA_SWATCHES[0],
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 2: Implement the `ThreadForm` presentational component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/ThreadForm/ThreadForm.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/ThreadForm/ThreadForm.constants.ts`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/ThreadForm/index.ts`

**Context:**
Follows the same controlled-component pattern as `Input.tsx` and `ColorPicker.tsx` — a single `value`/`onChange` pair, with `onChange` patching the relevant field. Layout follows the `VStack` usage pattern already used in the codebase (see `AppLogo.tsx` for `HStack` usage as reference).

**Changes:**

1. In `ThreadForm.constants.ts`:
   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("ThreadForm__");

   export const ThreadFormTestId = {
     titleInput: createTestId("title-input"),
   } as const;

   export const THREAD_NAME_PLACEHOLDER = "Thread name";
   export const THREAD_COLOR_LABEL = "Color";
   ```
2. In `ThreadForm.tsx`, define `ThreadFormProps` inline and render the two fields:
   ```tsx
   import { VStack, Input, ColorPicker } from "@/components/lib";
   import type { ThreadFormValue } from "../../AddNewThreadModal.types";
   import {
     ThreadFormTestId,
     THREAD_NAME_PLACEHOLDER,
     THREAD_COLOR_LABEL,
   } from "./ThreadForm.constants";

   export type ThreadFormProps = {
     value: ThreadFormValue;
     onChange: (value: ThreadFormValue) => void;
   };

   export const ThreadForm = ({ value, onChange }: ThreadFormProps) => {
     const handleTitleChange = (title: string) => {
       onChange({ ...value, title });
     };

     const handleColorChange = (color: string) => {
       onChange({ ...value, color });
     };

     return (
       <VStack gap="4" alignItems="flex-start">
         <Input
           data-testid={ThreadFormTestId.titleInput}
           value={value.title}
           onChange={handleTitleChange}
           placeholder={THREAD_NAME_PLACEHOLDER}
         />
         <ColorPicker
           label={THREAD_COLOR_LABEL}
           value={value.color}
           onChange={handleColorChange}
         />
       </VStack>
     );
   };
   ```
3. In `index.ts`: `export * from "./ThreadForm";`

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 3: Add unit tests for `ThreadForm`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/ThreadForm/__tests__/ThreadForm.test.tsx`

**Context:**
Follows the `setup()` pattern from `Input/__tests__/Input.test.tsx`, using `renderWithUIProvider` from `@/components/lib`. The color picker trigger is queried via `ColorPickerTestId` (imported directly from `@/components/lib/ColorPicker/ColorPicker.constants`, following the deep-import pattern already used in `DashboardHeader.test.tsx` for `ColorModeButtonTestId`).

**Changes:**

1. Write a `setup()` helper accepting `Partial<ThreadFormProps>` with defaults `value: { title: "", color: "#bf616a" }` and `onChange: vi.fn()`.
2. Test cases:
   - renders the title input with the given value (`screen.getByTestId(ThreadFormTestId.titleInput)` has the expected value).
   - renders the color picker trigger (`screen.getByTestId(ColorPickerTestId.trigger)`).
   - typing in the title input calls `onChange` with the updated title, preserving the existing color.

**Verification MANUAL:** Run `npm run test -- ThreadForm` and confirm all tests pass.

---

### Step 4: Implement the `AddNewThreadModalActions` presentational component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/AddNewThreadModalActions/AddNewThreadModalActions.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/AddNewThreadModalActions/index.ts`

**Context:**
The `Button` adapter (`src/components/lib/Button/Button.tsx`) does not accept a `data-testid` prop, so — consistent with `Dialog.test.tsx`, which queries its footer actions by accessible role/name — these buttons are queried by role and accessible name ("Add" / "Cancel") rather than test id.

**Changes:**

1. In `AddNewThreadModalActions.tsx`, define `AddNewThreadModalActionsProps` and render two `Button`s inside an `HStack`:
   ```tsx
   import { HStack, Button } from "@/components/lib";

   export type AddNewThreadModalActionsProps = {
     onAdd: () => void;
     onCancel: () => void;
   };

   export const AddNewThreadModalActions = ({
     onAdd,
     onCancel,
   }: AddNewThreadModalActionsProps) => {
     return (
       <HStack gap="2">
         <Button onClick={onCancel}>Cancel</Button>
         <Button onClick={onAdd}>Add</Button>
       </HStack>
     );
   };
   ```
2. In `index.ts`: `export * from "./AddNewThreadModalActions";`

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 5: Add unit tests for `AddNewThreadModalActions`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/AddNewThreadModalActions/__tests__/AddNewThreadModalActions.test.tsx`

**Changes:**

1. Write a `setup()` helper accepting `Partial<AddNewThreadModalActionsProps>` with `onAdd: vi.fn()` and `onCancel: vi.fn()` defaults.
2. Test cases:
   - clicking the "Add" button (`screen.getByRole("button", { name: "Add" })`) calls `onAdd`.
   - clicking the "Cancel" button (`screen.getByRole("button", { name: "Cancel" })`) calls `onCancel`.

**Verification MANUAL:** Run `npm run test -- AddNewThreadModalActions` and confirm all tests pass.

---

### Step 6: Add the components barrel for `AddNewThreadModal`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/components/index.ts`

**Changes:**

1. ```ts
   export * from "./ThreadForm";
   export * from "./AddNewThreadModalActions";
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 7: Implement the `AddNewThreadModal` container component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/AddNewThreadModal.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/index.ts`

**Context:**
Wires `Dialog` (`src/components/lib/Dialog/Dialog.tsx`) with `ThreadForm` as `content` and `AddNewThreadModalActions` as `actions`. The form value is owned here (not by the parent `AddNewThread`), and is reset to `DEFAULT_THREAD_FORM_VALUE` whenever the modal transitions to `open`, so re-opening the modal always starts from a blank form — since `Dialog` uses `lazyMount`/presence internally but `AddNewThreadModal` itself is always mounted by its parent, the form state would otherwise persist stale values across opens.

**Changes:**

1. Define `AddNewThreadModalProps`:
   ```ts
   export type AddNewThreadModalProps = {
     open: boolean;
     onClose: () => void;
     onSubmit: (value: ThreadFormValue) => void;
   };
   ```
2. Implement the component:
   ```tsx
   import { useEffect, useState } from "react";
   import { Dialog } from "@/components/lib";
   import { ThreadForm, AddNewThreadModalActions } from "./components";
   import {
     ADD_NEW_THREAD_MODAL_TITLE,
     DEFAULT_THREAD_FORM_VALUE,
   } from "./AddNewThreadModal.constants";
   import type { ThreadFormValue } from "./AddNewThreadModal.types";

   export const AddNewThreadModal = ({
     open,
     onClose,
     onSubmit,
   }: AddNewThreadModalProps) => {
     const [formValue, setFormValue] = useState<ThreadFormValue>(
       DEFAULT_THREAD_FORM_VALUE
     );

     useEffect(() => {
       if (open) {
         setFormValue(DEFAULT_THREAD_FORM_VALUE);
       }
     }, [open]);

     const handleAdd = () => {
       onSubmit(formValue);
     };

     return (
       <Dialog
         open={open}
         title={ADD_NEW_THREAD_MODAL_TITLE}
         onClose={onClose}
         content={<ThreadForm value={formValue} onChange={setFormValue} />}
         actions={
           <AddNewThreadModalActions onAdd={handleAdd} onCancel={onClose} />
         }
       />
     );
   };
   ```
3. In `index.ts`: `export * from "./AddNewThreadModal"; export type { AddNewThreadModalProps } from "./AddNewThreadModal"; export type { ThreadFormValue } from "./AddNewThreadModal.types";`

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 8: Add unit tests for `AddNewThreadModal`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/__tests__/AddNewThreadModal.test.tsx`

**Changes:**

1. Write a `setup()` helper accepting `Partial<AddNewThreadModalProps>` with `open: true`, `onClose: vi.fn()`, `onSubmit: vi.fn()` defaults, using `renderWithUIProvider`.
2. Test cases:
   - renders the dialog title ("Add new thread") and the form fields when `open` is `true`.
   - typing a title and clicking "Add" calls `onSubmit` with `{ title: <typed value>, color: <default color> }`.
   - clicking "Cancel" calls `onClose`.
   - re-rendering with `open` toggled from `false` to `true` after typing resets the title input back to empty (verifies the reset-on-open effect).

**Verification MANUAL:** Run `npm run test -- AddNewThreadModal` and confirm all tests pass.

---

### Step 9: Implement the `AddNewThread` feature component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/AddNewThread.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/AddNewThread.constants.ts`
- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/index.ts`

**Context:**
This is the feature module referenced in the draft: it owns the "+ New Thread" trigger button and the open/close state of `AddNewThreadModal`, following the same colocation pattern as `ThreadListModeButton` (button + behavior in one folder). On submit, it logs the form value to the console (per the draft's scope — no store/API integration) and closes the modal, since re-opening always starts from a blank form (Step 7).

**Changes:**

1. In `AddNewThread.constants.ts`:
   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("AddNewThread__");

   export const AddNewThreadTestId = {
     container: createTestId("container"),
   } as const;

   export const ADD_NEW_THREAD_BUTTON_LABEL = "+ New Thread";
   ```
2. In `AddNewThread.tsx`:
   ```tsx
   import { useState } from "react";
   import { Button } from "@/components/lib";
   import { AddNewThreadModal } from "./components";
   import type { ThreadFormValue } from "./components";
   import { ADD_NEW_THREAD_BUTTON_LABEL } from "./AddNewThread.constants";

   export const AddNewThread = () => {
     const [isModalOpen, setIsModalOpen] = useState(false);

     const handleOpenModal = () => {
       setIsModalOpen(true);
     };

     const handleCloseModal = () => {
       setIsModalOpen(false);
     };

     const handleSubmit = (value: ThreadFormValue) => {
       console.log(value);
       setIsModalOpen(false);
     };

     return (
       <>
         <Button onClick={handleOpenModal}>{ADD_NEW_THREAD_BUTTON_LABEL}</Button>
         <AddNewThreadModal
           open={isModalOpen}
           onClose={handleCloseModal}
           onSubmit={handleSubmit}
         />
       </>
     );
   };
   ```
3. In `index.ts`: `export * from "./AddNewThread";`

Note: since `Button` doesn't accept `data-testid`, `AddNewThreadTestId.container` is defined for consistency with other feature folders but the trigger itself is queried by role/name in tests (see Step 10); it is not attached to the `Button`.

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 10: Add unit tests for `AddNewThread`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/__tests__/AddNewThread.test.tsx`

**Changes:**

1. Write a `setup()` helper using `renderWithUIProvider(<AddNewThread />)` and `userEvent.setup()`.
2. Test cases:
   - the "+ New Thread" button is rendered (`screen.getByRole("button", { name: "+ New Thread" })`).
   - clicking the button opens the modal (dialog title "Add new thread" becomes visible).
   - clicking "Cancel" after opening closes the modal.
   - filling the form and clicking "Add" logs the form value via `console.log` (spy with `vi.spyOn(console, "log")`) and closes the modal.

**Verification MANUAL:** Run `npm run test -- AddNewThread` and confirm all tests pass.

---

### Step 11: Add the components barrel entry for `AddNewThread`

**File:**
`src/pages/DashboardPage/components/DashboardHeader/components/index.ts`

**Changes:**

1. Add the new export:
   ```ts
   export * from "./AppLogo";
   export * from "./ThreadListModeButton";
   export * from "./AddNewThread";
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 12: Integrate `AddNewThread` into `DashboardHeader`

**File:**
`src/pages/DashboardPage/components/DashboardHeader/DashboardHeader.tsx`

**Changes:**

1. Import `AddNewThread` from `./components` alongside `AppLogo` and `ThreadListModeButton`.
2. Render it in the right-hand `HStack`, before `ThreadListModeButton`:
   ```tsx
   <HStack gap="2">
     <AddNewThread />
     <ThreadListModeButton />
     <ColorModeButton />
   </HStack>
   ```

**Verification MANUAL:** Run `npm run start`, open the Dashboard page, click "+ New Thread", verify the modal opens with the title/color fields, click "Add" and confirm the form value is printed to the browser console and the modal closes, then reopen and verify "Cancel" closes it and the fields are reset.

---

### Step 13: Update `DashboardHeader` unit tests

**File:**
`src/pages/DashboardPage/components/DashboardHeader/__tests__/DashboardHeader.test.tsx`

**Changes:**

1. Add an assertion in the existing "renders properly" test that the "+ New Thread" button is present:
   ```ts
   expect(
     screen.getByRole("button", { name: "+ New Thread" })
   ).toBeInTheDocument();
   ```

**Verification MANUAL:** Run `npm run test -- DashboardHeader` and confirm all tests pass.

---

### Step 14: Run the full verification suite

**Changes:**

1. No code changes — this is a final check.

**Verification MANUAL:** Run `npm run ts:check`, `npm run lint`, and `npm run test` and confirm all three pass with no errors.
