import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'user' | 'owner'

export interface AuthUser {
  id: number
  email: string
  name: string | null
  role: Role
}

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      login: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { name: 'lts-auth' },
  ),
)
