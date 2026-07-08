'use client'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'

export default function AuthInitializer() {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser)
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading)
  const setProfile = useAuthStore((s) => s.setProfile)
  const reset = useAuthStore((s) => s.reset)

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        reset()
        setAuthLoading(false)
        return
      }
      setFirebaseUser(user.uid)
      setProfile({ name: user.displayName, email: user.email, photo: user.photoURL })
      setAuthLoading(false)
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
