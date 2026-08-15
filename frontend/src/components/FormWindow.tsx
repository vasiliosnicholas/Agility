import { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import type {
  FormData,
  formIdSetter,
  FormWindowComponent,
  SuccessfulCallback,
} from "./FormComponents.d.ts";

const FormWindow: FormWindowComponent = ({
  Forms,
  ModalButton = Button,
  initialFormsData,
  ...props
}) => {
  if (Forms.length === 0)
    throw new RangeError("Modes cannot be an empty array!");
  const [formValid, setSubmitStatus] = useState(false);
  const [display, setDisplay] = useState(false);
  const formsData = useRef<Array<FormData> | Array<undefined>>(
    initialFormsData ? initialFormsData : Forms.map(() => undefined)
  );

  useEffect(() => {
    if (initialFormsData) formsData.current = initialFormsData;
  }, [initialFormsData]);
  const [currentForm, setCurrentForm] = useState(0);
  const [formId, setFormId] = useState<string>("");

  const handleSetFormId: formIdSetter = useCallback(
    (newId) => {
      setFormId(newId);
    },
    [setFormId]
  );

  //current form component to display.
  const CurrentFormComponent = Forms[currentForm];

  //prevent redefinitions of setFormData using memomization
  const setFormData = useCallback(
    (formData: FormData) => {
      formsData.current[currentForm] = formData;
    },
    [formsData, currentForm]
  );

  const openWindow = useCallback(() => {
    setDisplay(true);
  }, [setDisplay]);
  const closeWindow = useCallback(() => {
    setDisplay(false);
  }, [setDisplay]);

  const successfulCallback: SuccessfulCallback = ({
    route,
    closeFormWindow,
    data,
  } = {}) => {
    if (closeFormWindow) {
      closeWindow();
    }
    if (route) {
      if (window.location.href == route) window.location.reload();
      else if (route) window.location.href = route;
    }
    if (data) {
      const { formName, formData } = data;
      const nextForm = Forms.map(({ formName }) => formName).indexOf(formName);
      if (nextForm > -1) {
        formsData.current[nextForm] = formData;
        setCurrentForm(nextForm);
      }
    }
  };

  return (
    <>
      <ModalButton
        {...props}
        onClick={openWindow}
        aria-label={Forms.map(({ formName }) => formName).join()}
      >
        {Forms.map(({ formName }) => formName).join(" | ")}
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
            {Forms.length > 1 ? (
              <ButtonGroup tabIndex={-1}>
                {Forms.map(({ formName }, index) => (
                  <ToggleButton
                    key={index}
                    id={`radio-btn-${formName}`}
                    type="radio"
                    value={index}
                    checked={currentForm == index}
                    onKeyDown={(event) => {
                      if (event.code === "Enter") setCurrentForm(index);
                    }}
                    onChange={(event) =>
                      setCurrentForm(parseInt(event.currentTarget.value))
                    }
                    className={`modal-mode-toggle ${currentForm == index ? "selected" : ""}`}
                  >
                    {formName}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            ) : (
              Forms[0].formName
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CurrentFormComponent
            setSubmitStatus={setSubmitStatus}
            formData={
              // eslint-disable-next-line react-hooks/refs
              formsData.current[currentForm]
            }
            setFormData={setFormData}
            setFormId={handleSetFormId}
            successfulCallback={successfulCallback}
          />
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button
            onClick={closeWindow}
            className="btn-action-cancel modal-cancel"
          >
            Cancel
          </Button>
          <Button
            form={formId}
            type="submit"
            aria-description={`Submit the ${Forms[currentForm].formName} form`}
            disabled={!formValid}
            className="btn-action-approve modal-submit"
          >
            {Forms[currentForm].formName}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FormWindow;
