import type { FC, JSX } from "react";
import type { BaseUser, User } from "@shared/models/Users.ts";
import type { FieldValues } from "react-hook-form";
import type { FormComponent, FormData } from "./FormComponents";

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
  successfulCallback: (route?: string) => void;
}

export interface FormComponent<FormDataType extends FormData> extends FC<
  FormComponentProps<FormDataType>
> {
  (FormComponentProps: FormComponentProps<FormDataType>): JSX.Element;
  formName: string;
}

export type FormData = FieldValues;

export interface LoginFormData
  extends FormData, Partial<Pick<User, "username" | "password">> {}
export interface RegisterFormData extends FormData, Partial<BaseUser> {
  confirmPassword?: string;
}
type FormWindowComponentProps = { Modes: FormComponent<FormData>[] };

export interface FormWindowComponent extends FC<FormWindowComponentProps> {
  (Props: FormWindowComponentProps): JSX.Element;
}
