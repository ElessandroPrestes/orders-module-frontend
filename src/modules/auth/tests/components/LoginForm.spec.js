import { shallowMount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import LoginForm from '@auth/components/LoginForm.vue'
import { createTestingPinia } from '@pinia/testing'

const pushMock = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    useRouter: () => ({ push: pushMock }),
  }
})

const stubs = {
  QCard: defineComponent({ name: 'QCard', template: '<q-card-stub><slot /></q-card-stub>' }),
  QCardSection: defineComponent({
    name: 'QCardSection',
    template: '<q-card-section-stub><slot /></q-card-section-stub>',
  }),
  QForm: defineComponent({ name: 'QForm', template: '<q-form-stub><slot /></q-form-stub>' }),
  QInput: defineComponent({ name: 'QInput', template: '<q-input-stub />' }),
  QBtn: defineComponent({ name: 'QBtn', template: '<q-btn-stub><slot /></q-btn-stub>' }),
  QBanner: defineComponent({
    name: 'QBanner',
    template: '<q-banner-stub><slot /></q-banner-stub>',
  }),
  QIcon: defineComponent({ name: 'QIcon', template: '<q-icon-stub />' }),
}

describe('LoginForm', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renderiza corretamente o formulário de login', () => {
    const wrapper = shallowMount(LoginForm, {
      global: {
        plugins: [pinia],
        stubs,
      },
    })

    expect(wrapper.find('q-form-stub').exists()).toBe(true)
    expect(wrapper.findAll('q-input-stub').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.find('q-btn-stub[type="submit"]').exists()).toBe(true)
  })

  it('exibe mensagem de erro quando error está definido', async () => {
    const wrapper = shallowMount(LoginForm, {
      global: {
        plugins: [pinia],
        stubs,
      },
    })

    wrapper.vm.error = 'Credenciais inválidas'
    await wrapper.vm.$forceUpdate()

    expect(wrapper.text()).toContain('Credenciais inválidas')
    expect(wrapper.find('q-banner-stub').exists()).toBe(true)
  })

  it('reseta os campos e limpa o erro ao clicar no botão de limpar', async () => {
    const wrapper = shallowMount(LoginForm, {
      global: {
        plugins: [pinia],
        stubs,
      },
    })

    wrapper.vm.credentials.email = 'teste@email.com'
    wrapper.vm.credentials.password = 'senha123'
    wrapper.vm.error = 'Erro qualquer'

    await wrapper.find('q-form-stub').trigger('reset')

    expect(wrapper.vm.credentials.email).toBe('')
    expect(wrapper.vm.credentials.password).toBe('')
    expect(wrapper.vm.error).toBe(null)
  })

  it('envia o formulário com dados válidos e redireciona após login', async () => {
    // Criar Pinia com mocks
    const pinia = createTestingPinia({
      stubActions: false, // para podermos mockar o método login
    })

    // Aqui mockamos o método login da store para simular sucesso
    const loginMock = vi.fn().mockResolvedValue()

    // Criar wrapper
    const wrapper = shallowMount(LoginForm, {
      global: {
        plugins: [pinia],
      },
    })
    

    // Pegamos a store criada pelo createTestingPinia e setamos o mock no método login
    const auth = wrapper.vm.auth
    auth.login = loginMock

    // Preencher dados
    wrapper.vm.credentials.email = 'user@example.com'
    wrapper.vm.credentials.password = '123456'

    // Mockar o validate do form
    wrapper.vm.loginForm = {
      validate: vi.fn().mockResolvedValue(true),
    }

    await wrapper.vm.handleLogin()

    // Asserts:
    expect(loginMock).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: '123456',
    })

    expect(pushMock).toHaveBeenCalledWith({ name: 'antennas-list' })
  })

  it('exibe mensagem de erro ao enviar o formulário com dados inválidos', async () => {
    const wrapper = shallowMount(LoginForm, {
      global: {
        plugins: [pinia],
        stubs,
      },
    })
    

    wrapper.vm.loginForm = {
      validate: vi.fn().mockResolvedValue(false),
    }

    await wrapper.vm.handleLogin()

    expect(wrapper.vm.error).toBe('Por favor, preencha todos os campos.')
  })

})
