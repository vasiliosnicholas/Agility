import { useState } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import Login from "./Login";
import Register from "./Register";

//TODO: Add Manage Account, Delete Account, and possibly Logout

export default function AuthWindow() {
  const [formValid, setFormValid] = useState(false);
  const [display, setDisplay] = useState(false);
  const modes = {
    Login: <Login setSubmitStatus={setFormValid} />,
    Register: <Register setSubmitStatus={setFormValid} />,
  };
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
        Login | Register
      </Button>
      <Modal
        show={display}
        size="lg"
        aria-labelledby="login-or-register-title"
        size="md"
        centered
      >
        <Modal.Header className="d-flex flex-column justify-items-center">
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
                  onChange={(event) => {
                    setCurrentMode(event.currentTarget.value);
                    setFormValid(false);
                  }}
                >
                  {mode}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{modes[currentMode]}</Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button onClick={closeWindow} variant="danger">
            Cancel
          </Button>
          <Button
            onClick={closeWindow}
            variant="primary"
            type="Submit"
            disabled={!formValid}
          >
            {currentMode}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
