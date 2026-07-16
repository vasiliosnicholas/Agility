import { useCallback, useId, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
import type { FormComponent, RegisterFormData } from "../FormComponents";
import { AccountTypes } from "@shared/models/Users.ts";

const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;

const schema = yup.object().shape({
  accountType: yup
    .string()
    .oneOf(Object.values(AccountTypes), "You must pick an account type."),
  username: yup.string().required().min(MIN_USERNAME_LENGTH),
  name: yup.string().required("Please enter your full name"),
  email: yup.string().required().email(),
  password: yup.string().required().min(MIN_PASSWORD_LENGTH),
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
}) {
  //TODO: Decide if we need additional fields depending on account type.
  const formId = useId();
  setFormId(formId);
  const { register, errors } = useReactFormHook<RegisterFormData>({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (formData) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          alert("Registered Account!");
        } else {
          alert("Registration unsuccessful");
        }
      } else {
        alert("Nothing in form!");
      }
    },
    [formData]
  ) as SubmitEventHandler<HTMLFormElement>;
  
  return (
    <Form id={formId} noValidate onSubmit={onSubmit}>
      <FloatingLabel
        className="mb-3"
        controlId="account-type"
        label="Account Type"
      >
        <Form.Select
          aria-label="Select Account Type"
          defaultValue={undefined}
          isInvalid={!!errors.accountType}
          {...register("accountType")}
        >
          <option>Select Account Type</option>
          {Object.values(AccountTypes).map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.accountType?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

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

Register.formName = "Register";
export default Register;
