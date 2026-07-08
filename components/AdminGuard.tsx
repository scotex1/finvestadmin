'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from './AuthGuard'
import ProfileSync from './ProfileSync'

function AdminCheck({ children }: { children: React.ReactNode }) {
  const { isAdmin, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!profileLoading && !isAdmin) router.replace('/login?error=not-authorized')
  }, [profileLoading, isAdmin, router])

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="inline-block w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--gold)' }} aria-label="Loading" />
      </div>
    )
  }

  if (!isAdmin) return null

  return <>{children}</>
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {/* ProfileSync must run here — outside AdminCheck — because AdminCheck's
          isAdmin decision depends on the profile data ProfileSync fetches.
          Nesting it inside AdminCheck's children would deadlock. */}
      <ProfileSync />
      <AdminCheck>{children}</AdminCheck>
    </AuthGuard>
  )
}
