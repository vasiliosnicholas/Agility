import type React from "react";
import type { FC } from "react";

export interface FormBaseProps {
  setSubmitStatus: React.Dispatch<React.SetStateAction<boolean>>;
  formData: object | undefined;
  setFormData: React.Dispatch<React.SetStateAction<object>>;
}

export type formIdSetter =  (formId: string) => void

export interface FormComponentProps extends FormBaseProps {
  setFormId: formIdSetter;
}

export interface FormComponent extends FC<FormComponentProps> {
  (FormComponentProps: FormComponentProps): React.JSX.Element;
  formName: string;
  route: string;
}
