import type { ReactNode } from "react";

export type SelectItem<Value extends string> = {
  value: Value;
  label: string;
  icon?: ReactNode;
};
