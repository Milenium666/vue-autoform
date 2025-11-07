<script setup>
import { ref, computed, watch } from "vue";
import FormGenerator from "./components/FormGenerator.vue";

const initialSchemaJson = JSON.stringify(
  {
    fields: [
      { type: "text", label: "Имя", model: "name", required: true },
      { type: "email", label: "Email", model: "email", required: true },
      {
        type: "password",
        label: "Пароль",
        model: "password",
        required: true,
        minLength: 6,
      },
      {
        type: "select",
        label: "Роль",
        model: "role",
        options: ["Админ", "Пользователь"],
        required: true,
      },
      {
        type: "checkbox",
        label: "Согласен с условиями",
        model: "terms",
        required: true,
      },
    ],
  },
  null,
  2
);

const schemaJson = ref(initialSchemaJson);
const parsedSchema = ref(null);
const schemaError = ref(null);
const formData = ref({});

const savedSchema = localStorage.getItem("schemaJson");
if (savedSchema) schemaJson.value = savedSchema;

const savedData = localStorage.getItem("formData");
if (savedData) {
  try {
    formData.value = JSON.parse(savedData);
  } catch {
    formData.value = {};
  }
}

const applySchema = () => {
  try {
    if (!schemaJson.value.trim()) {
      throw new Error("Поле JSON-схемы не может быть пустым");
    }

    const parsed = JSON.parse(schemaJson.value);
    let schema = null;

    if (Array.isArray(parsed.fields)) {
      schema = parsed;
    } else if (Array.isArray(parsed)) {
      schema = { fields: parsed };
    } else {
      const possibleFields = Object.values(parsed).find(
        (v) =>
          Array.isArray(v) &&
          v.every((item) => typeof item === "object" && "type" in item)
      );
      if (possibleFields) {
        schema = { fields: possibleFields };
      } else {
        throw new Error(
          'Не удалось найти массив полей формы. Убедитесь, что схема содержит "fields" или массив с объектами полей.'
        );
      }
    }

    const seenModels = new Set();
    const warnings = [];

    schema.fields.forEach((field, idx) => {
      if (!field.model) {
        throw new Error(
          `Ошибка: у поля №${idx + 1} отсутствует обязательное свойство "model".`
        );
      }
      if (seenModels.has(field.model)) {
        throw new Error(
          `Ошибка: свойство "model" "${field.model}" встречается несколько раз. Оно должно быть уникальным.`
        );
      }
      seenModels.add(field.model);

      const allowedTypes = ["text", "email", "password", "select", "checkbox"];
      if (!field.type || !allowedTypes.includes(field.type)) {
        warnings.push(
          `Поле "${field.label || field.model}" имеет недопустимый тип "${field.type}". Тип автоматически заменён на "text".`
        );
        field.type = "text";
      }

      if (field.type === "select" && !Array.isArray(field.options)) {
        warnings.push(
          `Поле "${field.label || field.model}" имеет тип "select", но список "options" отсутствует или указан неверно. Использован пустой список.`
        );
        field.options = [];
      }
    });

    parsedSchema.value = schema;
    schemaError.value = warnings.length ? warnings.join("\n") : null;

    const data = {};
    schema.fields.forEach((field) => {
      if (formData.value[field.model] !== undefined) {
        data[field.model] = formData.value[field.model];
      } else {
        data[field.model] = field.type === "checkbox" ? false : "";
      }
    });
    formData.value = data;

    localStorage.setItem("schemaJson", schemaJson.value);
    const { password, ...safeData } = formData.value;
    localStorage.setItem("formData", JSON.stringify(safeData));

  } catch (err) {
    parsedSchema.value = null;
    if (err instanceof SyntaxError) {
      schemaError.value = "Ошибка разбора JSON: проверьте корректность ввода";
    } else {
      schemaError.value = err.message || "Ошибка при разборе JSON.";
    }
  }
};

if (!parsedSchema.value) applySchema();

watch(
  formData,
  (newVal) => {
    const { password, ...safeData } = newVal;
    localStorage.setItem("formData", JSON.stringify(safeData));
  },
  { deep: true, flush: "post" }
);

const displayData = computed(() => {
  const copy = { ...formData.value };
  if (copy.password) copy.password = "********";
  return JSON.stringify(copy, null, 2);
});
</script>

<template>
  <div class="app">
    <h1>Автоформа по JSON-схеме</h1>

    <div class="app__schema-editor">
      <label for="schema-input" class="app__schema-label">Введите JSON-схему:</label>
      <textarea
        id="schema-input"
        v-model="schemaJson"
        class="app__schema-textarea"
        placeholder='{"fields": [...]}'
      ></textarea>
      <button @click="applySchema" class="app__apply-btn">Применить схему</button>
      <div v-if="schemaError" class="app__error">{{ schemaError }}</div>
    </div>

    <div v-if="parsedSchema" class="app__form-container">
      <FormGenerator :schema="parsedSchema" v-model="formData" />
    </div>

    <div v-if="parsedSchema" class="app__output">
      <h2>Данные формы:</h2>
      <pre>{{ displayData }}</pre>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.app__schema-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.app__schema-textarea {
  width: 100%;
  max-width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}

.app__schema-textarea:focus {
  outline: none;
  border-color: #3498db;
  background-color: #f0f8ff;
}

.app__apply-btn {
  padding: 8px 16px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.app__apply-btn:hover {
  background-color: #219653;
}

.app__error {
  color: #e74c3c;
  margin-top: 8px;
  font-size: 14px;
  white-space: pre-line;
}

.app__form-container {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.app__output {
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  overflow-x: auto;
}
</style>
