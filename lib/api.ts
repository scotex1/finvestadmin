import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getFirebaseAuth } from './firebase'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'https://your-backend.com/api/v1',
  timeout: 45000, // Render/free-tier cold starts can take 30-50s
})

// ── Request interceptor: attach Firebase ID token ──────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const user = getFirebaseAuth().currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    /* silently continue without a token; backend rejects with 401 */
  }
  return config
})

// ── Response interceptor: refresh token once on 401, else redirect ─────────
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as RetryConfig
    if (err.response?.status === 401 && config && !config._retry) {
      config._retry = true
      try {
        const token = await getFirebaseAuth().currentUser?.getIdToken(true)
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
          return api(config)
        }
      } catch {
        /* fall through to redirect */
      }
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    const data = err.response?.data as any
    const msg = data?.message || data?.detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)))
  }
)

export default api

export const apiClient = {
  // Auth — needed so a logged-in admin's own profile (incl. is_admin) loads
  syncUser: (d: { uid: string; email: string; name?: string; photo?: string }) => api.post('/auth/sync', d),
  getProfile: () => api.get('/user/profile'),

  // Admin
  admin: {
    getStats: () => api.get('/admin/stats'),
    getUsers: (p: { page?: number; limit?: number; search?: string; plan?: string }) => api.get('/admin/users', { params: p }),
    updateUser: (uid: string, d: { name?: string; is_admin?: boolean; is_active?: boolean }) => api.put(`/admin/users/${uid}`, d),
    deleteUser: (uid: string) => api.delete(`/admin/users/${uid}`),
    changePlan: (uid: string, d: { plan_id: string; expiry_date: string }) => api.put(`/admin/users/${uid}/plan`, d),
    getPayments: (p: { page?: number; limit?: number; status?: string; plan?: string }) => api.get('/admin/payments', { params: p }),
    getPlans: () => api.get('/admin/plans'),
    updatePlan: (id: string, d: { name?: string; price?: number; is_active?: boolean }) => api.put(`/admin/plans/${id}`, d),
  },
}
