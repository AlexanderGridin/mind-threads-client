# Refactor: Replace Chakra UI components with adapters

## Implementation Steps

---

### Step 1: Create the `Box` adapter

**New files:**

- `src/components/lib/Box/Box.tsx`
- `src/components/lib/Box/index.ts`

**Context:**
`Box` is used in four files (`DashboardContent`, `MindThreadList`, `MindThreadCard`, `CardColorIndicator`) with a wide set of styling props. The adapter follows the same spread pattern as `src/components/lib/HStack/HStack.tsx`.

**Changes:**

1. Define `BoxProps` in `Box.tsx` covering all props currently used across the four consumer files:

```tsx
import { Box as ChakraBox } from "@chakra-ui/react";
import type { ReactNode, ElementType } from "react";

export type BoxProps = {
  children?: ReactNode;
  as?: ElementType;
  "data-testid"?: string;
  px?: string;
  py?: string;
  p?: string;
  display?: string;
  flexDirection?: string;
  gridTemplateColumns?: string;
  gap?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  overflow?: string;
  _hover?: { borderColor?: string; boxShadow?: string };
  transition?: string;
  width?: string;
  height?: string;
  textAlign?: string;
  cursor?: string;
  onClick?: () => void;
  backgroundColor?: string;
  flexShrink?: number;
};

export const Box = ({ children, ...props }: BoxProps) => (
  <ChakraBox {...props}>{children}</ChakraBox>
);
```

2. Create `index.ts` barrel (follow `src/components/lib/HStack/index.ts`).

**Verification MANUAL:** Run `npm run ts:check` — no new TypeScript errors.

---

### Step 2: Add unit tests for the `Box` adapter

**New files:**

- `src/components/lib/Box/__tests__/Box.test.tsx`

**Context:**
Follow the test structure in `src/components/lib/Button/__tests__/Button.test.tsx`: a `setup()` helper, `renderWithUIProvider`, and assertions by role/text/testid.

**Changes:**

1. Write tests covering:
   - Renders children.
   - Applies `data-testid`.
   - Calls `onClick` when clicked.
   - Renders without children (self-closing usage, as in `CardColorIndicator`).

```tsx
const setup = (props: Partial<BoxProps> = {}) => {
  const user = userEvent.setup();
  const renderResult = renderWithUIProvider(<Box {...props} />);
  return { user, ...renderResult };
};

describe("Box", () => {
  it("renders children", () => { ... });
  it("applies data-testid", () => { ... });
  it("calls onClick when clicked", async () => { ... });
  it("renders without children", () => { ... });
});
```

**Verification MANUAL:** Run `npm run test` — all Box tests pass.

---

### Step 3: Create the `VStack` adapter

**New files:**

- `src/components/lib/VStack/VStack.tsx`
- `src/components/lib/VStack/index.ts`

**Context:**
`VStack` is used only in `CardContent.tsx` with props: `data-testid`, `gap`, `alignItems`, `p`. Follow the same spread pattern as `HStack.tsx`.

**Changes:**

1. Define `VStackProps` and export `VStack` in `VStack.tsx`:

```tsx
import { VStack as ChakraVStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type VStackProps = {
  children: ReactNode;
  "data-testid"?: string;
  gap?: string;
  alignItems?: "flex-start" | "flex-end" | "center";
  p?: string;
};

export const VStack = ({ children, ...props }: VStackProps) => (
  <ChakraVStack {...props}>{children}</ChakraVStack>
);
```

2. Create `index.ts` barrel.

**Verification MANUAL:** Run `npm run ts:check` — no new TypeScript errors.

---

### Step 4: Add unit tests for the `VStack` adapter

**New files:**

- `src/components/lib/VStack/__tests__/VStack.test.tsx`

**Changes:**

1. Write tests covering:
   - Renders children.
   - Applies `data-testid`.
   - Renders multiple children.

**Verification MANUAL:** Run `npm run test` — all VStack tests pass.

---

### Step 5: Create the `IconButton` adapter

**New files:**

- `src/components/lib/IconButton/IconButton.tsx`
- `src/components/lib/IconButton/index.ts`

**Context:**
`ThreadListModeButton` uses `forwardRef` and forwards `ref` to `IconButton`. The adapter must use `forwardRef` as well. Props used: `data-testid`, `aria-label`, `variant`, `borderColor`, `color`, `size`, `css`, `onClick`, `children`.

**Changes:**

1. Define `IconButtonProps` and export a `forwardRef`-based `IconButton` in `IconButton.tsx`:

```tsx
import { forwardRef } from "react";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type IconButtonProps = {
  children: ReactNode;
  "aria-label": string;
  onClick: () => void;
  "data-testid"?: string;
  variant?: string;
  borderColor?: string;
  color?: string;
  size?: string;
  css?: { _icon?: { width?: string; height?: string } };
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, ...props }, ref) => (
    <ChakraIconButton ref={ref} {...props}>{children}</ChakraIconButton>
  )
);

IconButton.displayName = "IconButton";
```

2. Create `index.ts` barrel.

**Verification MANUAL:** Run `npm run ts:check` — no new TypeScript errors.

---

### Step 6: Add unit tests for the `IconButton` adapter

**New files:**

- `src/components/lib/IconButton/__tests__/IconButton.test.tsx`

**Changes:**

1. Write tests covering:
   - Renders children.
   - Applies `aria-label` (query by role `"button"` with name).
   - Calls `onClick` when clicked.
   - Applies `data-testid`.

**Verification MANUAL:** Run `npm run test` — all IconButton tests pass.

---

### Step 7: Extend `HStack` and `Text` adapters with missing props; add their tests

**File:** `src/components/lib/HStack/HStack.tsx`
**File:** `src/components/lib/Text/Text.tsx`

**New files:**

- `src/components/lib/HStack/__tests__/HStack.test.tsx`
- `src/components/lib/Text/__tests__/Text.test.tsx`

**Context:**
`CardContent.tsx` passes `fontSize` and `color` to `HStack`, and `data-testid` to both `HStack` and `Text`. These props are missing from the current adapter types, which would cause TypeScript errors after the import swap in Step 10.

**Changes:**

1. Add `"data-testid"?: string`, `fontSize?: string`, `color?: string` to `HStackProps`.
2. Add `"data-testid"?: string` to `TextProps`.
3. Write `HStack.test.tsx`: renders children, applies `data-testid`.
4. Write `Text.test.tsx`: renders children, applies `data-testid`, renders with `as` prop.

**Verification MANUAL:** Run `npm run ts:check && npm run test` — no errors and all tests pass.

---

### Step 8: Export new adapters from the lib barrel

**File:** `src/components/lib/index.ts`

**Changes:**

Add export lines for the three new adapters after the existing exports:

```ts
export { Box, type BoxProps } from "./Box";
export { VStack, type VStackProps } from "./VStack";
export { IconButton, type IconButtonProps } from "./IconButton";
```

**Verification MANUAL:** Run `npm run ts:check` — no new TypeScript errors.

---

### Step 9: Replace direct `Box` Chakra imports with the adapter

**File:** `src/pages/DashboardPage/components/DashboardContent/DashboardContent.tsx`
**File:** `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`
**File:** `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`
**File:** `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardColorIndicator.tsx`

**Changes:**

In each file, replace:
```tsx
import { Box } from "@chakra-ui/react";
```
with:
```tsx
import { Box } from "@/components/lib";
```

No other changes — all prop values remain identical.

**Verification MANUAL:** Run `npm run ts:check && npm run test` — no errors and all tests pass.

---

### Step 10: Replace direct Chakra imports in `CardContent`

**File:** `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardContent.tsx`

**Changes:**

Replace:
```tsx
import { HStack, VStack, Text } from "@chakra-ui/react";
```
with:
```tsx
import { HStack, VStack, Text } from "@/components/lib";
```

No other changes — all prop values remain identical.

**Verification MANUAL:** Run `npm run ts:check && npm run test` — no errors and all tests pass.

---

### Step 11: Replace direct `IconButton` Chakra import in `ThreadListModeButton`

**File:** `src/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.tsx`

**Changes:**

Replace:
```tsx
import { IconButton } from "@chakra-ui/react";
```
with:
```tsx
import { IconButton } from "@/components/lib";
```

No other changes — all prop values remain identical.

**Verification MANUAL:** Run `npm run ts:check && npm run test` — no errors and all tests pass. Manually verify the toggle button in the dashboard UI still renders and toggles grid/list mode.
