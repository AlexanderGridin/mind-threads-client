# Add adapters for the Dialog, Input, and ColorPicker components

## Implementation Steps

---

### Step 1: Implement the Input adapter

**New files:**

- `src/components/lib/Input/Input.tsx`
- `src/components/lib/Input/index.ts`

**Context:**
Follows the same wrapper pattern as `src/components/lib/Button/Button.tsx`. The adapter hides the raw DOM change event, exposing a plain string callback like the rest of the library hides DOM/Chakra specifics (see `Button`'s `onClick: () => void`).

**Changes:**

1. In `Input.tsx`, wrap Chakra's `Input`:

```tsx
import { Input as ChakraInput } from "@chakra-ui/react";

export type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "subtle" | "flushed";
  disabled?: boolean;
  name?: string;
  id?: string;
  "data-testid"?: string;
};

export const Input = ({ onChange, ...props }: InputProps) => (
  <ChakraInput
    onChange={(event) => onChange(event.target.value)}
    {...props}
  />
);
```

2. In `index.ts`, re-export: `export { Input, type InputProps } from "./Input";`
3. Add `export { Input, type InputProps } from "./Input";` to `src/components/lib/index.ts`, alongside the other component exports.

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 2: Add unit tests for the Input adapter

**New files:**

- `src/components/lib/Input/__tests__/Input.test.tsx`

**Context:**
Follows the `setup()` + `renderWithUIProvider` convention used in `src/components/lib/Button/__tests__/Button.test.tsx` and `IconButton/__tests__/IconButton.test.tsx`.

**Changes:**

1. Create a `setup()` helper that renders `<Input />` with a `vi.fn()` for `onChange` and returns `{ user }`, following `Button.test.tsx`'s pattern.
2. Add test cases:
   - renders with the given `value`
   - renders `placeholder` when provided
   - calls `onChange` with the typed string when the user types (use `userEvent.type`)
   - applies `data-testid`
   - applies `disabled` (input is not editable when disabled)

**Verification MANUAL:** Run `npm run test -- Input` and confirm all tests pass.

---

### Step 3: Implement the ColorPicker adapter

**New files:**

- `src/components/lib/ColorPicker/ColorPicker.tsx`
- `src/components/lib/ColorPicker/color-picker.constants.ts`
- `src/components/lib/ColorPicker/index.ts`

**Context:**
Chakra's `ColorPicker` (v3.36.0) is a compound component built on Ark UI/Zag.js and requires a parsed `Color` value (via `parseColor`) rather than a plain string. The adapter hides this by accepting/emitting a hex string, matching the "hide DOM/library specifics" convention used by `Input` (Step 1) and `Button`. The draft calls for "Nord Aurora swatches + Chakra picker" — the Nord Aurora accent colors (`nord.11`–`nord.15`, already defined in `src/components/lib/theme/theme.ts`) are used as the swatch group, alongside the full Chakra area/slider picker for custom colors. Portal usage follows `.doc/Modal.tsx`.

**Changes:**

1. In `color-picker.constants.ts`, define the Nord Aurora swatch hex values (matching `nord.11`–`nord.15` from `theme.ts`):

```ts
export const NORD_AURORA_SWATCHES = [
  "#bf616a",
  "#d08770",
  "#ebcb8b",
  "#a3be8c",
  "#b48ead",
];
```

2. In `ColorPicker.tsx`, wrap the Chakra compound component:

```tsx
import {
  ColorPicker as ChakraColorPicker,
  HStack,
  Portal,
  parseColor,
  type ColorPickerValueChangeDetails,
} from "@chakra-ui/react";
import { NORD_AURORA_SWATCHES } from "./color-picker.constants";

export type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const handleValueChange = (details: ColorPickerValueChangeDetails) => {
    onChange(details.valueAsString);
  };

  return (
    <ChakraColorPicker.Root
      value={parseColor(value)}
      onValueChange={handleValueChange}
    >
      <ChakraColorPicker.HiddenInput />
      <ChakraColorPicker.Label>{label}</ChakraColorPicker.Label>
      <ChakraColorPicker.Control>
        <ChakraColorPicker.Trigger />
      </ChakraColorPicker.Control>
      <Portal>
        <ChakraColorPicker.Positioner>
          <ChakraColorPicker.Content>
            <ChakraColorPicker.Area />
            <HStack>
              <ChakraColorPicker.EyeDropper />
              <ChakraColorPicker.ChannelSlider channel="hue" />
            </HStack>
            <ChakraColorPicker.SwatchGroup>
              {NORD_AURORA_SWATCHES.map((swatch) => (
                <ChakraColorPicker.SwatchTrigger key={swatch} value={swatch}>
                  <ChakraColorPicker.Swatch value={swatch} />
                </ChakraColorPicker.SwatchTrigger>
              ))}
            </ChakraColorPicker.SwatchGroup>
          </ChakraColorPicker.Content>
        </ChakraColorPicker.Positioner>
      </Portal>
    </ChakraColorPicker.Root>
  );
};
```

3. In `index.ts`, re-export: `export { ColorPicker, type ColorPickerProps } from "./ColorPicker";`
4. Add `export { ColorPicker, type ColorPickerProps } from "./ColorPicker";` to `src/components/lib/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 4: Add unit tests for the ColorPicker adapter

**New files:**

- `src/components/lib/ColorPicker/__tests__/ColorPicker.test.tsx`

**Context:**
The Chakra `ColorPicker.Area`/`ChannelSlider` rely on pointer-drag interactions that jsdom does not model well, so tests should stick to trigger/label/swatch-selection interactions (consistent with what `userEvent.click` can drive), not simulated dragging.

**Changes:**

1. Create a `setup()` helper rendering `<ColorPicker label="..." value="#bf616a" onChange={vi.fn()} />` with `renderWithUIProvider`, returning `{ user }`.
2. Add test cases:
   - renders the `label` text
   - opens the picker content when the trigger is clicked (`Control`/`Trigger` becomes visible, e.g. assert the swatch group or an aria attribute becomes present)
   - calls `onChange` with the swatch's hex value when a swatch trigger is clicked
   - renders one `ColorPickerSwatchTrigger` per entry in `NORD_AURORA_SWATCHES`

**Verification MANUAL:** Run `npm run test -- ColorPicker` and confirm all tests pass.

---

### Step 5: Implement the Dialog adapter

**New files:**

- `src/components/lib/Dialog/Dialog.tsx`
- `src/components/lib/Dialog/index.ts`

**Context:**
Directly adapts `.doc/Modal.tsx` into the `components/lib` folder convention (folder + `index.ts`, per `Box`/`Button`/etc.), renaming `Modal`/`ModalProps` to `Dialog`/`DialogProps` for consistency with the underlying Chakra `Dialog` namespace it wraps.

**Changes:**

1. In `Dialog.tsx`, copy the structure from `.doc/Modal.tsx` verbatim, renaming the component and type:

```tsx
import { CloseButton, Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type DialogProps = {
  open: boolean;
  title: string;
  content: ReactNode;
  actions: ReactNode;
  onClose: () => void;
};

export const Dialog = ({
  open,
  title,
  content,
  actions,
  onClose,
}: DialogProps) => {
  return (
    <ChakraDialog.Root
      lazyMount
      placement="center"
      open={open}
      onOpenChange={onClose}
    >
      <Portal>
        <ChakraDialog.Backdrop />

        <ChakraDialog.Positioner>
          <ChakraDialog.Content>
            <ChakraDialog.Header>
              <ChakraDialog.Title>{title}</ChakraDialog.Title>
            </ChakraDialog.Header>

            <ChakraDialog.Body>{content}</ChakraDialog.Body>

            <ChakraDialog.Footer>{actions}</ChakraDialog.Footer>

            <ChakraDialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </ChakraDialog.CloseTrigger>
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
};
```

2. In `index.ts`, re-export: `export { Dialog, type DialogProps } from "./Dialog";`
3. Add `export { Dialog, type DialogProps } from "./Dialog";` to `src/components/lib/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` and confirm it passes with no errors.

---

### Step 6: Add unit tests for the Dialog adapter

**New files:**

- `src/components/lib/Dialog/__tests__/Dialog.test.tsx`

**Context:**
`ChakraDialog.Root` uses `lazyMount`, so body/footer content only renders once `open` is `true`. Portal content is still queryable via `screen` since Testing Library queries the whole `document`, so no special portal handling is needed (consistent with no prior Portal-based test in this repo).

**Changes:**

1. Create a `setup()` helper rendering `<Dialog open title="Test title" content="Test content" actions={<button>OK</button>} onClose={vi.fn()} />` with `renderWithUIProvider`, returning `{ user }`.
2. Add test cases:
   - renders `title`, `content`, and `actions` when `open` is `true`
   - does not render `content` when `open` is `false`
   - calls `onClose` when the close button (`CloseButton`, accessible via role `button` with its default label) is clicked

**Verification MANUAL:** Run `npm run test -- Dialog` and confirm all tests pass.

---

### Step 7: Demo the Input, ColorPicker, and Dialog adapters on ColorsDemoPage

**File:**
`src/pages/ColorsDemoPage/ColorsDemoPage.tsx`

**Context:**
The draft requires these primitives to be demoed on `ColorsDemoPage` with "no feature wiring yet" — this step only exercises each adapter with local `useState`, following the existing `Card.Root`/`Card.Body` section pattern already used on the page (e.g. the "Buttons" and "Status Badges" sections).

**Changes:**

1. Import `Input`, `ColorPicker`, `Dialog` from `@/components/lib`, and `useState` from `react`.
2. Add local state: `inputValue` (string, default `""`), `colorValue` (string, default `"#bf616a"`), `dialogOpen` (boolean, default `false`).
3. Add a new `Card.Root` section titled "Input" containing an `Input` bound to `inputValue`/`setInputValue`.
4. Add a new `Card.Root` section titled "Color Picker" containing a `ColorPicker` with `label="Accent color"`, bound to `colorValue`/`setColorValue`.
5. Add a new `Card.Root` section titled "Dialog" containing a `Button` that sets `dialogOpen` to `true` (via a `handleOpenDialog` handler, per the project's event-handler naming convention), and a `Dialog` bound to `dialogOpen`, with a simple title/content/actions (a close `Button` calling a `handleCloseDialog` that sets `dialogOpen` to `false`).

**Verification MANUAL:** Run `npm run start`, navigate to the Colors Demo page, and confirm the Input accepts text, the Color Picker opens and lets you pick a Nord Aurora swatch or a custom color, and the Dialog opens/closes correctly.

---

### Step 8: Run the full verification suite

**Changes:**

1. No code changes — this step validates the cumulative result of Steps 1–7.

**Verification MANUAL:** Run `npm run lint`, `npm run ts:check`, and `npm run test` and confirm all three pass with no errors.
