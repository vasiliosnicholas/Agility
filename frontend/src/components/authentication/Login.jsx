import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";

import * as yup from "yup";

const schema = yup.object().shape({
  Username: yup.string().required(),
  Password: yup.string().required(),
});

export default function Login({ setSubmitStatus, formData, setFormData }) {
  const { register, errors } = useReactFormHook({
    setSubmitStatus,
    formData,
    setFormData,
    schema,
  });

  return (
    <Form noValidate>
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
