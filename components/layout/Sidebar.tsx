'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/overview', label: 'Overview', icon: '📊' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/payments', label: 'Payments', icon: '💳' },
  { href: '/plans', label: 'Plans', icon: '📦' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 h-[calc(100vh-4rem)] sticky top-16 p-4 gap-1" style={{ borderRight: '1px solid var(--border-1)' }}>
      <p className="label mb-2 px-2">Admin</p>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: pathname === l.href ? 'var(--gold-dim)' : 'transparent', color: pathname === l.href ? 'var(--gold)' : 'var(--text-2)' }}
        >
          <span>{l.icon}</span>{l.label}
        </Link>
      ))}
    </aside>
  )
}
