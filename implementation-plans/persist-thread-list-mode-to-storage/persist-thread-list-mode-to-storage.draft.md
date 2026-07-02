# Persist thread list mode to the local storage

## Goal

Within the file DashboardPageLoader.tsx we need to integrate the treadListMode with the local storage, so the treadListMode value is stored when it doesn't exist within the storage or was changed from the UI.

During this integration you should use a useLocalStorage hook from the local-storage.hooks.ts file.

### High-level plan

1. Integrate the DashboardPageLoader component with the useLocalStorage hook, so the threadListMode value is stored and retreived from the storage properly.

2. Add/update any necessary/affected unit-tests.

## References

- DashboardPageLoader.tsx
- local-storage.hooks.ts
