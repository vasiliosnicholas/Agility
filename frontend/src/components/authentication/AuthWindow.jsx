import { useState, useRef } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import Login from "./Login";
import Register from "./Register";

//TODO: Add Manage Account, Delete Account, and possibly Logout

export default function AuthWindow() {
  const [formValid, setFormValid] = useState(false);
  const [display, setDisplay] = useState(false);
  const modes = [
    { name: "Login", Component: Login, route: "placeholder"},
    { name: "Register", Component: Register, route: "placeholder"},
  ];
  // const [formsData, setFormsData] = useState(modes.map(() => undefined));
  const formsData = useRef(modes.map(() => undefined));
  const [currentMode, setCurrentMode] = useState(0);
  function openWindow() {
    setDisplay(true);
  }
  function closeWindow() {
    setDisplay(false);
  }
  const CurrentComponent = modes[currentMode].Component;
  
  function setFormData(formData) {
    formsData.current[currentMode] = formData;
  }

  function onSubmit() {
    //add routes here
    console.log(formsData.current[currentMode]);
    //if response successful
    closeWindow();
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
        <Modal.Header className="justify-content-center">
          <Modal.Title id="login-or-register-title">
            <ButtonGroup aria-label="Login/Register Buttons">
              {modes.map(({ name }, index) => (
                <ToggleButton
                  key={index}
                  id={`radio-btn-${name}`}
                  type="radio"
                  value={index}
                  checked={currentMode == index}
                  onChange={(event) => {
                    setCurrentMode(event.currentTarget.value);
                    setFormValid(false);
                  }}
                >
                  {name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CurrentComponent setSubmitStatus={setFormValid} formData={formsData.current[currentMode]} setFormData={setFormData} />
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button onClick={closeWindow} variant="danger">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            variant="primary"
            type="Submit"
            disabled={!formValid}
          >
            {modes[currentMode].name}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
