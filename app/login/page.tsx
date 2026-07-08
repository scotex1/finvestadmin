'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'not-authorized') {
      toast.error('That account does not have admin access.')
    }
  }, [searchParams])

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error('Enter email and password')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
      router.replace('/overview')
    } catch (err: any) {
      toast.error(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm w-full fade-up">
      <div className="mb-8 text-center">
        <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
          FinVest <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>Admin</span>
        </p>
        <h1 className="display-md mt-3">Admin Sign In</h1>
      </div>
      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@finvest.com" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <Button onClick={handleLogin} loading={loading} className="w-full">Sign in</Button>
          <p className="caption text-center">Access restricted to authorized admins only.</p>
        </div>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
