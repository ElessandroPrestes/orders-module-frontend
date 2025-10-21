<template>
  <q-page class="flex flex-center bg-grey-1">
    <login-form />
  </q-page>
</template>

<script setup>
import LoginForm from '@auth/components/LoginForm.vue'
</script>

<style scoped>
.q-page {
  min-height: 100%;
}
</style>
