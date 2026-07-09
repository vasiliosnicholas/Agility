import { useState } from "react";
import { Form, FloatingLabel } from "react-bootstrap";

const accountTypes = [
  { name: "Manager", action: () => console.log("Manager Placeholder action") },
  {
    name: "Developer",
    action: () => console.log("Developer Placeholder action"),
  },
];

export default function Register() {
  const [selectedAccountType, setAccountType] = useState(undefined);
  return (
    <Form>
      <FloatingLabel
        className="mb-3"
        controlId="account-type"
        label="Account Type"
      >
        <Form.Select aria-label="Select Account Type" defaultValue={undefined}>
          <option isInvalid>Select Account Type</option>
          {accountTypes.map((type, index) => (
            <option key={type.name} value={type.name}>{type.name}</option>
          ))}
        </Form.Select>
      </FloatingLabel>

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
