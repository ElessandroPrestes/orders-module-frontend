<script setup>
import { ref } from 'vue'
const inputValue = ref('Teste')
</script>

<template>
  <q-input v-model="inputValue" label="Campo" />
</template>
