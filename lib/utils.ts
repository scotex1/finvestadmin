export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatNumber(n: number): string {
  if (isNaN(n)) return '—'
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(2) + ' Cr'
  if (n >= 100_000) return (n / 100_000).toFixed(2) + ' L'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString('en-IN')
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const PLAN_BADGE: Record<string, string> = { free: 'gray', basic: 'blue', pro: 'gold', elite: 'purple' }
