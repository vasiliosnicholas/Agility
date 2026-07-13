import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import useReactFormHook from "../../hooks/useReactFormHook";
import * as yup from "yup";
const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const accountTypes = [
    { name: "Manager", action: () => console.log("Manager Placeholder action") },
    {
        name: "Developer",
        action: () => console.log("Developer Placeholder action"),
    },
];
const schema = yup.object().shape({
    AccountType: yup.string().oneOf(accountTypes.map(({ name }) => name), "You must pick an account type."),
    Username: yup.string().required().min(MIN_USERNAME_LENGTH),
    Email: yup.string().required().email(),
    Password: yup.string().required().min(MIN_PASSWORD_LENGTH),
    ConfirmPassword: yup
        .string()
        .required("You must confirm your password")
        .oneOf([yup.ref("Password")], "Passwords must be identical."),
});
const Register = function ({ setSubmitStatus, formData, setFormData, }) {
    // const [selectedAccountType, setAccountType] = useState(undefined); //TODO: Decide if we need additional fields depending on account type.
    const { register, errors } = useReactFormHook({
        setSubmitStatus,
        formData,
        setFormData,
        schema,
    });
    const onSubmit = useCallback((event) => {
        alert("Registered Account!");
        event.preventDefault();
        event.stopPropagation();
    }, []);
    return (_jsxs(Form, { id: Register.name, noValidate: true, onSubmit: onSubmit, children: [_jsxs(FloatingLabel, { className: "mb-3", controlId: "account-type", label: "Account Type", children: [_jsxs(Form.Select, { "aria-label": "Select Account Type", defaultValue: undefined, isInvalid: !!errors.AccountType, ...register("AccountType"), children: [_jsx("option", { children: "Select Account Type" }), accountTypes.map((type, index) => (_jsx("option", { value: type.name, children: type.name }, index)))] }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.AccountType?.message?.toString() })] }), _jsxs(FloatingLabel, { className: "mb-3", controlId: "email", label: "Email Address", children: [_jsx(Form.Control, { type: "email", placeholder: "name@example.com", autoFocus: true, isInvalid: !!errors.Email, ...register("Email") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.Email?.message?.toString() })] }), _jsxs(FloatingLabel, { className: "mb-3", controlId: "username", label: "Username", children: [_jsx(Form.Control, { type: "text", placeholder: "Enter a username", isInvalid: !!errors.Username, ...register("Username") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.Username?.message?.toString() })] }), _jsxs(FloatingLabel, { className: "mb-3", controlId: "password", label: "Password", children: [_jsx(Form.Control, { type: "password", placeholder: "Enter a password", isInvalid: !!errors.Password || !!errors.ConfirmPassword, ...register("Password") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.Password?.message?.toString() ||
                            errors.ConfirmPassword?.message?.toString() })] }), _jsxs(FloatingLabel, { className: "mb-3", controlId: "password-confirm", label: "Confirm Password", children: [_jsx(Form.Control, { type: "password", placeholder: "Re-enter your password", isInvalid: !!errors.ConfirmPassword, ...register("ConfirmPassword") }), _jsx(Form.Control.Feedback, { type: "invalid", children: errors.ConfirmPassword?.message?.toString() })] })] }));
};
Register.formName = "Register";
Register.formId = Register.formName;
Register.route = "";
export default Register;
//# sourceMappingURL=Register.js.map