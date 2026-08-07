import { type JSX, useEffect } from "react";
import AuthWindow from "../components/authentication/AuthWindow.tsx";
import Login from "../components/authentication/Login.tsx";
import Register from "../components/authentication/Register.tsx";
import { Modal } from "react-bootstrap";
import AgilityLogo from "../components/AgilityLogo.tsx";

const elementAlignment = "justify-content-center";

const textAlignment = "text-center";

interface LoginPageProps {
  defaultTitle?: string;
  children?: JSX.Element;
}

export default function LoginPage({
  defaultTitle = "You need an account to access this content",
  children,
}: LoginPageProps) {
  useEffect(() => {
    document.title = `Agility | Login`;
  }, []);
  return (
    <div className="kanban-page">
      <Modal show centered size="lg" className="kanban-modal">
        <Modal.Header className={`${elementAlignment} modal-header`}>
          <h1 className={`${textAlignment} modal-title`}>
            {`${
              window.location.hash ? "You have been signed out" : defaultTitle
            }`}
          </h1>
        </Modal.Header>
        <Modal.Body className={`${elementAlignment} modal-body`}>
          {children ? (
            children
          ) : (
            <h2 className={textAlignment}>
              Please login{!window.location.hash ? " or register" : ""} to
              continue
            </h2>
          )}
        </Modal.Body>

        <Modal.Footer className={`${elementAlignment} modal-footer`}>
          <AuthWindow
            Modes={window.location.hash ? [Login] : [Login, Register]}
          ></AuthWindow>
        </Modal.Footer>
      </Modal>
      <AgilityLogo className="agility-logo-splash"/>
    </div>
  );
}
