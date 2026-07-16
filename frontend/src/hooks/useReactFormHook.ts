import { useEffect } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import type { AnyObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import type { FormBaseProps } from "../components/FormComponents";

interface UseReactFormHookProps<Fields extends FieldValues> extends FormBaseProps<Fields> {
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
export default function useReactFormHook<Fields extends FieldValues>({
  setSubmitStatus,
  formData,
  setFormData,
  schema,
}: UseReactFormHookProps<Fields>) {
  const {
    register,
    watch,
    setValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Fields>({ resolver: yupResolver(schema), mode: "all" });
  const values: Fields = watch(); //TODO: See if subscribe is a better option.
  useEffect(() => {
    setSubmitStatus(isValid);
    setFormData(values);
  }, [values, isValid, setSubmitStatus, setFormData]);

  useEffect(() => {
    if (formData) {
      setValues(formData, { shouldValidate: true });
    }
  }, [formData, setValues]);

  useEffect(
    () => setFormData(values),
    Object.values(values).length > 0
      ? Object.values(values)
      : Object.values(schema.fields).map(() => undefined)
  );
  return { register, handleSubmit, errors };
}
