import type React from "react";
import type { FC } from "react";

export interface AuthFormComponentProps {
  setSubmitStatus: React.Dispatch<React.SetStateAction<boolean>>;
  formData: object | undefined;
  setFormData: React.Dispatch<React.SetStateAction<object>>;
}

export interface AuthFormComponent extends FC<AuthFormComponentProps> {
  (AuthFormComponentProps: AuthFormComponentProps): React.JSX.Element;
  formName: string;
  formId: string;
  route: string;
}
