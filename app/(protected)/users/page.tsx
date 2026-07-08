'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { formatDate, PLAN_BADGE } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const PLAN_FILTER = [{ value: '', label: 'All Plans' }, { value: 'free', label: 'Free' }, { value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' }, { value: 'elite', label: 'Elite' }]

export default function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, planFilter],
    queryFn: () => apiClient.admin.getUsers({ page, limit: 20, search: search || undefined, plan: planFilter || undefined }).then((r) => r.data),
    staleTime: 15_000,
  })
  const users = data?.users || []
  const totalPages = data?.total_pages || 1

  const toggleActive = useMutation({
    mutationFn: ({ uid, is_active }: { uid: string; is_active: boolean }) => apiClient.admin.updateUser(uid, { is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated') },
    onError: (err: any) => toast.error(err?.message || 'Update failed'),
  })

  const toggleAdmin = useMutation({
    mutationFn: ({ uid, is_admin }: { uid: string; is_admin: boolean }) => apiClient.admin.updateUser(uid, { is_admin }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(vars.is_admin ? 'User promoted to admin' : 'Admin access removed')
    },
    onError: (err: any) => toast.error(err?.message || 'Update failed'),
  })

  const deleteUser = useMutation({
    mutationFn: (uid: string) => apiClient.admin.deleteUser(uid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted') },
    onError: (err: any) => toast.error(err?.message || 'Delete failed'),
  })

  return (
    <div className="fade-up">
      <div className="mb-6">
        <p className="label mb-1.5">Admin</p>
        <h1 className="display-md">Users</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="flex-1" />
        <Select options={PLAN_FILTER} value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }} />
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--bg-hover)' }} />)}</div>
        ) : users.length === 0 ? (
          <p className="body-sm text-center py-10">No users found</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="data-table min-w-[720px]">
              <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Role</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.uid}>
                    <td className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{u.name || '—'}</td>
                    <td className="caption">{u.email}</td>
                    <td><Badge variant={PLAN_BADGE[u.plan] || 'gray'}>{u.plan}</Badge></td>
                    <td><Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td><Badge variant={u.is_admin ? 'purple' : 'gray'}>{u.is_admin ? 'Admin' : 'User'}</Badge></td>
                    <td className="caption">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => toggleActive.mutate({ uid: u.uid, is_active: !u.is_active })}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const action = u.is_admin ? 'remove admin access from' : 'make'
                            if (confirm(`Are you sure you want to ${action} ${u.email}${u.is_admin ? '' : ' an admin'}?`)) {
                              toggleAdmin.mutate({ uid: u.uid, is_admin: !u.is_admin })
                            }
                          }}
                        >
                          {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        <button onClick={() => { if (confirm(`Delete user ${u.email}?`)) deleteUser.mutate(u.uid) }} className="text-sm" style={{ color: 'var(--red)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="caption">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
