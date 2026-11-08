type ThreadFormModalActionsBaseProps = {
  submitLabel: string;
  submitDisabled: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
};

type SubmitOnClickProps = {
  onSubmit: () => void;
  formId?: never;
};

type SubmitFormProps = {
  formId: string;
  onSubmit?: never;
};

export type ThreadFormModalActionsProps = ThreadFormModalActionsBaseProps &
  (SubmitOnClickProps | SubmitFormProps);
