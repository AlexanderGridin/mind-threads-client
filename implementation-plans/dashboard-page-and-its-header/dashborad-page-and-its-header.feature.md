# Dashboard Page and its Header

## Implementation Steps

---

### Step 1: Update ColorModeButton styling to match secondary button

**File:** `src/components/lib/color-mode/components/ColorModeButton/ColorModeButton.tsx`

**Context:**
The secondary button in `ColorsDemoPage.tsx` uses `variant="outline" borderColor="border" color="fg"`. The current `ColorModeButton` uses `variant="ghost"`, which does not follow that pattern.

**Changes:**
1. Replace `variant="ghost"` with `variant="outline"`.
2. Add `borderColor="border"` and `color="fg"` props to the `IconButton`.

```tsx
<IconButton
  data-testid={ColorModeButtonTestId.container}
  aria-label="Toggle color mode"
  variant="outline"
  borderColor="border"
  color="fg"
  size="sm"
  ref={ref}
  css={{ _icon: { width: "5", height: "5" } }}
  onClick={toggleColorMode}
>
```

**Verification MANUAL:** Open the app, verify the color mode toggle button renders with an outlined border instead of a ghost (transparent) background.

---

### Step 2: Update ColorModeButton tests to cover secondary button styling

**File:** `src/components/lib/color-mode/components/ColorModeButton/__tests__/ColorModeButton.test.tsx`

**Changes:**
1. Add a test that retrieves the button by `testId` and asserts it has `aria-label="Toggle color mode"` (existing) — no structural change needed there.
2. Add a test verifying the button element carries the Chakra `data-variant="outline"` attribute (Chakra adds this to the DOM via its variant system):

```tsx
it("renders with outline variant styling", () => {
  setup();

  const button = screen.getByTestId(ColorModeButtonTestId.container);

  expect(button).toHaveAttribute("data-variant", "outline");
});
```

**Verification MANUAL:** Run `npm run test` — all `ColorModeButton` tests pass.

---

### Step 3: Create HStack adapter

**New files:**

- `src/components/lib/HStack/HStack.tsx`
- `src/components/lib/HStack/index.ts`

**Context:**
Follow the same thin-wrapper pattern as `src/components/lib/Button/Button.tsx`. Expose only the props consumed by `DashboardHeader`: `children`, `as`, `justifyContent`, `alignItems`, and `gap`. `px`, `py`, `borderBottomWidth`, and `borderColor` are also needed for the header container.

**Changes:**
1. Create `HStack.tsx`:

```tsx
import { HStack as ChakraHStack } from "@chakra-ui/react";
import type { ReactNode, ElementType } from "react";

export type HStackProps = {
  children: ReactNode;
  as?: ElementType;
  justifyContent?: "space-between" | "flex-start" | "flex-end" | "center";
  alignItems?: "center" | "flex-start" | "flex-end";
  gap?: string;
  px?: string;
  py?: string;
  borderBottomWidth?: string;
  borderColor?: string;
};

export const HStack = ({ children, ...props }: HStackProps) => (
  <ChakraHStack {...props}>{children}</ChakraHStack>
);
```

2. Create `HStack/index.ts` re-exporting `HStack` and `HStackProps`.
3. Add `export { HStack, type HStackProps } from "./HStack";` to `src/components/lib/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` — no type errors.

---

### Step 4: Create Text adapter

**New files:**

- `src/components/lib/Text/Text.tsx`
- `src/components/lib/Text/index.ts`

**Context:**
Follow the same thin-wrapper pattern as `src/components/lib/Button/Button.tsx`. Expose only the props needed by `DashboardHeader`: `children`, `as`, `fontSize`, `fontWeight`, and `color`.

**Changes:**
1. Create `Text.tsx`:

```tsx
import { Text as ChakraText } from "@chakra-ui/react";
import type { ReactNode, ElementType } from "react";

export type TextProps = {
  children: ReactNode;
  as?: ElementType;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
};

export const Text = ({ children, ...props }: TextProps) => (
  <ChakraText {...props}>{children}</ChakraText>
);
```

2. Create `Text/index.ts` re-exporting `Text` and `TextProps`.
3. Add `export { Text, type TextProps } from "./Text";` to `src/components/lib/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` — no type errors.

---

### Step 5: Create DashboardHeader component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/DashboardHeader.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/DashboardHeader.constants.ts`
- `src/pages/DashboardPage/components/DashboardHeader/index.ts`
- `src/pages/DashboardPage/components/index.ts`

**Context:**
Reference the prototype header in `prototype/prototype-code/components/dashboard/Dashboard.tsx` lines 67–108 for layout structure. The scope is: app icon + name on the left, `ColorModeButton` on the right. Use `LuBrainCircuit` from `react-icons/lu` as the app icon (consistent with the `react-icons/lu` usage in `ColorModeIcon.tsx`).

**Changes:**
1. Create `DashboardHeader.constants.ts` using the `initTestIdCreator` pattern:

```ts
import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("DashboardHeader__");

export const DashboardHeaderTestId = {
  container: createTestId("container"),
} as const;
```

2. Create `DashboardHeader.tsx`:

```tsx
import { LuBrainCircuit } from "react-icons/lu";
import { HStack, Text, ColorModeButton } from "@/components/lib";
import { DashboardHeaderTestId } from "./DashboardHeader.constants";

export const DashboardHeader = () => {
  return (
    <HStack
      as="header"
      data-testid={DashboardHeaderTestId.container}
      justifyContent="space-between"
      alignItems="center"
      px="6"
      py="4"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <HStack gap="3" alignItems="center">
        <LuBrainCircuit size={20} />
        <Text as="h1" fontSize="md" fontWeight="semibold" color="fg">
          Mind Threads
        </Text>
      </HStack>
      <ColorModeButton />
    </HStack>
  );
};
```

3. Create `DashboardHeader/index.ts` re-exporting `DashboardHeader`.
4. Create `src/pages/DashboardPage/components/index.ts` re-exporting from `./DashboardHeader`.

**Verification MANUAL:** Run `npm run ts:check` — no type errors.

---

### Step 6: Create DashboardHeader tests

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/__tests__/DashboardHeader.test.tsx`

**Context:**
Follow the test structure from `src/components/lib/color-mode/components/ColorModeButton/__tests__/ColorModeButton.test.tsx` — mock hooks where needed, use `renderWithUIProvider`, and define a `setup()` function.

**Changes:**
1. Create `DashboardHeader.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { DashboardHeader } from "../DashboardHeader";
import { DashboardHeaderTestId } from "../DashboardHeader.constants";
import { ColorModeButtonTestId } from "@/components/lib/color-mode/components/ColorModeButton/ColorModeButton.constants";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  renderWithUIProvider(<DashboardHeader />);
};

describe("DashboardHeader", () => {
  it("renders the header container", () => {
    setup();

    expect(
      screen.getByTestId(DashboardHeaderTestId.container)
    ).toBeInTheDocument();
  });

  it("renders the app name", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "Mind Threads" })
    ).toBeInTheDocument();
  });

  it("renders the color mode toggle button", () => {
    setup();

    expect(
      screen.getByTestId(ColorModeButtonTestId.container)
    ).toBeInTheDocument();
  });
});
```

**Verification MANUAL:** Run `npm run test` — all `DashboardHeader` tests pass.

---

### Step 7: Create DashboardPage component

**New files:**

- `src/pages/DashboardPage/DashboardPage.tsx`
- `src/pages/DashboardPage/index.ts`

**Context:**
Follow the same folder structure as `src/pages/HomePage/`. The page renders `DashboardHeader` and a placeholder `<main>` for future content (out of current scope).

**Changes:**
1. Create `DashboardPage.tsx`:

```tsx
import { DashboardHeader } from "./components";

export const DashboardPage = () => {
  return (
    <>
      <DashboardHeader />
      <main />
    </>
  );
};
```

2. Create `DashboardPage/index.ts` re-exporting `DashboardPage`.

**Verification MANUAL:** Run `npm run ts:check` — no type errors.

---

### Step 8: Create DashboardPage tests

**New files:**

- `src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Context:**
Follow the test structure from `src/pages/HomePage/__tests__/HomePage.test.tsx`.

**Changes:**
1. Create `DashboardPage.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib";
import { DashboardPage } from "../DashboardPage";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const setup = () => {
  renderWithUIProvider(<DashboardPage />);
};

describe("DashboardPage", () => {
  it("renders the app name heading", () => {
    setup();

    expect(
      screen.getByRole("heading", { name: "Mind Threads" })
    ).toBeInTheDocument();
  });
});
```

**Verification MANUAL:** Run `npm run test` — all `DashboardPage` tests pass.

---

### Step 9: Register DashboardPage as the index route and update barrel exports

**File:** `src/routing/AppRoutes.tsx`
**File:** `src/pages/index.ts`

**Changes:**
1. In `AppRoutes.tsx`, replace the `HomePage` import and its `<Route index>` element with `DashboardPage`:

```tsx
import { DashboardPage, ThreadPage, ColorsDemoPage } from "@/pages";

// ...
<Route index element={<DashboardPage />} />
```

2. In `src/pages/index.ts`, add the `DashboardPage` export (keep `HomePage` export until Step 11):

```ts
export * from "./DashboardPage";
```

**Verification MANUAL:** Run `npm run start`, navigate to `/` — the DashboardPage renders with its header.

---

### Step 10: Update App.test.tsx to reflect DashboardPage at the root route

**File:** `src/__tests__/App.test.tsx`

**Changes:**
1. Replace assertions checking for `"HomePage"` heading with assertions checking for `"Mind Threads"` heading (the `<h1>` rendered by `DashboardHeader`).
2. Add the `useColorMode` mock (same pattern as `DashboardPage.test.tsx`) so `ColorModeButton` renders correctly in the test environment.
3. Update the `"renders HomePage at the root path"` test description to `"renders DashboardPage at the root path"`.
4. Update the `"navigates to HomePage when Home button is clicked"` assertion to check for `"Mind Threads"` heading instead.

**Verification MANUAL:** Run `npm run test` — all `App` tests pass.

---

### Step 11: Remove HomePage

**File:** `src/pages/index.ts`
**File:** `src/pages/HomePage/HomePage.tsx` *(delete)*
**File:** `src/pages/HomePage/index.ts` *(delete)*
**File:** `src/pages/HomePage/__tests__/HomePage.test.tsx` *(delete)*
**File:** `src/pages/HomePage/` *(delete folder)*

**Changes:**
1. Delete the `src/pages/HomePage/` folder and all its contents.
2. Remove `export * from "./HomePage";` from `src/pages/index.ts`.

**Verification MANUAL:** Run `npm run test` and `npm run ts:check` — no errors. Run `npm run start` and confirm `/` still renders the DashboardPage.

---
