import type { FC, JSX } from "react";
import type { BaseUser, User, UserPrototype } from "@shared/models/Users.ts";
import type { FieldValues } from "react-hook-form";
import type { FormComponent, FormData } from "./FormComponents";
import type { ButtonProps } from "react-bootstrap";

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

export interface UpdateFormData extends Partial<UserPrototype> {
  newPassword?: string;
  confirmNewPassword?: string;
}

interface FormWindowComponentProps
  extends
    ButtonProps,
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {
  Forms: FormComponent<FormData>[];
  ModalButton?: FC<ButtonProps>;
  initialFormsData?: FormData[] | undefined;
}

export interface FormWindowComponent extends FC<FormWindowComponentProps> {
  (Props: FormWindowComponentProps): JSX.Element;
}