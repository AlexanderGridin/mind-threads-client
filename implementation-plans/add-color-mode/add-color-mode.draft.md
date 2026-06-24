# Adding a color mode

## Goal

We need to add the support of switching between the dark and light themes using the possibilities provided by the Chakra UI. We already have an appropriate snippet installed. We need to adapt it to our code base and conventions and add the toggle theme button to the App.tsx component. Also, we need to add some UI components to be able to test switching of the color modes.

### High-level plan

1. Refactor the code within the file @src/components/ui/color-mode.tsx
    - The code from this file should be moved to the @src/components/lib/color-mode folder. 
    - The code from this file should be split according to the entity type, so all types are placed within the `.type.ts` file, hooks are placed within the `.hooks.ts` file etc.

2. Integrate the color-mode logic with the existing code, according to the guide that we have within the file @.doc/Dark-mode-guide.md.

3. Add the tooggle button to switch the color theme to the @src/App.tsx file.

4. Add several theme dependant components to the @src/pages/HomePage/HomePage.tsx component, to be able to manually test the changes that were made.

5. Cover all new functionality with unit-tests.

## Referecnes

- @src/components/ui/color-mode.tsx
- @.doc/Dark-mode-guide.md
- @src/App.tsx
- @src/pages/HomePage/HomePage.tsx
