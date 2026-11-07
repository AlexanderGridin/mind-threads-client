import { beforeEach, describe, expect, it, vi } from "vitest";
import { findTestModules, forbidTestCode } from "../forbid-test-code.plugin";

type GenerateBundleHook = (
  this: { error: (message: string) => void },
  options: unknown,
  bundle: unknown
) => void;

const error = vi.fn();

const runGenerateBundle = (moduleIds: string[]) => {
  const generateBundle = forbidTestCode()
    .generateBundle as unknown as GenerateBundleHook;

  const modules = Object.fromEntries(
    moduleIds.map((moduleId) => {
      return [moduleId, {}];
    })
  );

  generateBundle.call(
    { error },
    {},
    {
      "assets/index.js": { type: "chunk", modules },
      "assets/index.css": { type: "asset" },
    }
  );
};

const detectedModuleIds = [
  "src/components/lib/Button/__tests__/Button.tsx",
  "src/utils/math.test.ts",
  "src/utils/math.spec.ts",
  "src/utils/math.test.ts?v=1",
  "src/__mocks__/api.ts",
  "src/__test-fixtures__/threads.ts",
  "src/components/lib/__test-fixtures__/renderWithUIProvider.ts",
  "/project/node_modules/@testing-library/react/dist/index.js",
  "/project/node_modules/@vitest/runner/dist/index.js",
  "/project/node_modules/vitest/dist/index.js",
];

const notDetectedModuleIds = [
  "src/pages/DashboardPage/DashboardPage.tsx",
  "src/utils/latest.tsx",
  "/project/node_modules/react/index.js",
];

describe("forbidTestCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findTestModules", () => {
    it.each(detectedModuleIds)("detects %s as test code", (moduleId) => {
      const testModules = findTestModules([moduleId]);

      expect(testModules).toStrictEqual([moduleId]);
    });

    it.each(notDetectedModuleIds)(
      "does not detect %s as test code",
      (moduleId) => {
        const testModules = findTestModules([moduleId]);

        expect(testModules).toStrictEqual([]);
      }
    );
  });

  describe("generateBundle", () => {
    it("does not call error when the bundle has no test code", () => {
      runGenerateBundle([notDetectedModuleIds[0]]);

      expect(error).not.toHaveBeenCalled();
    });

    it("calls error once with the module path when a chunk has test code", () => {
      const testModuleId =
        "src/components/lib/Button/__tests__/Button.test.tsx";

      runGenerateBundle([notDetectedModuleIds[0], testModuleId]);

      expect(error).toHaveBeenCalledTimes(1);

      const [errorMessage] = error.mock.calls[0];

      expect(errorMessage).toContain(testModuleId);
    });
  });
});
