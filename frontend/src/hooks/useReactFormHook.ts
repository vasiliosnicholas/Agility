import { useEffect, useRef } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type { AnyObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import type { FormBaseProps } from "../components/FormComponents";

interface UseReactFormHookProps<
  Fields extends FieldValues,
> extends FormBaseProps<Fields> {
  schema: AnyObjectSchema;
}

/**
 * Takes in a yup Schema and uses react-hook-form to manage form validation.
 * @param {Object} props See props below.
 * @param {Function} props.setSubmitStatus
 * @param {Object} props.formData
 * @param {Function} props.setFormData
 * @param {Schema} props.schema
 * @returns {Object} register, handleSubmit props and errors from the useForm hook
 */
export default function useReactFormHook<Fields extends FieldValues>({
  setSubmitStatus,
  formData,
  setFormData,
  schema,
}: UseReactFormHookProps<Fields>) {
  const defaultValues = Object.keys(schema.fields).reduce(
    (fields, field) => {
      fields[field] = "";
      return fields;
    },
    {} as Record<string, string>
  ) as DefaultValues<Fields>;
  const {
    register,
    watch,
    setValues,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isValid, isSubmitSuccessful },
  } = useForm<Fields>({
    resolver: yupResolver(schema),
    mode: "all",
    defaultValues: formData
      ? (formData as DefaultValues<Fields>)
      : defaultValues,
  });
  const values: Fields = watch(); //TODO: See if subscribe is a better option.
  const init = useRef(true);
  // console.log(formData);
  useEffect(() => {
    setSubmitStatus(isValid);
    setFormData(values);
  }, [values, isValid, setSubmitStatus, setFormData]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      clearErrors();
      setFormData({});
    }
  }, [reset, isSubmitSuccessful, setFormData, clearErrors]);

  //only want this to run if formData and setValues changes, which only happens when antire child component is re-rendered
  useEffect(() => {
    if (formData && init.current) {
      setValues(formData, { shouldValidate: true });
      init.current = false;
    }
  }, [formData, setValues, init]);

  useEffect(
    () => setFormData(values),
    Object.values(values).length > 0
      ? Object.values(values)
      : Object.values(schema.fields).map(() => undefined)
  );
  return { register, handleSubmit, errors };
}
