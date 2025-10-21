import { vi } from 'vitest'
import { Quasar } from 'quasar'
import { createTestingPinia } from '@pinia/testing'

export function createQuasarWrapper() {
  return {
    plugins: [Quasar, createTestingPinia({ stubActions: false })],
    stubs: ['q-form', 'q-input', 'q-btn', 'q-banner', 'q-card', 'q-card-section', 'q-icon']
  }
}

global.$q = {
  notify: vi.fn()
}
