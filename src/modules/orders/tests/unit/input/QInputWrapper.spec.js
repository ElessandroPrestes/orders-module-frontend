import { mount } from '@vue/test-utils'
import QInputWrapper from './QInputWrapper.vue'
import { describe, it, expect } from 'vitest'

describe('QInputWrapper.vue', () => {
  it('renderiza stub com valor inicial', () => {
    const wrapper = mount(QInputWrapper, {
      global: {
        stubs: {
          'q-input': {
            props: ['modelValue'],
            template: `<input :value="modelValue" data-testid="input-stub" />`,
          },
        },
      },
    })

    const input = wrapper.find('[data-testid="input-stub"]')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('Teste')
  })
})
