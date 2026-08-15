/* eslint-disable @typescript-eslint/no-base-to-string */
import { useCallback, useId, useState, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import type { SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import type { FormComponent, UpdateFormData } from "../FormComponents";
import { type User } from "@shared/models/Users.ts";

const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const requiredMessage = (field: string) =>
  `A ${field} is required in order to update your account`;
const minCharMessage = (field: string, minLength: number) =>
  `${field} must be at least ${minLength} characters`;
const schema = yup.object().shape({
  username: yup
    .string()
    .required(requiredMessage("username"))
    .min(MIN_USERNAME_LENGTH, minCharMessage("Username", MIN_USERNAME_LENGTH)),
  name: yup.string().required("Please enter your full name"),
  email: yup.string().required(requiredMessage("email")).email(),
  password: yup
    .string()
    .required("Your current password is required to update your account")
    .min(MIN_PASSWORD_LENGTH, minCharMessage("Password", MIN_PASSWORD_LENGTH)),
  newPassword: yup
    .string()
    .optional()
    .trim()
    .transform((value: string) => (value === "" ? undefined : value))
    .min(
      MIN_PASSWORD_LENGTH,
      minCharMessage("New password", MIN_PASSWORD_LENGTH)
    ),
  confirmNewPassword: yup
    .string()
    .trim()
    .transform((value: string) => (value === "" ? undefined : value))
    .when("newPassword", {
      is: (newPassword: string) => newPassword && newPassword.trim().length > 0,
      then: (schema) => schema.required("You must confirm your new password"),
      otherwise: (schema) => schema.notRequired(),
    })
    .oneOf([yup.ref("newPassword")], "Passwords must be identical."),
});

const fetchUserInfo = async () => {
  const response = await fetch("/api/auth/user");

  if (response.ok) {
    const user = (await response.json()) as User;
    const userData: UpdateFormData = {
      name: user.name,
      username: user.username,
      email: user.email,
      password: undefined,
      newPassword: undefined,
      confirmNewPassword: undefined,
    };
    return userData;
  }
  return undefined;
};

const UpdateProfile: FormComponent<UpdateFormData> = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
  successfulCallback,
}) {
  const [initialFormData, setInitialFormData] = useState<
    UpdateFormData | undefined
  >();
  const handleSetFormData = useCallback(async () => {
    const formData = await fetchUserInfo();
    setInitialFormData(formData);
  }, [setInitialFormData]) as () => void;

  handleSetFormData();
  const formId = useId();
  setFormId(formId);
  const { register, handleSubmit, errors } = useReactFormHook<UpdateFormData>({
    setSubmitStatus,
    formData: initialFormData ? initialFormData : formData,
    setFormData,
    schema,
  });

  const submitHandler = useCallback(
    async (data) => {
      if (data) {
        const response = await fetch("/api/auth/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert("Updated Account!");
          if (successfulCallback) {
            successfulCallback({
              closeFormWindow: true,
              route: window.location.href,
            });
          }
        } else {
          alert("Update unsuccessful");
        }
      } else {
        alert("Nothing in form!");
      }
    },
    [successfulCallback]
  ) as SubmitHandler<UpdateFormData>;

  return (
    <Form
      id={formId}
      noValidate
      onSubmit={
        handleSubmit(submitHandler) as SubmitEventHandler<HTMLFormElement>
      }
      className="modal-form"
    >
      <FloatingLabel className="mb-3" controlId="email" label="Email Address">
        <Form.Control
          type="email"
          placeholder="name@example.com"
          autoFocus
          isInvalid={!!errors.email}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.email?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Enter a username"
          isInvalid={!!errors.username}
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.username?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="name" label="Full Name">
        <Form.Control
          type="text"
          placeholder="Enter your full name"
          isInvalid={!!errors.name}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.name?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Current Password">
        <Form.Control
          type="password"
          placeholder="Enter your current password"
          isInvalid={!!errors.password}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.password?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="New Password">
        <Form.Control
          type="password"
          placeholder="Enter a new password"
          isInvalid={!!errors.newPassword || !!errors.confirmNewPassword}
          aria-invalid={!!errors.newPassword || !!errors.confirmNewPassword}
          {...register("newPassword")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.newPassword?.message?.toString() ||
            errors.confirmNewPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel
        className="mb-3"
        controlId="password-confirm"
        label="Confirm New Password"
      >
        <Form.Control
          type="password"
          placeholder="Re-enter your password"
          isInvalid={!!errors.confirmNewPassword}
          aria-invalid={!!errors.confirmNewPassword}
          {...register("confirmNewPassword")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.confirmNewPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

UpdateProfile.formName = "Update Profile";
export default UpdateProfile;
