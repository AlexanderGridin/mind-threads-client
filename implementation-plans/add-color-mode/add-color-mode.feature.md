
# Adding a color mode

## Implementation Steps

---

### Step 1: Create the types file

**New files:**

- `src/components/lib/color-mode/color-mode.types.ts`

**Changes:**
1. Extract the three exported types from `src/components/ui/color-mode.tsx` into this file, converting `interface` declarations to `type`:
   ```ts
   export type ColorMode = "light" | "dark";

   export type UseColorModeReturn = {
     colorMode: ColorMode;
     setColorMode: (colorMode: ColorMode) => void;
     toggleColorMode: () => void;
   };

   export type ColorModeProviderProps = ThemeProviderProps;
   ```
2. Add the required imports: `import type { ThemeProviderProps } from "next-themes"`.

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 2: Create the hooks file

**New files:**

- `src/components/lib/color-mode/color-mode.hooks.ts`

**Changes:**
1. Move `useColorMode` and `useColorModeValue` from `src/components/ui/color-mode.tsx` into this file. Convert both from `function` declarations to arrow functions:
   ```ts
   export const useColorMode = (): UseColorModeReturn => {
     const { resolvedTheme, setTheme, forcedTheme } = useTheme();
     const colorMode = forcedTheme || resolvedTheme;

     return {
       colorMode: colorMode as ColorMode,
       setColorMode: setTheme,
       toggleColorMode: () => {
         setTheme(resolvedTheme === "dark" ? "light" : "dark");
       },
     };
   };

   export const useColorModeValue = <T>(light: T, dark: T): T => {
     const { colorMode } = useColorMode();
     return colorMode === "dark" ? dark : light;
   };
   ```
2. Add imports: `import { useTheme } from "next-themes"` and `import type { ColorMode, UseColorModeReturn } from "./color-mode.type"`.

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 3: Create the `ColorModeProvider` component

**New files:**

- `src/components/lib/color-mode/ColorModeProvider.tsx`

**Changes:**
1. Move the provider component from `src/components/ui/color-mode.tsx`. Remove the `"use client"` directive (Next.js-specific, unused in Vite). Convert to an arrow function:
   ```tsx
   export const ColorModeProvider = (props: ColorModeProviderProps) => (
     <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
   );
   ```
2. Add imports: `import { ThemeProvider } from "next-themes"` and `import type { ColorModeProviderProps } from "./color-mode.types"`.

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 4: Integrate `ColorModeProvider` into `ChakraUIProvider`

**File:**
`src/components/lib/ChakraUIProvider.tsx`

**Context:**
The dark mode guide requires `ColorModeProvider` to be nested inside `ChakraProvider`. Adding it here means every consumer of `ChakraUIProvider` (including `renderWithUIProvider` in tests) gets the full provider stack automatically.

**Changes:**
1. Import `ColorModeProvider` from `"./color-mode/ColorModeProvider"`.
2. Wrap `children` with `ColorModeProvider` inside `ChakraProviderComponent`:
   ```tsx
   export const ChakraUIProvider = ({ children }: ChakraUIProviderProps) => (
     <ChakraProviderComponent value={defaultSystem}>
       <ColorModeProvider>{children}</ColorModeProvider>
     </ChakraProviderComponent>
   );
   ```

**Verification MANUAL:** `npm run test` passes — existing tests continue to work since `renderWithUIProvider` uses `ChakraUIProvider` as the wrapper.

---

### Step 5: Create tests for the color-mode hooks

**New files:**

- `src/components/lib/color-mode/__tests__/color-mode.hooks.test.ts`

**Changes:**
1. Create a `wrapper` using `ChakraUIProvider` (which now includes `ColorModeProvider`):
   ```ts
   const wrapper = ({ children }: { children: ReactNode }) => (
     <ChakraUIProvider>{children}</ChakraUIProvider>
   );
   ```
2. Test `useColorMode`:
   - renders without throwing and returns a `colorMode` that is either `"light"` or `"dark"`.
   - `toggleColorMode` switches the `colorMode`.
3. Test `useColorModeValue`:
   - returns the light value when `colorMode` is `"light"`.
   - returns the dark value when `colorMode` is `"dark"`.
   Use `renderHook` from `@testing-library/react` with the `wrapper` option.

**Verification MANUAL:** `npm run test` passes with the new hook tests included.

---

### Step 6: Create the `ColorModeIcon` component

**New files:**

- `src/components/lib/color-mode/ColorModeIcon.tsx`

**Changes:**
1. Move the icon component from `src/components/ui/color-mode.tsx`. Convert to an arrow function:
   ```tsx
   export const ColorModeIcon = () => {
     const { colorMode } = useColorMode();
     return colorMode === "dark" ? <LuMoon /> : <LuSun />;
   };
   ```
2. Add imports: `import { LuMoon, LuSun } from "react-icons/lu"` and `import { useColorMode } from "./color-mode.hooks"`.

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 7: Create tests for `ColorModeIcon`

**New files:**

- `src/components/lib/color-mode/__tests__/ColorModeIcon.test.tsx`

**Changes:**
1. Use `renderWithUIProvider` (which now includes full provider stack) following the `setup()` pattern from `Button.test.tsx`.
2. Test that the component renders without throwing.
3. Test that a single SVG icon element is present in the document.

**Verification MANUAL:** `npm run test` passes with the new `ColorModeIcon` tests included.

---

### Step 8: Create the `ColorModeButton` component

**New files:**

- `src/components/lib/color-mode/ColorModeButton.tsx`

**Changes:**
1. Move the button component from `src/components/ui/color-mode.tsx`. Convert the internal `ColorModeButtonProps` interface to a `type`. Use `React.forwardRef` with an arrow function body:
   ```tsx
   type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">;

   export const ColorModeButton = React.forwardRef<
     HTMLButtonElement,
     ColorModeButtonProps
   >((props, ref) => {
     const { toggleColorMode } = useColorMode();
     return (
       <ClientOnly fallback={<Skeleton boxSize="9" />}>
         <IconButton
           onClick={toggleColorMode}
           variant="ghost"
           aria-label="Toggle color mode"
           size="sm"
           ref={ref}
           {...props}
           css={{ _icon: { width: "5", height: "5" } }}
         >
           <ColorModeIcon />
         </IconButton>
       </ClientOnly>
     );
   });
   ```
2. Add imports from `@chakra-ui/react` and local files (`useColorMode`, `ColorModeIcon`).

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 9: Create tests for `ColorModeButton`

**New files:**

- `src/components/lib/color-mode/__tests__/ColorModeButton.test.tsx`

**Changes:**
1. Create a `setup()` function using `renderWithUIProvider` following the `Button.test.tsx` pattern.
2. Test that the button with `aria-label="Toggle color mode"` renders.
3. Test that clicking the button does not throw (toggle interaction).

**Verification MANUAL:** `npm run test` passes with the new `ColorModeButton` tests included.

---

### Step 10: Create `LightMode` and `DarkMode` components

**New files:**

- `src/components/lib/color-mode/LightMode.tsx`
- `src/components/lib/color-mode/DarkMode.tsx`

**Changes:**
1. Move `LightMode` from `src/components/ui/color-mode.tsx` into `LightMode.tsx`. Convert the named inner function in `forwardRef` to an arrow function:
   ```tsx
   export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
     (props, ref) => (
       <Span
         color="fg"
         display="contents"
         className="chakra-theme light"
         colorPalette="gray"
         colorScheme="light"
         ref={ref}
         {...props}
       />
     ),
   );
   ```
2. Move `DarkMode` analogously into `DarkMode.tsx`, using `className="chakra-theme dark"` and `colorScheme="dark"`.
3. Add imports: `import { Span } from "@chakra-ui/react"`, `import type { SpanProps } from "@chakra-ui/react"`, `import * as React from "react"`.

**Verification MANUAL:** `npm run ts:check` passes with no errors.

---

### Step 11: Create tests for `LightMode` and `DarkMode`

**New files:**

- `src/components/lib/color-mode/__tests__/LightMode.test.tsx`
- `src/components/lib/color-mode/__tests__/DarkMode.test.tsx`

**Changes:**
1. For each component, use a `setup()` function using `renderWithUIProvider` that renders the component with a child text node.
2. Test that the child content is present in the document.

**Verification MANUAL:** `npm run test` passes with both new test files included.

---

### Step 12: Create the barrel export for the `color-mode` module and update the lib index

**New files:**

- `src/components/lib/color-mode/index.ts`

**File:**
`src/components/lib/index.ts`

**Changes:**
1. Create `src/components/lib/color-mode/index.ts` re-exporting everything from all module files:
   ```ts
   export * from "./color-mode.type";
   export * from "./color-mode.hooks";
   export { ColorModeProvider } from "./ColorModeProvider";
   export { ColorModeIcon } from "./ColorModeIcon";
   export { ColorModeButton } from "./ColorModeButton";
   export { LightMode } from "./LightMode";
   export { DarkMode } from "./DarkMode";
   ```
2. Add a line to `src/components/lib/index.ts`:
   ```ts
   export * from "./color-mode";
   ```

**Verification MANUAL:** `npm run ts:check` passes. All color-mode exports are accessible via `@/components/lib`.

---

### Step 13: Add `ColorModeButton` to `App.tsx`

**File:**
`src/App.tsx`

**Changes:**
1. Import `ColorModeButton` from `@/components/lib`.
2. Add `<ColorModeButton />` inside the `<nav>` element alongside the existing navigation buttons:
   ```tsx
   <nav style={{ display: "flex", flexDirection: "row", gap: "0.5rem", padding: "0.5rem" }}>
     <Button onClick={handleNavigateToHome}>Home</Button>
     <Button onClick={handleNavigateToThread}>Thread 1</Button>
     <ColorModeButton />
   </nav>
   ```

**Verification MANUAL:** `npm run dev` — the app renders and clicking the toggle button in the nav bar switches between light and dark mode.

---

### Step 14: Update `App.test.tsx` to cover the `ColorModeButton`

**File:**
`src/__tests__/App.test.tsx`

**Changes:**
1. Add a test to the `"App"` describe block that asserts the toggle button renders:
   ```ts
   it("renders the color mode toggle button", () => {
     setup("/");
     expect(
       screen.getByRole("button", { name: /toggle color mode/i })
     ).toBeInTheDocument();
   });
   ```

**Verification MANUAL:** `npm run test` passes including the new assertion.

---

### Step 15: Update `HomePage.tsx` with theme-dependent components

**File:**
`src/pages/HomePage/HomePage.tsx`

**Changes:**
1. Import Chakra UI components: `Box`, `Text` from `@chakra-ui/react`.
2. Import `useColorModeValue` from `@/components/lib`.
3. Add a visually-distinct section below the heading that adapts to color mode, using semantic tokens and `useColorModeValue`:
   ```tsx
   export const HomePage = () => {
     const labelText = useColorModeValue("Light mode is active", "Dark mode is active");
     return (
       <>
         <h1>HomePage</h1>
         <Box bg="bg.subtle" p="4" mt="4" borderRadius="md">
           <Text>{labelText}</Text>
         </Box>
       </>
     );
   };
   ```

**Verification MANUAL:** `npm run dev` — visiting `/` shows the correct mode label and the `Box` background visually changes when toggling the color mode button.

---

### Step 16: Update `HomePage.test.tsx` to cover the new theme-dependent content

**File:**
`src/pages/HomePage/__tests__/HomePage.test.tsx`

**Changes:**
1. Replace the bare `render` call with `renderWithUIProvider` from `@/components/lib` (Chakra UI components now require the provider).
2. Update the `setup()` function accordingly.
3. Add a test that checks the mode label renders:
   ```ts
   it("renders the color mode label", () => {
     setup();
     expect(
       screen.getByText(/light mode is active|dark mode is active/i)
     ).toBeInTheDocument();
   });
   ```

**Verification MANUAL:** `npm run test` passes including the new `HomePage` assertions.

---

### Step 17: Remove the original `color-mode.tsx` snippet file

**File:**
`src/components/ui/color-mode.tsx`

**Changes:**
1. Delete `src/components/ui/color-mode.tsx` — all exports have been migrated to `src/components/lib/color-mode/`.
2. If `src/components/ui/` is now empty, delete the folder as well.

**Verification MANUAL:** `npm run build` succeeds with no TypeScript errors and no missing-module warnings.
