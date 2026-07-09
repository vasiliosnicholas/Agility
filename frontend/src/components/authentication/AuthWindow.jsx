import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import Login from "./Login";
import Register from "./Register";

export default function AuthWindow() {
  const [display, setDisplay] = useState(false);
  const modes = { Login: <Login/>, Register: <Register/> };
  const [currentMode, setCurrentMode] = useState(Object.keys(modes)[0]);
  function openWindow() {
    setDisplay(true);
  }
  function closeWindow() {
    setDisplay(false);
  }

  return (
    <>
      <Button variant="primary" onClick={openWindow}>
        Login/Register
      </Button>
      <Modal
        show={display}
        onHide={closeWindow}
        size="lg"
        aria-labelledby="login-or-register-title"
        size="md"
      >
        <Modal.Header
          closeButton
          className="d-flex flex-column justify-items-center"
        >
          <Modal.Title
            id="login-or-register-title"
            className="d-flex flex-column justify-items-center"
          >
            <ButtonGroup aria-label="Login/Register Buttons">
              {Object.keys(modes).map((mode, index) => (
                <ToggleButton
                  key={index}
                  id={`radio-btn-${mode}`}
                  type="radio"
                  value={mode}
                  checked={currentMode === mode}
                  onChange={(event)=> setCurrentMode(event.currentTarget.value)}
                >
                  {mode}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modes[currentMode]}</Modal.Body>
        <Modal.Footer>
          <Button onClick={closeWindow}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
