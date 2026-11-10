import { DEFAULT_SWATCH_COLOR } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { DEFAULT_PAGE_TYPE } from "@/pages/ThreadPage/ThreadPage.constants";
import type { SectionPageValue } from "@/types";

export const ADD_PAGE_MODAL_TITLE = "Add new page";
export const ADD_PAGE_SUBMIT_LABEL = "Add";

export const DEFAULT_PAGE_FORM_VALUE: SectionPageValue = {
  name: "",
  type: DEFAULT_PAGE_TYPE,
  color: DEFAULT_SWATCH_COLOR,
};
