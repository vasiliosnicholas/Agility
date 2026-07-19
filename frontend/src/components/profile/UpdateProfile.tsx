import { useCallback, useId, useState, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import type { SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import type { FormComponent, RegisterFormData } from "../FormComponents";
import { type User } from "@shared/models/Users.ts";

const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const requiredMessage = (field: string) => `A ${field} is required in order to update your account`;
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
    .required(requiredMessage("password"))
    .min(MIN_PASSWORD_LENGTH, minCharMessage("Password", MIN_PASSWORD_LENGTH)),
  confirmPassword: yup
    .string()
    .required("You must confirm your password")
    .oneOf([yup.ref("password")], "Passwords must be identical."),
});

const fetchUserInfo = async () => {
  const response = await fetch("/api/auth/user");

  if (response.ok) {
    const user = (await response.json()) as User;
    const userData: RegisterFormData = {
      accountType: user.accountType,
      name: user.name,
      username: user.username,
      email: user.email,
      password: undefined,
      confirmPassword: undefined,
    };
    return userData;
  }
  return undefined;
};

const UpdateProfile: FormComponent<RegisterFormData> = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
  successfulCallback,
}) {
  const [initialFormData, setInitialFormData] = useState<
    RegisterFormData | undefined
  >();
  const handleSetFormData = useCallback(async () => {
    const formData = await fetchUserInfo();
    setInitialFormData(formData);
  }, [setInitialFormData]) as () => void;

  handleSetFormData();
  const formId = useId();
  setFormId(formId);
  const { register, handleSubmit, errors } = useReactFormHook<RegisterFormData>(
    {
      setSubmitStatus,
      formData: initialFormData ? initialFormData : formData,
      setFormData,
      schema,
    }
  );
  const submitHandler = useCallback(
    async (data) => {
      if (data) {
        delete data.confirmPassword;
        const response = await fetch("/api/auth/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert("Updated Account!");
          if (successfulCallback) {
            successfulCallback();
          }
        } else {
          console.log(response);
          alert("Update unsuccessful");
        }
      } else {
        alert("Nothing in form!");
      }
    },
    [successfulCallback]
  ) as SubmitHandler<RegisterFormData>;

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
          {...register("email")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Enter a username"
          isInvalid={!!errors.username}
          {...register("username")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="name" label="Full Name">
        <Form.Control
          type="text"
          placeholder="Enter your full name"
          isInvalid={!!errors.name}
          {...register("name")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control
          type="password"
          placeholder="Enter a password"
          isInvalid={!!errors.password || !!errors.ConfirmPassword}
          {...register("password")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password?.message?.toString() ||
            errors.confirmPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel
        className="mb-3"
        controlId="password-confirm"
        label="Confirm Password"
      >
        <Form.Control
          type="password"
          placeholder="Re-enter your password"
          isInvalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.confirmPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

UpdateProfile.formName = "Update Profile";
export default UpdateProfile;
