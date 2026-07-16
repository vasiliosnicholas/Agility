import type React from "react";
import type { FC } from "react";
import type { BaseUser, User } from "@shared/models/Users.ts";
import type { FieldValues } from "react-hook-form";

export interface FormBaseProps<FormDataType extends FormData> {
  setSubmitStatus: React.Dispatch<React.SetStateAction<boolean>>;
  formData: FormDataType | undefined;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export type formIdSetter = (formId: string) => void;

export interface FormComponentProps<
  FormDataType,
> extends FormBaseProps<FormDataType> {
  setFormId: formIdSetter;
}

export interface FormComponent<FormDataType extends FormData> extends FC<
  FormComponentProps<FormDataType>
> {
  (FormComponentProps: FormComponentProps<FormDataType>): React.JSX.Element;
  formName: string;
}

export type FormData = FieldValues;

export interface LoginFormData
  extends FormData, Partial<Pick<User, "username" | "password">> {}
export interface RegisterFormData extends FormData, Partial<BaseUser> {
  confirmPassword?: string;
}
