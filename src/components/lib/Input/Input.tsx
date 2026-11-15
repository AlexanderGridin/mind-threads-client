import { forwardRef } from "react";
import { Input as ChakraInput, Field } from "@chakra-ui/react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import {
  INPUT_ERROR_TEXT_TEST_ID,
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
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  "aria-label"?: string;
  errorText?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label = "",
    required = false,
    errorText = "",
    "data-testid": testId,
    onChange,
    ...restProps
  } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Field.Root required={required} invalid={Boolean(errorText)}>
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
        ref={ref}
        data-testid={testId}
        onChange={handleChange}
        _hover={{ borderColor: "accent" }}
        _focus={{ borderColor: "accent", outlineColor: "accent" }}
        {...restProps}
      />

      {errorText ? (
        <Field.ErrorText
          data-testid={
            testId
              ? `${testId}__${INPUT_ERROR_TEXT_TEST_ID}`
              : INPUT_ERROR_TEXT_TEST_ID
          }
        >
          {errorText}
        </Field.ErrorText>
      ) : null}
    </Field.Root>
  );
});

Input.displayName = "Input";
