import { useCallback, useId, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import type { SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import type { FormComponent, LoginFormData, RegisterFormData } from "../FormComponents";
import { AccountTypes } from "@shared/models/Users.ts";

const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const requiredMessage = (field: string) => `A ${field} is required to register`;
const minCharMessage = (field: string, minLength: number) =>
  `${field} must be at least ${minLength} characters`;
const schema = yup.object().shape({
  accountType: yup
    .string()
    .oneOf(Object.values(AccountTypes), "You must pick an account type."),
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

const Register: FormComponent<RegisterFormData> = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
  successfulCallback,
}) {
  const formId = useId();
  setFormId(formId);
  //ini
  if(!formData) {
    formData = {
      accountType: "Select Account Type",
      email: undefined,
      name: undefined,
      password: undefined,
      confirmPassword: undefined
    };
  }
  const { register, handleSubmit, errors } = useReactFormHook<RegisterFormData>(
    {
      setSubmitStatus,
      formData,
      setFormData,
      schema,
    }
  );
  const submitHandler = useCallback(
    async (data) => {
      if (data) {
        const response = await fetch("/api/auth/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert("Registered Account!");
          if (successfulCallback) {
            const loginData: LoginFormData = {username: data.username, password:  data.password};
            successfulCallback({data: {formName: "Login", formData: loginData}});
          }
        } else {
          alert("Registration unsuccessful");
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
      <FloatingLabel
        className="mb-3"
        controlId="account-type"
        label="Account Type"
      >
        <Form.Select
          aria-label="Select Account Type"
          defaultValue="Select Account Type"
          isInvalid={!!errors.accountType}
          aria-invalid={!!errors.accountType}
          autoFocus
          {...register("accountType")}
        >
          <option>Select Account Type</option>
          {Object.values(AccountTypes).map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.accountType?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="email" label="Email Address">
        <Form.Control
          type="email"
          placeholder="name@example.com"
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
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control
          type="password"
          placeholder="Enter a password"
          isInvalid={!!errors.password || !!errors.ConfirmPassword}
          aria-invalid={!!errors.password || !!errors.ConfirmPassword}
          {...register("password")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
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
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <Form.Control.Feedback type="invalid" role="alert">
          {errors.confirmPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

Register.formName = "Register";
export default Register;
