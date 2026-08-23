import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7027/api'

export const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('currentUser')
}

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshing = false
let queue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original?._retry || !refreshToken) {
      return Promise.reject(error)
    }

    original._retry = true

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
          original.headers.Authorization = `Bearer ${token}`
            void http(original).then(resolve).catch(reject)
          },
          reject,
        })
      })
    }

    refreshing = true
    try {
      const response = await axios.post(`${API_URL}/Auth/refresh`, {
        refreshToken,
      })
      const data = response.data as { accessToken: string; refreshToken: string }
      setTokens(data.accessToken, data.refreshToken)
      queue.forEach((request) => request.resolve(data.accessToken))
      queue = []
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return http(original)
    } catch (refreshError) {
      queue.forEach((request) => request.reject(refreshError))
      queue = []
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      refreshing = false
    }
  },
)
