import { createContext, useContext, useMemo, useState } from 'react'
import { http, clearTokens, setTokens } from '../api/http'
import type { LoginResponse, Role } from '../api/types'

interface AuthContextValue {
  user: LoginResponse['user'] | null
  roles: Role[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(() => {
    const raw = localStorage.getItem('currentUser')
    return raw ? JSON.parse(raw) : null
  })

  async function login(email: string, password: string) {
    const response = await http.post<LoginResponse>('/Auth/login', {
      email,
      password,
    })
    setTokens(response.data.accessToken, response.data.refreshToken)
    setUser(response.data.user ?? null)
    if (response.data.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.data.user))
    }
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  const roles = user?.roles ?? []
  const value = useMemo<AuthContextValue>(() => ({
    user,
    roles,
    login,
    logout,
    hasRole: (...required) => required.some((role) => roles.includes(role)),
  }), [user, roles])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
