import { describe, it, expect, vi } from 'vitest'
import { initSanctum, login, logout, getAuthenticatedUser } from '@auth/services/useAuthService'
import { authClient, api } from '@/boot/axios'

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

describe('useAuthService', () => {
  it('faz uma requisição GET para /sanctum/csrf-cookie', async () => {
    authClient.get.mockResolvedValue({ status: 204 })

    const response = await initSanctum()

    expect(authClient.get).toHaveBeenCalledWith('/sanctum/csrf-cookie')
    expect(response.status).toBe(204)
  })

  it('chama initSanctum e faz POST para /login com credenciais', async () => {
    const credentials = { email: 'test@email.com', password: '123456' }

    authClient.get.mockResolvedValue({ status: 204 })

    authClient.post.mockResolvedValue({ data: { user: 'mockedUser' } })

    const response = await login(credentials)

    expect(authClient.get).toHaveBeenCalledWith('/sanctum/csrf-cookie')
    expect(authClient.post).toHaveBeenCalledWith('/login', credentials)
    expect(response.data.user).toBe('mockedUser')
  })

  it('faz POST para /logout', async () => {
    authClient.post.mockResolvedValue({ status: 200 })

    const response = await logout()

    expect(authClient.post).toHaveBeenCalledWith('/logout')
    expect(response.status).toBe(200)
  })
  
  it('faz GET para /api/user', async () => {
    api.get.mockResolvedValue({ data: { name: 'Elessandro', email: 'eu@email.com' } })

    const response = await getAuthenticatedUser()

    expect(api.get).toHaveBeenCalledWith('/api/user')
    expect(response.data.name).toBe('Elessandro')
    expect(response.data.email).toBe('eu@email.com')
  })
})
