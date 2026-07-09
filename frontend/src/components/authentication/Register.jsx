import { useState } from "react";
import { Form, FloatingLabel } from "react-bootstrap";

export default function Register() {
  return (
    <Form>
      <FloatingLabel className="mb-3" controlId="email" label="Email Address">
        <Form.Control type="email" placeholder="name@example.com" autoFocus />
      </FloatingLabel>

      <FloatingLabel className="mb-3" controlId="username" label="Username">
        <Form.Control type="text" placeholder="Enter a username" />
      </FloatingLabel>
      <FloatingLabel className="mb-3" controlId="password" label="Password">
        <Form.Control type="password" placeholder="Enter a password" />
      </FloatingLabel>
      <FloatingLabel
        className="mb-3"
        controlId="password-confirm"
        label="Confirm Password"
      >
        <Form.Control type="password" placeholder="Re-enter your password" />
      </FloatingLabel>
    </Form>
  );
}
