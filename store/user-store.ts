import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserStore {
  xp: number
  streak: number
  pendingXp: number
  setXp: (xp: number) => void
  setStreak: (streak: number) => void
  addXp: (amount: number) => void
  clearPendingXp: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      pendingXp: 0,
      setXp: (xp) => set({ xp }),
      setStreak: (streak) => set({ streak }),
      addXp: (amount) =>
        set((state) => ({ xp: state.xp + amount, pendingXp: amount })),
      clearPendingXp: () => set({ pendingXp: 0 }),
    }),
    { name: 'dingdong-user' }
  )
)
