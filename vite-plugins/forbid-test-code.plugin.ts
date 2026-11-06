import type { Plugin } from "vite";

const TEST_CODE_PATTERN =
  /\/(__tests__|__mocks__|__test-fixtures__)\/|\.(test|spec)\.[cm]?[jt]sx?(\?|$)|\/node_modules\/(@testing-library|@vitest|vitest)\//;

export const findTestModules = (moduleIds: string[]) => {
  return moduleIds.filter((moduleId) => {
    return TEST_CODE_PATTERN.test(moduleId);
  });
};

export const forbidTestCode = (): Plugin => {
  return {
    name: "forbid-test-code",
    generateBundle(_options, bundle) {
      const moduleIds = Object.values(bundle).flatMap((item) => {
        return item.type === "chunk" ? Object.keys(item.modules) : [];
      });

      const testModules = findTestModules(moduleIds);

      if (testModules.length) {
        this.error(
          `Production build includes test code:\n${testModules.join("\n")}`
        );
      }
    },
  };
};
