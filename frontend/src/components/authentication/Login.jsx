import { useState } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  Username: yup.string().required(),
  Password: yup.string().required(),
});

export default function Login({ setSubmitStatus, submit }) {
  const [validated, setValidated] = useState(false);

  function validateForm(event) {
    if (event.currentTarget.checkValidity() === true) {
      setSubmitStatus(true);
      setValidated(true);
    }
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: "all" });

  const onSubmit = (event) => console.log(event);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
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
