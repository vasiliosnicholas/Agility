import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback } from "react";
import { Modal, Button, ToggleButton, ButtonGroup } from "react-bootstrap";
import Login from "./Login";
import Register from "./Register";
//TODO: Add Manage Account, Delete Account, and possibly Logout
const Modes = [Login, Register];
export default function AuthWindow() {
    const [formValid, setSubmitStatus] = useState(false);
    const [display, setDisplay] = useState(false);
    const formsData = useRef(Modes.map(() => undefined));
    const [currentMode, setCurrentMode] = useState(0);
    //current form component to display.
    const CurrentFormComponent = Modes[currentMode];
    //prevent redefinitions of setFormData using memomization
    const setFormData = useCallback((formData) => {
        formsData.current[currentMode] = formData;
    }, [formsData, currentMode]);
    const openWindow = useCallback(() => {
        setDisplay(true);
    }, [setDisplay]);
    const closeWindow = useCallback(() => {
        setDisplay(false);
    }, [setDisplay]);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "primary", onClick: openWindow, children: "Login | Register" }), _jsxs(Modal, { show: display, size: "lg", "aria-labelledby": "login-or-register-title", onHide: closeWindow, centered: true, children: [_jsx(Modal.Header, { className: "justify-content-center", children: _jsx(Modal.Title, { id: "login-or-register-title", children: _jsx(ButtonGroup, { "aria-label": "Login/Register Buttons", children: Modes.map(({ formName, formId }, index) => (_jsx(ToggleButton, { id: `radio-btn-${formId}`, type: "radio", value: index, checked: currentMode == index, onChange: (event) => setCurrentMode(parseInt(event.currentTarget.value)), children: formName }, index))) }) }) }), _jsx(Modal.Body, { children: _jsx(CurrentFormComponent, { setSubmitStatus: setSubmitStatus, formData: formsData.current[currentMode] /*FIXME: this works because only want to re-render child.
                            Figure out how to get rid of this error */, setFormData: setFormData }) }), _jsxs(Modal.Footer, { className: "justify-content-between", children: [_jsx(Button, { onClick: closeWindow, variant: "danger", children: "Cancel" }), _jsx(Button, { form: CurrentFormComponent.formId, variant: "primary", type: "submit", disabled: !formValid, children: Modes[currentMode].formName })] })] })] }));
}
//# sourceMappingURL=AuthWindow.js.map