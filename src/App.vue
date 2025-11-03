<script setup>
import { reactive } from 'vue';
import FormGenerator from './components/FormGenerator.vue'

const formSchema = {
  fields: [
    { type: 'text', label: 'Имя', model: 'name', required: true },
    { type: 'email', label: 'Email', model: 'email', required: true },
    { type: 'password', label: 'Пароль', model: 'password', required: true, minLength: 6 },
    { type: 'select', label: 'Роль', model: 'role', options: ['Админ', 'Пользователь'], required: true },
    { type: 'checkbox', label: 'Согласен с условиями', model: 'terms', required: true }
  ]
};

const formData = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  terms: false
});
</script>

<template>

  <div class="app">
    <h1>Автоформа по JSON-схеме</h1>
    <FormGenerator :schema="formSchema" v-model="formData" />
    <div class="app__output">
      <h2>Данные формы:</h2>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.app__output {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
}
</style>
