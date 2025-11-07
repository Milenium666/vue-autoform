<script setup>
import { ref, watch } from "vue";
import { useValidation } from "../composables/useValidation.js"; 

const props = defineProps({
  schema: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const localData = ref({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = { ...newVal };
  },
  { deep: true }
);

watch(
  localData,
  (newVal) => {
    emit("update:modelValue", { ...newVal });
  },
  { deep: true }
);

const { fieldErrors, isFormValid } = useValidation(props.schema, localData);

const handleChange = (model, value) => {
  localData.value[model] = value;
};

const handleCheckboxChange = (model, event) => {
  localData.value[model] = event.target.checked;
};
</script>

<template>
  <form class="form-generator">
    <div
      v-for="field in schema.fields"
      :key="field.model"
      class="form-generator__field"
      :class="{ 'form-generator__field--invalid': fieldErrors[field.model].length > 0 }"
    >
      <label :for="field.model" class="form-generator__label">
        {{ field.label }}
      </label>

      <div v-if="field.type === 'select'" class="form-generator__control">
        <select
          :id="field.model"
          :value="localData[field.model] || ''"
          @change="(e) => handleChange(field.model, e.target.value)"
          class="form-generator__select"
        >
          <option value="" disabled>Выберите...</option>
          <option v-for="(option, idx) in field.options" :key="idx" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div v-else-if="field.type === 'checkbox'" class="form-generator__control">
        <input
          :id="field.model"
          type="checkbox"
          :checked="localData[field.model] === true"
          @change="(e) => handleCheckboxChange(field.model, e)"
          class="form-generator__checkbox"
        />
      </div>

      <div v-else class="form-generator__control">
        <input
          :id="field.model"
          :type="field.type"
          :value="localData[field.model] || ''"
          @input="(e) => handleChange(field.model, e.target.value)"
          :placeholder="field.placeholder || ''"
          class="form-generator__input"
        />
      </div>

      <div v-if="fieldErrors[field.model].length > 0" class="form-generator__error">
        {{ fieldErrors[field.model].join("; ") }}
      </div>
    </div>

  </form>
</template>

<style scoped>
.form-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
}

.form-generator__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-generator__field--invalid .form-generator__input,
.form-generator__field--invalid .form-generator__select {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

.form-generator__label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.form-generator__control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-generator__input,
.form-generator__select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-generator__input:focus,
.form-generator__select:focus {
  outline: none;
  border-color: #3498db;
}

.form-generator__checkbox {
  width: auto;
  height: 16px;
}

.form-generator__error {
  color: #e74c3c;
  font-size: 12px;
  min-height: 16px;
}


</style>
