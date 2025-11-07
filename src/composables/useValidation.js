import { computed } from "vue";

export function useValidation(schema, data) {
  const validateField = (field, value) => {
    const errors = [];

    if (field.required && (value === "" || value === undefined || value === null)) {
      errors.push("Обязательное поле");
    }

    if (field.minLength && typeof value === "string" && value.length < field.minLength) {
      errors.push(`Минимум ${field.minLength} символов`);
    }

    if (field.pattern && typeof value === "string") {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        errors.push("Неверный формат");
      }
    }

    if (field.type === "checkbox" && field.required && value !== true) {
      errors.push("Необходимо согласие");
    }

    return errors;
  };

  const fieldErrors = computed(() => {
    const errors = {};
    schema.fields.forEach((field) => {
      const value = data.value[field.model];
      errors[field.model] = validateField(field, value);
    });
    return errors;
  });

  const isFormValid = computed(() =>
    schema.fields.every((field) => fieldErrors.value[field.model].length === 0)
  );

  return { fieldErrors, isFormValid };
}
