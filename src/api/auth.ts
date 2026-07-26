import { api } from '../lib/axios'
import type { AuthUser } from '../store/authStore'

interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export async function google(idToken: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/google', { id_token: idToken })
  return data
}

export async function devLogin(email: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/dev-login', { email })
  return data
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}
