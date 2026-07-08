import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const state = useAuthStore()
  return { ...state, firebaseUser: state.uid ? { uid: state.uid } : null }
}
