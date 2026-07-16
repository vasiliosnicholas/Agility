import { Container } from "react-bootstrap";
import AuthWindow from "../components/authentication/AuthWindow.tsx";
export default function Login() {
  return (
    <Container className="d-flex flex min-vh-100">
      <AuthWindow></AuthWindow>;
    </Container>
  );
}
