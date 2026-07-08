'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'

export default function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.admin.getStats().then((r) => r.data),
    staleTime: 30_000,
  })

  return (
    <div className="fade-up">
      <div className="mb-8">
        <p className="label mb-1.5">Admin</p>
        <h1 className="display-md">Platform Overview</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={data?.total_users != null ? formatNumber(data.total_users) : '—'} loading={isLoading} />
        <StatCard label="Active Subscriptions" value={data?.active_subscriptions != null ? formatNumber(data.active_subscriptions) : '—'} color="var(--gold)" loading={isLoading} />
        <StatCard label="Total Revenue" value={data?.total_revenue != null ? formatCurrency(data.total_revenue) : '₹—'} color="var(--green)" loading={isLoading} />
        <StatCard label="MRR" value={data?.mrr != null ? formatCurrency(data.mrr) : '₹—'} color="var(--purple)" loading={isLoading} />
      </div>
    </div>
  )
}
