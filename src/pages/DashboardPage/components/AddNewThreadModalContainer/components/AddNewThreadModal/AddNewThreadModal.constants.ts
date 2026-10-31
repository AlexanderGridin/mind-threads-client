import { NORD_AURORA_SWATCHES } from "@/components/lib/ColorPicker/ColorPicker.constants";
import type { ThreadFormValue } from "@/components/shared";

export const ADD_NEW_THREAD_MODAL_TITLE = "Add new thread";
export const ADD_BUTTON_LABEL = "Add";

export const DEFAULT_THREAD_FORM_VALUE: ThreadFormValue = {
  title: "",
  color: NORD_AURORA_SWATCHES[3],
};
