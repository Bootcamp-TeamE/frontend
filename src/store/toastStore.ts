import { create } from 'zustand'

export type ToastType = 'default' | 'success' | 'error'
export interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
}

let counter = 0
const DURATION_MS = 2500

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'default') => {
    const id = ++counter
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), DURATION_MS)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// 컴포넌트 밖(핸들러·유틸)에서도 호출 가능한 헬퍼.
export const toast = (message: string, type?: ToastType): void =>
  useToastStore.getState().show(message, type)
