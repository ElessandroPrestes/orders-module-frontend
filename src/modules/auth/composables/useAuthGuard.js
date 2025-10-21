import { useAuthStore } from '@auth/stores/useAuthStore'
import { useRouter } from 'vue-router'

export function useAuthGuard() {
  const auth = useAuthStore()
  const router = useRouter()

  const checkAuth = async () => {
    try {
      if (!auth.user && !auth.loading) {
        await auth.fetchUser()
      }

      return auth.isLoggedIn
    } catch (err) {
      console.warn('[useAuthGuard] Erro ao verificar autenticação:', err)
      return false
    }
  }

  const redirectIfNotAuthenticated = async (fallbackRoute = { name: 'login' }) => {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      router.push(fallbackRoute)
    }
  }

  return {
    checkAuth,
    redirectIfNotAuthenticated,
    isLoggedIn: auth.isLoggedIn,
    user: auth.user,
    loading: auth.loading,
  }
}
