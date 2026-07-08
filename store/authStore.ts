import { create } from 'zustand'

interface Profile {
  name: string | null
  email: string | null
  photo: string | null
  is_admin?: boolean
}

interface AuthState {
  uid: string | null
  authLoading: boolean
  profileLoading: boolean
  name: string | null
  email: string | null
  photo: string | null
  isAdmin: boolean
  setFirebaseUser: (uid: string | null) => void
  setAuthLoading: (v: boolean) => void
  setProfileLoading: (v: boolean) => void
  setProfile: (p: Partial<Profile>) => void
  reset: () => void
}

const initialState = {
  uid: null,
  authLoading: true,
  profileLoading: false,
  name: null,
  email: null,
  photo: null,
  isAdmin: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setFirebaseUser: (uid) => set({ uid }),
  setAuthLoading: (v) => set({ authLoading: v }),
  setProfileLoading: (v) => set({ profileLoading: v }),
  setProfile: (p) =>
    set((state) => ({
      name: p.name ?? state.name,
      email: p.email ?? state.email,
      photo: p.photo ?? state.photo,
      isAdmin: p.is_admin ?? state.isAdmin,
    })),
  reset: () => set(initialState),
}))
