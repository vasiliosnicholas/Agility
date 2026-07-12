import { useId } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";

import * as yup from "yup";

const schema = yup.object().shape({
  Username: yup.string().required(),
  Password: yup.string().required(),
});

Login.formName = "Login";
Login.formId = Login.formName;
Login.route = "";


export default function Login({ formId, setSubmitStatus, formData, setFormData }) {
  const { register, errors } = useReactFormHook({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  function onSubmit(event) {
  alert("Logged in! Login");
  event.preventDefault();
  event.stopPropagation();
}

  return (
    <Form id={Login.name} noValidate onSubmit={onSubmit}>
      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control
          type="text"
          placeholder="Username"
          autoFocus
          isInvalid={!!errors.Username}
          {...register("Username")}
        />
        <Form.Control.Feedback type="invalid">
          {errors.Username?.message}
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
          {errors.Password?.message}
        </Form.Control.Feedback>
      </FloatingLabel>
    </Form>
  );
}
