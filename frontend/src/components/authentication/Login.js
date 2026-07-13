import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
const schema = yup.object().shape({
    Username: yup.string().required(),
    Password: yup.string().required(),
});
const Login = function ({ setSubmitStatus, formData, setFormData, }) {
    const { register, errors } = useReactFormHook({
        setSubmitStatus,
        formData,
        setFormData,
        schema,
    });
    const onSubmit = useCallback((event) => {
        alert("Logged in! Login");
        event.preventDefault();
        event.stopPropagation();
    }, []);
    return (_jsxs(Form, { id: Login.name, noValidate: true, onSubmit: onSubmit, children: [_jsxs(FloatingLabel, { className: "mb-3", controlId: "username", label: "Username", children: [_jsx(Form.Control, { type: "text", placeholder: "Username", autoFocus: true, isInvalid: !!errors.Username, ...register("Username") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.Username?.message?.toString() })] }), _jsxs(FloatingLabel, { className: "mb-3", controlId: "password", label: "Password", children: [_jsx(Form.Control, { type: "password", placeholder: "Password", isInvalid: !!errors.Password, ...register("Password") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.Password?.message?.toString() })] })] }));
};
Login.formName = "Login";
Login.formId = Login.formName;
Login.route = "";
export default Login;
//# sourceMappingURL=Login.js.map