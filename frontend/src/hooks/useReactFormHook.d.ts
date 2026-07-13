import { type FieldValues } from "react-hook-form";
import type { AnyObjectSchema } from "yup";
import type { AuthFormComponentProps } from "../components/authentication/AuthFormComponents";
interface UseReactFormHookProps extends AuthFormComponentProps {
    schema: AnyObjectSchema;
}
/**
 * Takes in a yup Schema and uses react-hook-form
 * @param {Object} props See props below.
 * @param {Function} props.setSubmitStatus
 * @param {Object} props.formData
 * @param {Function} props.setFormData
 * @param {Schema} props.schema
 * @returns {Object}
 */
export default function useReactFormHook<Fields extends FieldValues>({ setSubmitStatus, formData, setFormData, schema, }: UseReactFormHookProps): {
    register: import("react-hook-form").UseFormRegister<Fields>;
    handleSubmit: import("react-hook-form").UseFormHandleSubmit<Fields, Fields>;
    errors: import("react-hook-form").FieldErrors<Fields>;
};
export {};
//# sourceMappingURL=useReactFormHook.d.ts.map