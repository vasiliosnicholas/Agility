import { useCallback, useId, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
import type { FormComponent } from "../FormComponents";

const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;

const accountTypes = [
  { name: "Manager", action: () => console.log("Manager Placeholder action") },
  {
    name: "Developer",
    action: () => console.log("Developer Placeholder action"),
  },
];
const schema = yup.object().shape({
  AccountType: yup.string().oneOf(
    accountTypes.map(({ name }) => name),
    "You must pick an account type."
  ),
  Username: yup.string().required().min(MIN_USERNAME_LENGTH),
  Email: yup.string().required().email(),
  Password: yup.string().required().min(MIN_PASSWORD_LENGTH),
  ConfirmPassword: yup
    .string()
    .required("You must confirm your password")
    .oneOf([yup.ref("Password")], "Passwords must be identical."),
});

const Register: FormComponent = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
}) {
  //TODO: Decide if we need additional fields depending on account type.
  const formId = useId();
  setFormId(formId);
  const { register, errors } = useReactFormHook({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = useCallback((event) => {
    alert("Registered Account!");
    event.preventDefault();
    event.stopPropagation();
  }, []);

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
          isInvalid={!!errors.AccountType}
          {...register("AccountType")}
        >
          <option>Select Account Type</option>
          {accountTypes.map((type, index) => (
            <option key={index} value={type.name}>
              {type.name}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.AccountType?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="email" label="Email Address">
        <Form.Control
          type="email"
          placeholder="name@example.com"
          autoFocus
          isInvalid={!!errors.Email}
          {...register("Email")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.Email?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Enter a username"
          isInvalid={!!errors.Username}
          {...register("Username")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.Username?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control
          type="password"
          placeholder="Enter a password"
          isInvalid={!!errors.Password || !!errors.ConfirmPassword}
          {...register("Password")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.Password?.message?.toString() ||
            errors.ConfirmPassword?.message?.toString()}
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
          isInvalid={!!errors.ConfirmPassword}
          {...register("ConfirmPassword")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.ConfirmPassword?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

Register.formName = "Register";
Register.route = "";
export default Register;
