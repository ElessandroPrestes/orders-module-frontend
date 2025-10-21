import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from '@auth/stores/useAuthStore'

export default defineRouter(() => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    try {
      // só busca o usuário se estiver logado
      if (auth.isLoggedIn && !auth.user && !auth.loading) {
        await auth.fetchUser()
      }

      // rota exige login e usuário não está logado
      if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return next({ name: 'login' })
      }

      // usuário já logado e tenta acessar login
      if (to.name === 'login' && auth.isLoggedIn) {
        return next({ name: 'orders-list' })
      }

      next()
    } catch (err) {
      console.warn('[Router Guard] Erro ao verificar autenticação:', err)

      if (to.meta.requiresAuth) {
        return next({ name: 'login' })
      }

      next()
    }
  })

  return Router
})