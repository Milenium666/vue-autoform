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

  <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
    <h2>Автоформа</h2>
    <FormGenerator :schema="formSchema" v-model="formData" />
    <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
  </div>
</template>

<style scoped>

</style>
