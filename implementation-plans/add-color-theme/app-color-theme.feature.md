
# Add application specific color theme

## Implementation Steps

---

### Step 1: Create the Nord theme configuration

**New files:**

- `src/components/lib/theme/theme.ts`
- `src/components/lib/theme/index.ts`

**Context:**
Chakra v3 merges a custom `defineConfig` with `defaultConfig` via `createSystem`, so we only need to define the tokens we want to override or add. We define two layers: raw Nord palette tokens and semantic tokens that reference them for each color mode. The `_light`/`_dark` condition in Chakra v3 resolves correctly under both `[data-theme=dark]` and `.dark` selectors, which is compatible with the existing `next-themes` setup using `attribute="class"`.

**Changes:**

1. In `theme.ts`, define the Nord raw palette under `theme.tokens.colors.nord`, then override Chakra's existing semantic tokens under `theme.semanticTokens.colors`:

```ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        nord: {
          0:  { value: "#2e3440" },
          1:  { value: "#3b4252" },
          2:  { value: "#434c5e" },
          3:  { value: "#4c566a" },
          4:  { value: "#d8dee9" },
          5:  { value: "#e5e9f0" },
          6:  { value: "#eceff4" },
          7:  { value: "#8fbcbb" },
          8:  { value: "#88c0d0" },
          9:  { value: "#81a1c1" },
          10: { value: "#5e81ac" },
          11: { value: "#bf616a" },
          12: { value: "#d08770" },
          13: { value: "#ebcb8b" },
          14: { value: "#a3be8c" },
          15: { value: "#b48ead" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT:    { value: { _light: "{colors.nord.6}", _dark: "{colors.nord.0}" } },
          subtle:     { value: { _light: "{colors.nord.5}", _dark: "{colors.nord.1}" } },
          muted:      { value: { _light: "{colors.nord.4}", _dark: "{colors.nord.2}" } },
        },
        fg: {
          DEFAULT:    { value: { _light: "{colors.nord.0}", _dark: "{colors.nord.6}" } },
          muted:      { value: { _light: "{colors.nord.3}", _dark: "{colors.nord.4}" } },
        },
        border: {
          DEFAULT:    { value: { _light: "#c8d3de",         _dark: "{colors.nord.3}" } },
          subtle:     { value: { _light: "{colors.nord.4}", _dark: "{colors.nord.2}" } },
        },
        accent: {
          DEFAULT:    { value: { _light: "{colors.nord.10}", _dark: "{colors.nord.8}" } },
          fg:         { value: { _light: "{colors.nord.6}",  _dark: "{colors.nord.0}" } },
          subtle:     { value: { _light: "{colors.nord.9}",  _dark: "{colors.nord.9}" } },
        },
        red:    { DEFAULT: { value: "{colors.nord.11}" } },
        orange: { DEFAULT: { value: "{colors.nord.12}" } },
        yellow: { DEFAULT: { value: "{colors.nord.13}" } },
        green:  { DEFAULT: { value: "{colors.nord.14}" } },
        purple: { DEFAULT: { value: "{colors.nord.15}" } },
      },
    },
  },
});

export const nordSystem = createSystem(defaultConfig, config);
```

2. In `index.ts`, re-export the system:

```ts
export { nordSystem } from "./theme";
```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors should be reported.

---

### Step 2: Wire the custom system into ChakraUIProvider

**File:** `src/components/lib/ChakraUIProvider.tsx`

**Changes:**

Replace the `defaultSystem` import and usage with `nordSystem`:

```ts
// Before
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
// ...
<ChakraProvider value={defaultSystem}>

// After
import { ChakraProvider } from "@chakra-ui/react";
import { nordSystem } from "./theme";
// ...
<ChakraProvider value={nordSystem}>
```

**Verification MANUAL:** Run `npm run ts:check` and `npm run test` — all existing tests must pass without changes.

---

### Step 3: Export the theme system from the lib barrel

**File:** `src/components/lib/index.ts`

**Changes:**

Add the theme export so consumers can access the system if needed:

```ts
export { nordSystem } from "./theme";
```

**Verification MANUAL:** Run `npm run build` — the production build must complete without errors.

---

### Step 4: Visual verification

**Verification MANUAL:** Run `npm run dev`, open the app, and toggle between light and dark modes. Confirm:
- Light mode uses `#eceff4` as the page background and `#2e3440` as text.
- Dark mode uses `#2e3440` as the page background and `#eceff4` as text.
- The `ColorModeButton` (if visible) and any Chakra UI components adopt the Nord palette.
