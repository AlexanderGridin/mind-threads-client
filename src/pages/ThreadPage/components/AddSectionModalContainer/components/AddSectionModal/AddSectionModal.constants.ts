import { DEFAULT_SWATCH_COLOR } from "@/components/lib/ColorPicker/ColorPicker.constants";
import type { ThreadSectionValue } from "@/types";

export const ADD_SECTION_MODAL_TITLE = "Add new section";
export const ADD_SECTION_SUBMIT_LABEL = "Add";

export const DEFAULT_SECTION_FORM_VALUE: ThreadSectionValue = {
  name: "",
  color: DEFAULT_SWATCH_COLOR,
};
