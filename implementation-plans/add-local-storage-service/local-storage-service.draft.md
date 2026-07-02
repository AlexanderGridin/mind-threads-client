# Local storage service

## Goal

I want to add a `useLocalStorage(key: string)` service hook, which should live within the @src/services/ folder (the folder itself needs to be created). The return value of the hook should be an object with the following fields:
- read() -> returns a value associated with the local storage key;
- set(newValue) -> sets a new value to the local storage under the associated key;
- update((prevValue) => updatedValue) -> sets a new value to the local storage based on the current one.

The hook instel should support generic typing and be a stateless. However, it should support caching of the value via the useRef() hook. The general idea is that we don't read an actual value from the local storage by the key untill the first call of the `read()` method. When the `read()` method is called for the first time, we read the data from the local storage, cache it within the ref, and pass it to the consumer. On further reads we should return the cached value. When the consumer sets or updates the value, we need to update the chached value. On a high-level this follows the signals behavior from the Angular framework.

### High-level plan

1. Implement the useLocalStorage(key) hook.
2. Cover it with unit-tests.

If you find any uncertainties, inconsistencies, or have any concerns or questions, please ask the developer first before creating the final plan.

## References

No references for this feature.
