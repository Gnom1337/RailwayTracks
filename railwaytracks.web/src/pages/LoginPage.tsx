import { useState } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Не удалось войти. Проверьте email и пароль.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      p: 2,
      background: 'radial-gradient(circle at 20% 20%, rgba(91,141,239,.18), transparent 30%), #07111f',
    }}>
      <Paper sx={{ width: '100%', maxWidth: 430, p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <SecurityRoundedIcon color="primary" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h4">Вход в систему</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Контроль дефектов железнодорожных путей
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
