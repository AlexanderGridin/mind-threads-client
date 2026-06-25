# Dashboard page and its Header

## Goal

We need to create a Dashboard page with the DashboardHeader component related to it.
This new page is a replacement of the HomePage that we currently have, so we need to remove the old page in the end.
The actual content of this page is not in the scope of the current feature. We are interested only in creation of the page itself with its header.

### High-level plan

1. Create the DashboardPage component within the folder @src/pages/ following to our code conventions.
2. Create the DashboardHeader component within the folder @src/pages/DashboardPage/components/ following to our code conventions. For the reference of the layout and the content of this component, please look at the file @prototype/prototype-code/components/dashboard/Dashboard.tsx . Currently, we need only the application icon and name on the left-hand side, and the color mode switching button on the right-hand side. Make sure, that only Chakra components, wrapped in our own adapters, are used.
3. Make sure, that the @src/components/lib/color-mode/components/ColorModeButton/ColorModeButton.tsx component follows the colors of the secondary button, which reference can be found within the file @src/pages/ColorsDemoPage/ColorsDemoPage.tsx
4. Cover the newly added functionality with the unit-tests.

## References

- @src/pages/
- @src/pages/DashboardPage/components/
- @prototype/prototype-code/components/dashboard/Dashboard.tsx
- @src/components/lib/color-mode/components/ColorModeButton/ColorModeButton.tsx
- @src/pages/ColorsDemoPage/ColorsDemoPage.tsx
