<template>
  <q-card class="q-pa-lg q-mx-auto q-shadow-md" style="width: 100vh; max-width: 25rem">
    <q-card-section>
      <q-form
        @submit.prevent="handleLogin"
        @reset="handleReset"
        ref="loginForm"
        :disable="localLoading"
        class="q-gutter-md"
      >
        <q-input
          v-model="credentials.email"
          label="Email"
          placeholder="exemplo@email.com"
          hint="Digite seu email"
          type="email"
          dense
          required
          autofocus
          lazy-rules
          :rules="[val => !!val || 'Email é obrigatório']"
        />

        <q-input
          v-model="credentials.password"
          label="Senha"
          placeholder="Sua senha secreta"
          hint="Mínimo 6 caracteres"
          type="password"
          dense
          required
          lazy-rules
          :rules="[val => !!val || 'Senha é obrigatória']"
        />

        <q-banner
          v-if="error"
          class="bg-red-2 text-red-10 q-mt-sm rounded-borders"
          dense
          aria-live="assertive"
        >
          <q-icon name="error" class="q-mr-sm" />
          {{ error }}
        </q-banner>

        <div class="row q-col-gutter-sm q-mt-md">
          <q-btn
            label="Entrar"
            type="submit"
            color="primary"
            text-color="white"
            loading-indicator-color="white"
            class="col"
            unelevated
            :loading="localLoading"
            :disable="localLoading"
            aria-label="Botão de login"
          />
          <q-btn
            label="Limpar"
            type="reset"
            color="primary"
            flat
            class="col"
            :disable="localLoading"
            aria-label="Botão de limpar"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@auth/stores/useAuthStore'

const router = useRouter()
const loginForm = ref(null)
const localLoading = ref(false)
const error = ref(null)
const auth = useAuthStore()

const credentials = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  const isValid = await loginForm.value.validate()
  if (!isValid) {
    error.value = 'Por favor, preencha todos os campos.'
    return
  }

  localLoading.value = true
  error.value = null

  try {
    await auth.login(credentials)
    router.push({ name: 'antennas-list' })
  } catch (err) {
    error.value = err?.response?.data?.message || 'Erro ao fazer login'
    console.error('Erro no login:', err)
  } finally {
    localLoading.value = false
  }
}



function handleReset() {
  credentials.email = ''
  credentials.password = ''
  error.value = null
}
</script>

