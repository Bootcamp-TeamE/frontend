import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'buyer' | 'owner'

// 로그인 전 stub. 로그인(JWT) 붙일 때 이 store만 교체한다.
interface AuthState {
  role: Role
  userId: number
  ownerId: number
  setRole: (role: Role) => void
  setUserId: (userId: number) => void
  setOwnerId: (ownerId: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'buyer',
      userId: 1,
      ownerId: 1,
      setRole: (role) => set({ role }),
      setUserId: (userId) => set({ userId }),
      setOwnerId: (ownerId) => set({ ownerId }),
    }),
    { name: 'lts-auth' },
  ),
)
