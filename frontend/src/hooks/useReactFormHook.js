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
export default function useReactFormHook({
  setSubmitStatus,
  formData,
  setFormData,
  schema,
}) {
  const {
    register,
    watch,
    setValues,
    getValues,
    formState: { errors, isValid },
  } = useForm({ resolver: yupResolver(schema), mode: "all" });
  const watchFields = watch(); //TODO: See if subscribe is a better option.
  useEffect(() => setSubmitStatus(isValid), [isValid]);

  useEffect(() => {
    if (formData) {
      setValues(formData, { shouldValidate: true });
    }
  }, [formData]);

  
  useEffect(
    () => setFormData(getValues()),
    Object.values(getValues()).length > 0
      ? Object.values(getValues())
      : Object.values(schema.fields).map(() => undefined)
  );
  return { register, errors };
}
