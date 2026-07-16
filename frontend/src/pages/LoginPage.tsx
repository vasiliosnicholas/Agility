import { Container } from "react-bootstrap";
import AuthWindow from "../components/authentication/AuthWindow.tsx";
import Login from "../components/authentication/Login.tsx";
import Register from "../components/authentication/Register.tsx";

import { Modal, Button } from "react-bootstrap";

const elementAlignment = "justify-content-center";

const textAlignment = "text-center";

export default function LoginPage() {
  return (
    <Modal show centered size="lg">
      <Modal.Header className={elementAlignment}>
        <h1 className={textAlignment}>
          {`${
            window.location.hash ? "You have been signed out" : "Unauthorized"
          }`}
        </h1>
      </Modal.Header>
      <Modal.Body className={elementAlignment}>
        <h2 className={textAlignment}>
          Please login{!window.location.hash ? " or register" : ""} to continue
        </h2>
      </Modal.Body>
      <Modal.Footer className={elementAlignment}>
        <AuthWindow
          Modes={window.location.hash ? [Login] : [Login, Register]}
        ></AuthWindow>
      </Modal.Footer>
    </Modal>
  );
}
