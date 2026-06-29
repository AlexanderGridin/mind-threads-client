# Dashboard page content

## Goal

We need to implement the content of the DashboardPage, which displays the list of threads (notes) as a grid or a list. An individual thread is represented by the card with colored border on top, and the following elements: title, sections count, pages count, and last updated.

For a reference, have a look at the following files: @prototype/prototype-code/components/dashboard/Dashboard.tsx (lines 143-204) and @prototype/prototype-code/components/dashboard/NoteCard.tsx.

We are interested only in the rendering of the threads. All fancy stuff like filtering, component displayed when no results after the filtering etc., are not in the scope of the current feature.

### High-level plan

1. Add a MindThread type to the @src/types/ folder. It should have the following structure:

```ts
type MindThread = {
    title: string;
    totalSections: number;
    totalPages: number;
    lastUpdated: string;
    color: string;
};
```

2. Add mock threads array to the @src/__mocks__/ folder. This folder should be excluded from the test coverage. The array of mock treads should have 15 items, which follow the MindThread type.

3. Add a DashboardContent component to the @src/pages/DashboardPage/components/ folder. It should contain a MindThreadCard sub-component, which should accept 2 props: thread: MindTread; onClick: (thread: MindTread) => void.

4. Cover all these new components with unit-tests.

5. Add a DashboardPageLoader component to the @src/pages/DashboardPage/components/ folder. The general idea of this component is to load the data from an API (currently out of the scope of this feature), and provide value and action objects to the child components via the React Context API. We should have 2 providers: a value provider and an action provider. The value provider should provide the threadListMode: 'list' | 'grid' ('grid' is the default one) and threads: MindThread[]. The action provider should provide the toggleThreadListMode: () => void function. Take into account that we use React Compiler in this project, so assess the necessity of memoization for context values, and implement it only if necessary. As the threads value we should use the mock data created previously. This new component should be the root one within the @src/pages/DashboardPage.tsx component.

6. Add a ThreadListModeButton component to the @src/pages/DashboardPage/components/DashboardHeader/components/ folder, and integrate it with the toggleThreadListMode action from the DashboardPageLoader action context. It should look in the same way as the @src/components/lib/color-mode/components/ColorModeButton/ColorModeButton.tsx component with the difference in the icon, so it correctly reflects the mode, which is currently selected.

7. Cover this new component with unit-tests.

8. Add a MindTreadList component that should use the MindTreadCard component, and should be integrated with the threadListMode valude provided by the value context of the DashboardPageLoader.

9. Cover this new component with unit-tests.

If you find any uncertainties, inconsistencies, or have any concerns or questions, please ask the developer first before creating the final plan.

## References

- @prototype/prototype-code/components/dashboard/Dashboard.tsx
- @prototype/prototype-code/components/dashboard/NoteCard.tsx
- @src/pages/DashboardPage/components/
- @src/pages/DashboardPage/components/
- @src/pages/DashboardPage.tsx
- @src/pages/DashboardPage/components/DashboardHeader/components/
- @src/components/lib/color-mode/components/ColorModeButton/ColorModeButton.tsx
