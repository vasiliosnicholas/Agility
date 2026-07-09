import { useState } from "react";
import { Form } from "react-bootstrap";

export default function Register() {
  return (
    <Form>
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email Address</Form.Label>
        <Form.Control type="email" placeholder="name@example.com" autoFocus/>
      </Form.Group>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" placeholder="Enter a username" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Enter a password" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password-check">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" placeholder="Re-enter your password"/>
      </Form.Group>
    </Form>
  );
}
