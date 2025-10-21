import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import {
  login as loginService,
  logout as logoutService,
  getAuthenticatedUser,
  initSanctum,
} from '@auth/services/useAuthService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)

  async function getCsrfCookie() {
    try {
      await initSanctum()
    } catch {
      error.value = 'Falha ao obter cookie CSRF'
      Notify.create({ type: 'negative', message: error.value })
      throw new Error(error.value)
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const { data } = await loginService(credentials)
      user.value = data.data.user

      Notify.create({ type: 'positive', message: data.message || 'Login realizado com sucesso!' })
    } catch (err) {
      error.value = err?.response?.data?.message || 'Erro ao fazer login'
      user.value = null
      Notify.create({ type: 'negative', message: error.value })

      throw new Error(error.value) 
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null

    try {
      await logoutService()
      user.value = null
      Notify.create({ type: 'info', message: 'Logout realizado com sucesso' })
    } catch  {
      error.value = 'Erro ao fazer logout'
      user.value = null
      Notify.create({ type: 'negative', message: error.value })
      throw new Error(error.value) 
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
  loading.value = true
  error.value = null

  try {
    const { data } = await getAuthenticatedUser()
    user.value = data
  } catch (err) {
    user.value = null
    if (err?.response?.status !== 401) {
      error.value = 'Erro ao buscar usuário'
      Notify.create({ type: 'negative', message: error.value })
    }
  } finally {
    loading.value = false
  }
}


  return {
    user,
    isLoggedIn,
    loading,
    error,
    getCsrfCookie,
    login,
    logout,
    fetchUser,
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user'],
  },
})
