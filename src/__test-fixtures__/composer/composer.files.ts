import { vi } from "vitest";

export const PNG_FILE_NAME = "dot.png";
export const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

const PNG_BYTES = new Uint8Array([137, 80, 78, 71]);

type CreateTestFileParams = {
  type: string;
  name?: string;
};

export const createTestFile = ({
  type,
  name = "file",
}: CreateTestFileParams) => {
  return new File([PNG_BYTES], name, { type });
};

export const createPngFile = () => {
  return createTestFile({ type: "image/png", name: PNG_FILE_NAME });
};

export const createTextFile = () => {
  return new File(["notes"], "notes.txt", { type: "text/plain" });
};

export const mockFileReaderError = () => {
  return vi
    .spyOn(FileReader.prototype, "readAsDataURL")
    .mockImplementation(function (this: FileReader) {
      this.dispatchEvent(new ProgressEvent("error"));
    });
};
