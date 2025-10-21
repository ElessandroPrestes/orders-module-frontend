import { authClient, api } from '@/boot/axios'


export async function getCsrfCookie() {
  return authClient.get('/sanctum/csrf-cookie')
}


export async function login(credentials) {
  await getCsrfCookie()
  const response = await authClient.post('/login', credentials)
  return response.data
}


export async function logout() {
  const response = await authClient.post('/logout')
  return response.data
}

export async function fetchUser() {
  const response = await api.get('/user')
  return response.data
}
