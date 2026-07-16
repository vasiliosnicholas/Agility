import { useCallback, useId, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
import type { FormComponent, LoginFormData } from "../FormComponents";

const schema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().required(),
});

const Login: FormComponent<LoginFormData> = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
}) {
  const formId = useId();
  setFormId(formId);
  const { register, errors } = useReactFormHook<LoginFormData>({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (formData) {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          alert("Logged in!");
        } else {
          console.error(response);
          alert("Login unsuccessful");
        }
      } else {
        alert("Nothing in form!");
      }
    },
    [formData]
  ) as SubmitEventHandler<HTMLFormElement>;


  return (
    <Form id={formId} noValidate onSubmit={onSubmit}>
      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Username"
          autoFocus
          isInvalid={!!errors.username}
          {...register("username")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.username?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control
          type="password"
          placeholder="Password"
          isInvalid={!!errors.password}
          {...register("password")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

Login.formName = "Login";
export default Login;
