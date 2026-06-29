# Refactor: Replace Chakra UI components with adapters

## Goal

According to our code conventions, we need to use thin adapters for Chakra UI components. The current implementation of the feature directly use Chakra UI components, which violates this rule. We need to fix this.

### High-level plan

1. Look at the current Git diff and inspect all non `.test.` files.
2. Identify a direct usage of Chakra UI components.
3. Create thin adapters (according to our code conventions) within the @src/components/lib/ folder for the use cases identified.
4. Replace the direct usage of Chakra UI components with their thin adapters.
5. Cover these new adapters with unit-tests.

## References

- @src/components/lib/
- @src/components/lib/Button/Button.tsx - an example of the thin adapter
- @src/components/lib/HStack/HStack.tsx - an example of the thin adapter
