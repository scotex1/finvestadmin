'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function PlansPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-plans'], queryFn: () => apiClient.admin.getPlans().then((r) => r.data) })
  const plans = data?.plans || []
  const [edits, setEdits] = useState<Record<string, { name: string; price: string }>>({})

  useEffect(() => {
    if (plans.length) {
      const initial: Record<string, { name: string; price: string }> = {}
      for (const p of plans) initial[p.id] = { name: p.name, price: String(p.price) }
      setEdits(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: any }) => apiClient.admin.updatePlan(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); toast.success('Plan updated') },
    onError: (err: any) => toast.error(err?.message || 'Update failed'),
  })

  const toggleActive = (id: string, is_active: boolean) => updateMutation.mutate({ id, d: { is_active: !is_active } })

  const save = (id: string) => {
    const e = edits[id]
    if (!e) return
    updateMutation.mutate({ id, d: { name: e.name, price: parseFloat(e.price) || 0 } })
  }

  return (
    <div className="fade-up">
      <div className="mb-6">
        <p className="label mb-1.5">Admin</p>
        <h1 className="display-md">Plans</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--bg-hover)' }} />)}</div>
      ) : plans.length === 0 ? (
        <Card><p className="body-sm text-center py-10">No plans configured</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((p: any) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between mb-4">
                <p className="title-sm capitalize">{p.id}</p>
                <Badge variant={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                <Input label="Display Name" value={edits[p.id]?.name ?? p.name} onChange={(e) => setEdits((s) => ({ ...s, [p.id]: { ...s[p.id], name: e.target.value } }))} />
                <Input label="Price (₹/mo)" type="number" value={edits[p.id]?.price ?? String(p.price)} onChange={(e) => setEdits((s) => ({ ...s, [p.id]: { ...s[p.id], price: e.target.value } }))} />
              </div>
              <p className="caption mb-4">Current: {formatCurrency(p.price)}/mo</p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => save(p.id)} loading={updateMutation.isPending}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(p.id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
