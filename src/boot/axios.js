import { boot } from 'quasar/wrappers'
import axios from 'axios'

// cliente para chamadas normais na API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
  withCredentials: true
})

api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

api.interceptors.request.use((config) => {
  const token = decodeURIComponent(
    document.cookie
      .split('; ')
      .find(c => c.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
  if (token) {
    config.headers['X-XSRF-TOKEN'] = token
  }
  return config
})

// cliente para auth (sem /api/v1)
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

// adiciona o mesmo interceptor ao authClient
authClient.interceptors.request.use((config) => {
  const token = decodeURIComponent(
    document.cookie
      .split('; ')
      .find(c => c.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
  if (token) {
    config.headers['X-XSRF-TOKEN'] = token
    console.log('[authClient] CSRF token enviado:', token)
  } else {
    console.warn('[authClient] CSRF token não encontrado nos cookies')
  }
  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  app.config.globalProperties.$authClient = authClient
})

export { axios, api, authClient }
