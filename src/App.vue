<script setup>
import { ref, computed } from 'vue';
import FormGenerator from './components/FormGenerator.vue';

const initialSchemaJson = JSON.stringify({
  fields: [
    { type: 'text', label: 'Имя', model: 'name', required: true },
    { type: 'email', label: 'Email', model: 'email', required: true },
    { type: 'password', label: 'Пароль', model: 'password', required: true, minLength: 6 },
    { type: 'select', label: 'Роль', model: 'role', options: ['Админ', 'Пользователь'], required: true },
    { type: 'checkbox', label: 'Согласен с условиями', model: 'terms', required: true }
  ]
}, null, 2);

const schemaJson = ref(initialSchemaJson);
const parsedSchema = ref(null);
const schemaError = ref(null);
const formData = ref({});

const applySchema = () => {
  try {
    const schema = JSON.parse(schemaJson.value);
    if (!Array.isArray(schema.fields)) {
      throw new Error('Схема должна содержать массив "fields"');
    }
    parsedSchema.value = schema;
    schemaError.value = null;

    const data = {};
    schema.fields.forEach(field => {
      data[field.model] = field.type === 'checkbox' ? false : '';
    });
    formData.value = data;
  } catch (err) {
    schemaError.value = 'Ошибка в JSON: ' + err.message;
    parsedSchema.value = null;
  }
};

applySchema();

const displayData = computed(() => {
  return JSON.stringify(formData.value, null, 2);
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.app__schema-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.app__schema-textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.app__apply-btn {
  padding: 8px 16px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.app__apply-btn:hover {
  background-color: #219653;
}

.app__error {
  color: #e74c3c;
  margin-top: 8px;
  font-size: 14px;
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