import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthGuard } from '@auth/composables/useAuthGuard'
import { useAuthStore } from '@auth/stores/useAuthStore'
import { useRouter } from 'vue-router'

vi.mock('@auth/stores/useAuthStore')
vi.mock('vue-router')

describe('useAuthGuard', () => {
  let authMock, routerMock

  beforeEach(() => {
    authMock = {
      user: null,
      loading: false,
      isLoggedIn: false,
      fetchUser: vi.fn(),
    }
    useAuthStore.mockReturnValue(authMock)

    routerMock = {
      push: vi.fn(),
    }
    useRouter.mockReturnValue(routerMock)
  })

  it('checkAuth chama fetchUser se user for null e loading for false, e retorna isLoggedIn', async () => {
    authMock.user = null
    authMock.loading = false
    authMock.isLoggedIn = true
    authMock.fetchUser.mockResolvedValue()

    const { checkAuth } = useAuthGuard()

    const result = await checkAuth()

    expect(authMock.fetchUser).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('checkAuth não chama fetchUser se user já está definido e retorna isLoggedIn', async () => {
    authMock.user = { id: 1, name: 'Usuário' }
    authMock.loading = false
    authMock.isLoggedIn = true

    const { checkAuth } = useAuthGuard()

    const result = await checkAuth()

    expect(authMock.fetchUser).not.toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('checkAuth retorna false e loga erro se fetchUser lança exceção', async () => {
    authMock.user = null
    authMock.loading = false
    authMock.isLoggedIn = false
    authMock.fetchUser.mockRejectedValue(new Error('Falha'))

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { checkAuth } = useAuthGuard()

    const result = await checkAuth()

    expect(result).toBe(false)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[useAuthGuard] Erro ao verificar autenticação:',
      expect.any(Error),
    )

    consoleWarnSpy.mockRestore()
  })

  it('redirectIfNotAuthenticated redireciona para rota fallback se usuário não autenticado', async () => {
    authMock.user = null
    authMock.loading = false
    authMock.isLoggedIn = false
    authMock.fetchUser.mockResolvedValue()

    const { redirectIfNotAuthenticated } = useAuthGuard()

    await redirectIfNotAuthenticated({ name: 'login' })

    expect(routerMock.push).toHaveBeenCalledWith({ name: 'login' })
  })
})
