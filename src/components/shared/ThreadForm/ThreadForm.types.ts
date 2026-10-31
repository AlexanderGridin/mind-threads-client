import type { NewMindThread } from "@/types";

export type ThreadFormValue = NewMindThread;

export type ThreadFormProps = {
  value: ThreadFormValue;
  onChange: (value: ThreadFormValue) => void;
  disabled?: boolean;
};
