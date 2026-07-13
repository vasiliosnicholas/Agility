import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
/**
 * Takes in a yup Schema and uses react-hook-form
 * @param {Object} props See props below.
 * @param {Function} props.setSubmitStatus
 * @param {Object} props.formData
 * @param {Function} props.setFormData
 * @param {Schema} props.schema
 * @returns {Object}
 */
export default function useReactFormHook({ setSubmitStatus, formData, setFormData, schema, }) {
    const { register, watch, setValues, handleSubmit, formState: { errors, isValid }, } = useForm({ resolver: yupResolver(schema), mode: "all" });
    const values = watch(); //TODO: See if subscribe is a better option.
    useEffect(() => setSubmitStatus(isValid), [isValid, setSubmitStatus]);
    useEffect(() => {
        if (formData) {
            setValues(formData, { shouldValidate: true });
        }
    }, [formData, setValues]);
    useEffect(() => setFormData(values), Object.values(values).length > 0
        ? Object.values(values)
        : Object.values(schema.fields).map(() => undefined));
    return { register, handleSubmit, errors };
}
//# sourceMappingURL=useReactFormHook.js.map