import { useCallback, useId, type SubmitEventHandler } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
import type { FormComponent } from "../FormComponents";

const schema = yup.object().shape({
  Username: yup.string().required(),
  Password: yup.string().required(),
});

const Login: FormComponent = function ({
  setSubmitStatus,
  formData,
  setFormId,
  setFormData,
}) {
  const formId = useId();
  setFormId(formId);
  const { register, errors } = useReactFormHook({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = useCallback((event) => {
    alert("Logged in! Login");
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <Form id={formId} noValidate onSubmit={onSubmit}>
      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Username"
          autoFocus
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
          placeholder="Password"
          isInvalid={!!errors.Password}
          {...register("Password")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.Password?.message?.toString()}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
};

Login.formName = "Login";
Login.route = "";
export default Login;
