import { authClient, api } from '@/boot/axios'

export function initSanctum() {
  return authClient.get('/sanctum/csrf-cookie')
}
export async function login(credentials) {
  await initSanctum()
  return authClient.post('/login', credentials)
}

export function logout() {
  return authClient.post('/logout')
}

export function getAuthenticatedUser() {
  return api.get('/api/user')
}
