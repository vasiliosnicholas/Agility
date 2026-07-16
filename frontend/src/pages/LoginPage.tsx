import { Container } from "react-bootstrap";
import AuthWindow from "../components/authentication/AuthWindow.tsx";
export default function Login() {
  return (
    <Container className="d-flex flex-column min-vh-100 align-items-center">
      <h1 className="text-center"> You have been signed out</h1>
      <AuthWindow></AuthWindow>
    </Container>
  );
}
