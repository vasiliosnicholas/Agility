import { Container } from "react-bootstrap";
import AuthWindow from "../components/authentication/AuthWindow.tsx";
export default function Login() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <main className="d-flex flex-column align-items-center justify-content-center bg-warning rounded-2 p-3">
        <header className="d-flex flex-column align-items-center bg-body rounded-2 p-2">
          <h1 className="text-center">
            {" "}
            {`${
              window.location.hash ? "You have been signed out" : "Unauthorized"
            }`}
          </h1>
          <h2>
            Please login{!window.location.hash ? " or register" : ""} to
            continue
          </h2>
        </header>

        <AuthWindow></AuthWindow>
      </main>
    </Container>
  );
}
