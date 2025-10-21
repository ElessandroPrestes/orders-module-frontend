import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@auth/stores/useAuthStore'
import { authClient, api } from '@/boot/axios'
import { Notify } from 'quasar'

vi.mock('@/boot/axios', () => ({
  authClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useAuthStore', () => {
  it('executa getCsrfCookie com sucesso', async () => {
    const store = useAuthStore()
    authClient.get.mockResolvedValue({ status: 204 })

    await store.getCsrfCookie()

    expect(authClient.get).toHaveBeenCalledWith('/sanctum/csrf-cookie')
    expect(store.error).toBe(null)
    expect(Notify.create).not.toHaveBeenCalled()
  })

  it('realiza login com sucesso e atualiza estado da store', async () => {
    const store = useAuthStore()
    const credentials = { email: 'test@email.com', password: '123456' }

    authClient.get.mockResolvedValue({ status: 204 }) // mock CSRF cookie
    authClient.post.mockResolvedValue({
      // mock login
      data: {
        data: {
          user: { id: 1, name: 'Elessandro' },
        },
        message: 'Login realizado com sucesso!',
      },
    })

    await store.login(credentials)

    expect(authClient.get).toHaveBeenCalledWith('/sanctum/csrf-cookie')
    expect(authClient.post).toHaveBeenCalledWith('/login', credentials)
    expect(store.user).toEqual({ id: 1, name: 'Elessandro' })
    expect(store.isLoggedIn).toBe(true)
    expect(store.error).toBe(null)
    expect(Notify.create).toHaveBeenCalledWith({
      type: 'positive',
      message: 'Login realizado com sucesso!',
    })
  })

  it('realiza logout com sucesso e limpa estado da store', async () => {
    const store = useAuthStore()

    // simula estado de usuário logado
    store.user = { id: 1, name: 'Elessandro' }

    authClient.post.mockResolvedValue({ status: 200 })

    await store.logout()

    expect(authClient.post).toHaveBeenCalledWith('/logout')
    expect(store.user).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.error).toBe(null)
    expect(Notify.create).toHaveBeenCalledWith({
      type: 'info',
      message: 'Logout realizado com sucesso',
    })
  })

  it('busca usuário autenticado com sucesso e atualiza estado da store', async () => {
    const store = useAuthStore()

    const mockUser = { id: 1, name: 'Elessandro' }
    api.get.mockResolvedValue({ data: mockUser })

    await store.fetchUser()

    expect(api.get).toHaveBeenCalledWith('/api/user')
    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
    expect(store.error).toBe(null)
    expect(store.loading).toBe(false)
  })

  it('define user como null e isLoggedIn como false quando resposta é 401', async () => {
    const store = useAuthStore()

    api.get.mockRejectedValue({
      response: { status: 401 },
    })

    await store.fetchUser()

    expect(api.get).toHaveBeenCalledWith('/api/user')
    expect(store.user).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.error).toBe(null)
    expect(store.loading).toBe(false)
  })

  it('define erro genérico quando fetchUser falha com status diferente de 401', async () => {
    const store = useAuthStore()

    api.get.mockRejectedValue({
      response: { status: 500 },
    })

    await store.fetchUser()

    expect(api.get).toHaveBeenCalledWith('/api/user')
    expect(store.user).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.error).toBe('Erro ao buscar usuário')
    expect(store.loading).toBe(false)
  })

  it('define erro e dispara notificação quando getCsrfCookie falha', async () => {
    const store = useAuthStore()

    authClient.get.mockRejectedValue(new Error('CSRF fail'))

    await expect(store.getCsrfCookie()).rejects.toThrow('Falha ao obter cookie CSRF')

    expect(store.error).toBe('Falha ao obter cookie CSRF')
    expect(Notify.create).toHaveBeenCalledWith({
      type: 'negative',
      message: 'Falha ao obter cookie CSRF',
    })
  })

  it('define erro e dispara notificação quando login falha', async () => {
    const store = useAuthStore()
    const credentials = { email: 'test@email.com', password: 'wrongpass' }

    authClient.get.mockResolvedValue({ status: 204 })

    authClient.post.mockRejectedValue({
      response: {
        data: {
          message: 'Credenciais inválidas',
        },
      },
    })

    await expect(store.login(credentials)).rejects.toThrow('Credenciais inválidas')

    expect(store.error).toBe('Credenciais inválidas')
    expect(store.user).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(Notify.create).toHaveBeenCalledWith({
      type: 'negative',
      message: 'Credenciais inválidas',
    })
    expect(store.loading).toBe(false)
  })

  it('define erro e dispara notificação quando logout falha', async () => {
  const store = useAuthStore()

  authClient.post.mockRejectedValue(new Error('Logout fail'))

  await expect(store.logout()).rejects.toThrow('Erro ao fazer logout')

  expect(store.error).toBe('Erro ao fazer logout')
  expect(store.user).toBe(null)
  expect(store.isLoggedIn).toBe(false)
  expect(Notify.create).toHaveBeenCalledWith({
    type: 'negative',
    message: 'Erro ao fazer logout',
  })
  expect(store.loading).toBe(false)
})
})

