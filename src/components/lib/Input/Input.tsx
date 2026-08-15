import { Input as ChakraInput, Field } from "@chakra-ui/react";
import type { ChangeEvent } from "react";
import {
  INPUT_LABEL_TEST_ID,
  INPUT_REQUIRED_INDICATOR_TEST_ID,
} from "./Input.constants";

export type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "search";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "subtle" | "flushed";
  disabled?: boolean;
  name?: string;
  id?: string;
  "data-testid"?: string;
};

export const Input = ({
  label = "",
  required = false,
  "data-testid": testId,
  onChange,
  ...restProps
}: InputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Field.Root required={required}>
      {label ? (
        <Field.Label
          data-testid={
            testId ? `${testId}__${INPUT_LABEL_TEST_ID}` : INPUT_LABEL_TEST_ID
          }
        >
          {label}
          {required ? " " : ""}
          {/* Appearance of the RequiredInidicator is controlled by the "required" prop of the Field.Root */}
          <Field.RequiredIndicator
            data-testid={
              testId
                ? `${testId}__${INPUT_REQUIRED_INDICATOR_TEST_ID}`
                : INPUT_REQUIRED_INDICATOR_TEST_ID
            }
          />
        </Field.Label>
      ) : null}

      <ChakraInput
        data-testid={testId}
        onChange={handleChange}
        _hover={{ borderColor: "accent" }}
        _focus={{ borderColor: "accent", outlineColor: "accent" }}
        {...restProps}
      />
    </Field.Root>
  );
};
