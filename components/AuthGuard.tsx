'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { uid, authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !uid) router.replace('/login')
  }, [authLoading, uid, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="inline-block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--gold)' }} aria-label="Loading" />
      </div>
    )
  }

  if (!uid) return null // redirect in flight

  return <>{children}</>
}
