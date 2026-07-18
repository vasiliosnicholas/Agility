import { useState, useRef, useCallback } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import type {
  FormData,
  formIdSetter,
  FormWindowComponent,
} from "./FormComponents.d.ts";

//TODO: Add Manage Account, Delete Account, and possibly Logout

function successfulCallback(route: string | undefined) {
  if (route) window.location.href = route;
}

const FormWindow: FormWindowComponent = ({ Modes}) => {
  const [formValid, setSubmitStatus] = useState(false);
  const [display, setDisplay] = useState(false);
  const formsData = useRef<Array<FormData> | Array<undefined>>(
    Modes.map(() => undefined)
  );
  const [currentMode, setCurrentMode] = useState(0);
  const formId = useRef<string>("");

  const setFormId: formIdSetter = useCallback(
    (newId) => {
      formId.current = newId;
    },
    [formId]
  );

  //current form component to display.
  const CurrentFormComponent = Modes[currentMode];

  //prevent redefinitions of setFormData using memomization
  const setFormData = useCallback(
    (formData: FormData) => {
      formsData.current[currentMode] = formData;
    },
    [formsData, currentMode]
  );

  const openWindow = useCallback(() => {
    setDisplay(true);
  }, [setDisplay]);
  const closeWindow = useCallback(() => {
    setDisplay(false);
  }, [setDisplay]);

  return (
    <>
      <Button variant="primary" onClick={openWindow} className="modal-submit">
        {Modes.map(({ formName }) => formName).join(" | ")}
      </Button>
      <Modal
        show={display}
        size="lg"
        aria-labelledby="login-or-register-title"
        onHide={closeWindow}
        centered
        className="kanban-modal"
      >
        <Modal.Header className="justify-content-center modal-header">
          <Modal.Title id="login-or-register-title" className="modal-title">
            <ButtonGroup aria-label="Login/Register Buttons">
              {Modes.map(({ formName }, index) => (
                <ToggleButton
                  key={index}
                  id={`radio-btn-${formName}`}
                  type="radio"
                  value={index}
                  checked={currentMode == index}
                  onChange={(event) =>
                    setCurrentMode(parseInt(event.currentTarget.value))
                  }
                  className="modal-submit"
                >
                  {formName}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CurrentFormComponent
            setSubmitStatus={setSubmitStatus}
            formData={
              formsData.current[
                currentMode
              ] /*FIXME: this works because only want to re-render child. 
              Figure out how to get rid of this error */
            }
            setFormData={setFormData}
            setFormId={setFormId}
            successfulCallback={successfulCallback}
          />
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button onClick={closeWindow} variant="danger" className="modal-cancel">
            Cancel
          </Button>
          <Button
            form={formId.current}
            variant="primary"
            type="submit"
            disabled={!formValid}
            className="modal-submit"
          >
            {Modes[currentMode].formName}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FormWindow;
