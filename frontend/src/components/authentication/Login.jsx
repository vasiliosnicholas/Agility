import { useState } from "react";
import { Form, FloatingLabel } from "react-bootstrap";

export default function Login() {
  return (
    <Form>
      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control type="text" placeholder="Username" autoFocus />
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control type="password" placeholder="Password" />
      </FloatingLabel>
    </Form>
  );
}
