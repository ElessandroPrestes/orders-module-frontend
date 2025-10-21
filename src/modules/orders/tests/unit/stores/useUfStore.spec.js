import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUfStore } from '@/modules/antennas/stores/useUfStore'

// Mock de axios
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn()
  }
}))

import { api } from 'boot/axios'

describe('useUfStore (com TTL)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('inicia com estado vazio', () => {
    const store = useUfStore()
    expect(store.list).toEqual([])
    expect(store.lastFetched).toBe(0)
  })

  it('carrega UFs via API quando não há cache válido', async () => {
    const store = useUfStore()

    api.get.mockResolvedValueOnce({
      data: [
        { sigla: 'PR', label: 'PR - Paraná' },
        { sigla: 'RS', label: 'RS - Rio Grande do Sul' }
      ]
    })

    await store.fetch()

    expect(api.get).toHaveBeenCalledWith('/ufs')
    expect(store.list).toEqual([
      { label: 'PR - Paraná', value: 'PR' },
      { label: 'RS - Rio Grande do Sul', value: 'RS' }
    ])
    expect(store.lastFetched).toBeGreaterThan(0)
  })

  it('usa dados do estado se ainda estiverem dentro do TTL', async () => {
    const store = useUfStore()
    const now = Math.floor(Date.now() / 1000)

    store.list = [
      { label: 'PR - Paraná', value: 'PR' },
      { label: 'SC - Santa Catarina', value: 'SC' }
    ]
    store.lastFetched = now

    await store.fetch()

    expect(api.get).not.toHaveBeenCalled()
    expect(store.list).toEqual([
      { label: 'PR - Paraná', value: 'PR' },
      { label: 'SC - Santa Catarina', value: 'SC' }
    ])
  })

  it('faz nova requisição quando TTL está expirado', async () => {
    const store = useUfStore()
    const expired = Math.floor(Date.now() / 1000) - 86401 // > 24h atrás

    store.list = [{ label: 'Antigo', value: 'XX' }]
    store.lastFetched = expired

    api.get.mockResolvedValueOnce({
      data: [
        { sigla: 'BA', label: 'BA - Bahia' },
        { sigla: 'PE', label: 'PE - Pernambuco' }
      ]
    })

    await store.fetch()

    expect(api.get).toHaveBeenCalledWith('/ufs')
    expect(store.list).toEqual([
      { label: 'BA - Bahia', value: 'BA' },
      { label: 'PE - Pernambuco', value: 'PE' }
    ])
  })

  it('trata falha da API e mantém estado limpo', async () => {
    const store = useUfStore()

    api.get.mockRejectedValueOnce(new Error('Erro simulado na API'))

    await expect(store.fetch()).rejects.toThrow('Erro simulado na API')
    expect(store.list).toEqual([])
  })
})
