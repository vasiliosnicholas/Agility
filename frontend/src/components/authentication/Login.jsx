import { useState } from "react";
import { Form } from "react-bootstrap";

export default function Login() {
  return (
    <Form>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" placeholder="Enter your username" autoFocus />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Enter your password"/>
      </Form.Group>
    </Form>
  );
}
