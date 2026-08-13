import { useState, useRef, useCallback } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import type {
  FormData,
  formIdSetter,
  FormWindowComponent,
} from "./FormComponents.d.ts";



function successfulCallback(route: string | undefined) {
  if (route) window.location.href = route;
}

const FormWindow: FormWindowComponent = ({ Modes, ModalButton = Button, initialFormsData, ...props}) => {
  const [formValid, setSubmitStatus] = useState(false);
  const [display, setDisplay] = useState(false);
  const formsData = useRef<Array<FormData> | Array<undefined>>(initialFormsData ? initialFormsData :
    Modes.map(() => undefined)
  );
  const [currentMode, setCurrentMode] = useState(0);
  const [formId, setFormId] = useState<string>("");

  const handleSetFormId: formIdSetter = useCallback(
    (newId) => {
      setFormId(newId);
    },
    [setFormId]
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
      <ModalButton {...props} onClick={openWindow} aria-label={Modes.map(({ formName }) => formName).join()}>
        {Modes.map(({ formName }) => formName).join(" | ")}
      </ModalButton>
      <Modal
        show={display}
        size="lg"
        aria-labelledby="form-window-title"
        onHide={closeWindow}
        centered
        className="kanban-modal"
      >
        <Modal.Header className="justify-content-center modal-header">
          <Modal.Title id="form-window-title" className="modal-title">
            <ButtonGroup  tabIndex={-1}>
              {Modes.map(({ formName }, index) => (
                <ToggleButton
                  key={index}
                  id={`radio-btn-${formName}`}
                  type="radio"
                  value={index}
                  checked={currentMode == index}
                  onKeyDown={(event) => {if (event.code === "Enter") setCurrentMode(index);}}
                  onChange={(event) =>
                    setCurrentMode(parseInt(event.currentTarget.value))
                  }
                  className={`modal-mode-toggle ${currentMode == index ? "selected" : ""}`}
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
              // eslint-disable-next-line react-hooks/refs
              formsData.current[
                currentMode
              ]
            }
            setFormData={setFormData}
            setFormId={handleSetFormId}
            successfulCallback={successfulCallback}
          />
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button onClick={closeWindow} className="btn-action-cancel modal-cancel">
            Cancel
          </Button>
          <Button
            form={formId}
            type="submit"
            aria-description={`Submit the ${Modes[currentMode].formName} form`}
            disabled={!formValid}
            className="btn-action-approve modal-submit"
          >
            {Modes[currentMode].formName}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FormWindow;
