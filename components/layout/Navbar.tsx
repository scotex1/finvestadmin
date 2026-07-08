'use client'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { name, photo } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth())
      router.replace('/login')
    } catch (err: any) {
      toast.error(err?.message || 'Logout failed')
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6" style={{ background: 'rgba(11,13,16,0.9)', borderBottom: '1px solid var(--border-1)', backdropFilter: 'blur(8px)' }}>
      <Link href="/overview" className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
        FinVest <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>Admin</span>
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden" style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', color: 'var(--gold)' }}>
            {photo ? <img src={photo} alt={name || ''} className="w-full h-full object-cover" /> : (name || 'A')[0]?.toUpperCase()}
          </div>
          <span className="caption hidden sm:inline">{name}</span>
        </div>
        <button onClick={handleLogout} className="caption hover:underline">Sign out</button>
      </div>
    </header>
  )
}
