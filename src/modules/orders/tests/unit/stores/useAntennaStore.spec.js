vi.mock('@antennas/composables/useAntennaSearch', () => ({
  useAntennaSearch: () => ({
    fetchBySerial: vi.fn().mockResolvedValue({
      serial_number: 'SN-999',
      description: 'Antena XYZ',
      deployment_date: '06/07/2025',
      photo: 'data:image/jpeg;base64,fake'
    })
  })
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAntennaStore } from '@/modules/antennas/stores/useAntennaStore'
import * as antennaService from '@/modules/antennas/services/antennaService'

vi.mock('@/modules/antennas/services/antennaService', () => ({
  fetchAntennas: vi.fn(),
  fetchAntennaById: vi.fn(),
  createAntenna: vi.fn(),
  updateAntenna: vi.fn(),
  deleteAntenna: vi.fn(),
}))

import { updateAntenna } from '@/modules/antennas/services/antennaService'
import { api } from '@/boot/axios'

const notifyMock = vi.fn()

vi.mock('quasar', () => ({
  useQuasar: () => ({ notify: notifyMock }),
}))

vi.mock('@/boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/boot/authClient', () => ({
  authClient: {
    get: vi.fn(),
  },
}))

vi.mock('@antennas/composables/useFormDataBuilder', () => ({
  useFormDataBuilder: () => ({
    buildFormData: (data) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined) formData.append(key, val)
      })
      return formData
    },
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})


describe('useAntennaStore - formulário', () => {

  it('loadAntennaBySerial retorna erro quando antena não é encontrada', async () => {
  //const store = useAntennaStore()

  // 🔧 sobrescreve temporariamente o mock para retornar null
  const fetchBySerialMock = vi.fn().mockResolvedValue(null)

  vi.mock('@antennas/composables/useAntennaSearch', () => ({
    useAntennaSearch: () => ({
      fetchBySerial: fetchBySerialMock
    })
  }))

  // recria o store após re-mock
  setActivePinia(createPinia())
  const freshStore = useAntennaStore()

  const result = await freshStore.loadAntennaBySerial('SN-404')

  expect(result.success).toBe(false)
  expect(result.message).toBe('Erro ao buscar antena.')
})

  it('inicializa com valores padrão', () => {
    const store = useAntennaStore()

    expect(store.form).toMatchObject({
      description: '',
      serial_number: '',
      latitude: null,
      longitude: null,
      height: null,
      deployment_date: '',
      state: 'AC',
      photo: null,
    })
  })
  it('submitForm converte data para formato ISO corretamente', async () => {
    const store = useAntennaStore()

    Object.assign(store.form, {
      serial_number: 'SN-001',
      deployment_date: '21/07/2025',
      description: 'Antena XPTO',
      photo: null,
    })

    const mockCreate = vi.spyOn(antennaService, 'createAntenna').mockResolvedValueOnce({
      data: { id: 1, deployment_date: '2025-07-21' },
    })

    const notify = vi.fn()
    await store.submitForm({ notify })

    const formSent = mockCreate.mock.calls[0][0] // pega o FormData enviado
    expect(formSent.get('deployment_date')).toBe('2025-07-21')
  })

  it('reseta o formulário para o estado inicial', () => {
    const store = useAntennaStore()
    store.form.description = 'Antena XPTO'
    store.form.state = 'SP'

    store.resetForm()

    expect(store.form.description).toBe('')
    expect(store.form.state).toBe('AC')
  })


  it('submitForm envia os dados corretamente e reseta o formulário', async () => {
    const store = useAntennaStore()
    const fakeFile = new File(['abc'], 'foto.jpg', { type: 'image/jpeg' })

    Object.assign(store.form, {
      description: 'Antena XPTO',
      serial_number: 'SN123',
      latitude: 12.34,
      longitude: 56.78,
      height: 10,
      deployment_date: '2025-07-06',
      state: 'PR',
      photo: fakeFile,
    })

    vi.spyOn(antennaService, 'createAntenna').mockResolvedValueOnce({
      data: { id: 99, description: 'Antena XPTO' },
    })

    const result = await store.submitForm()

    expect(result).toEqual({ success: true })
    expect(antennaService.createAntenna).toHaveBeenCalled()
    expect(store.form.description).toBe('')
    expect(store.antennas).toContainEqual({ id: 99, description: 'Antena XPTO' })
  })

  it('submitForm captura erro e seta mensagem corretamente', async () => {
    const store = useAntennaStore()

    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Erro ao cadastrar antena.',
        },
      },
    })

    const result = await store.submitForm()

    expect(result).toEqual({
      success: false,
      message: 'Erro ao cadastrar antena.',
      errors: {},
    })

    expect(store.error).toEqual({})
  })

  it('submitForm alterna loading corretamente', async () => {
    const store = useAntennaStore()
    api.post.mockResolvedValueOnce({ data: {} })

    const promise = store.submitForm()
    expect(store.loading).toBe(true)

    await promise
    expect(store.loading).toBe(false)
  })

  it('loadAntennas busca antenas e popula o array corretamente', async () => {
    const store = useAntennaStore()

    const fakeData = {
      data: {
        data: {
          antennas: {
            items: [{ id: 1, description: 'Antena 1' }],
            meta: { total: 1, current_page: 1, last_page: 1, from: 1, to: 1 },
          },
          ranking: [{ id: 99, score: 100 }],
        },
      },
    }

    vi.spyOn(antennaService, 'fetchAntennas').mockResolvedValueOnce(fakeData)

    await store.loadAntennas()

    expect(antennaService.fetchAntennas).toHaveBeenCalledWith(store.currentPage, store.perPage)
    expect(store.antennas).toEqual(fakeData.data.data.antennas.items)
    expect(store.pagination).toEqual(fakeData.data.data.antennas.meta)
    expect(store.ranking).toEqual(fakeData.data.data.ranking)
  })

  it('fetchAntennas trata erro corretamente', async () => {
    const store = useAntennaStore()

    // simula falha na requisição
    api.get.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Erro ao carregar antenas.',
        },
      },
    })

    const result = await store.loadAntennas()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Erro ao carregar antenas.')

    expect(store.antennas).toEqual([])
  })

  it('setPage altera currentPage e chama loadAntennas', async () => {
    const store = useAntennaStore()

    store.loadAntennas = vi.fn()

    const newPage = 3
    store.setPage(newPage)

    expect(store.currentPage).toBe(newPage)
    expect(store.loadAntennas).toHaveBeenCalledWith(newPage, store.perPage)
  })

  it('setPerPage altera perPage, reseta currentPage para 1 e chama loadAntennas', async () => {
    const store = useAntennaStore()

    store.loadAntennas = vi.fn()

    const newPerPage = 10
    store.perPage = 5
    store.currentPage = 2

    store.setPerPage(newPerPage)

    expect(store.perPage).toBe(newPerPage)
    expect(store.currentPage).toBe(1)
    expect(store.loadAntennas).toHaveBeenCalledWith(1, newPerPage)
  })

  it('setPerPage não chama loadAntennas se perPage for igual ao atual', () => {
    const store = useAntennaStore()

    store.loadAntennas = vi.fn()
    store.perPage = 5

    store.setPerPage(5)

    expect(store.loadAntennas).not.toHaveBeenCalled()
  })

  it('updateAntenna atualiza dados corretamente e exibe notificação de sucesso', async () => {
    const store = useAntennaStore()
    const mockNotify = vi.fn()
    const $q = { notify: mockNotify }

    const id = 123
    const updatedData = { description: 'Atualizada', photo: null }

    const response = { data: { id, description: 'Atualizada' } }
    updateAntenna.mockResolvedValueOnce(response)

    const result = await store.updateAntenna(id, updatedData, $q)

    expect(result).toEqual(response.data)
    expect(store.antennaDetails[id]).toEqual(response.data)
  })

  it('submitForm envia sem imagem quando form.photo está null', async () => {
    const store = useAntennaStore()

    Object.assign(store.form, {
      description: 'Antena sem imagem',
      photo: null,
    })

    vi.spyOn(antennaService, 'createAntenna').mockResolvedValueOnce({
      data: { id: 123, description: 'Antena sem imagem' },
    })

    const result = await store.submitForm()

    expect(result.success).toBe(true)
    expect(store.antennas).toContainEqual({ id: 123, description: 'Antena sem imagem' })
  })

  it('submitForm trata erro sem mensagem no response corretamente', async () => {
    const store = useAntennaStore()

    api.post.mockRejectedValueOnce({})

    const result = await store.submitForm()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Erro ao cadastrar antena.')
  })

  it('loadAntennas trata erro genérico sem response.data.message', async () => {
    const store = useAntennaStore()

    api.get.mockRejectedValueOnce({})

    const result = await store.loadAntennas()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Erro ao carregar antenas.')
  })

  it('deleteAntenna remove antena da lista quando sucesso', async () => {
  const store = useAntennaStore()

  // adiciona antena manualmente
  store.antennas = [{ serial_number: 'SN-002', description: 'Removível' }]

  vi.spyOn(antennaService, 'deleteAntenna').mockResolvedValueOnce()

  const result = await store.deleteAntenna('SN-002')

  expect(result.success).toBe(true)
  expect(store.antennas).not.toContainEqual({ serial_number: 'SN-002', description: 'Removível' })
})

})
