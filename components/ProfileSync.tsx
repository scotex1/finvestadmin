'use client'
import { useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

export default function ProfileSync() {
  const { uid } = useAuth()
  const setProfile = useAuthStore((s) => s.setProfile)
  const setProfileLoading = useAuthStore((s) => s.setProfileLoading)
  const syncedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!uid || syncedFor.current === uid) return
    syncedFor.current = uid

    const user = getFirebaseAuth().currentUser
    setProfileLoading(true)

    ;(async () => {
      try {
        await apiClient.syncUser({
          uid,
          email: user?.email || '',
          name: user?.displayName || undefined,
          photo: user?.photoURL || undefined,
        })
      } catch {
        /* non-blocking */
      }
      try {
        const res = await apiClient.getProfile()
        setProfile(res.data)
      } catch {
        /* profile stays at Firebase-derived defaults; isAdmin stays false */
      } finally {
        setProfileLoading(false)
      }
    })()
  }, [uid, setProfile, setProfileLoading])

  return null
}
