import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={900}>403</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Недостаточно прав для просмотра страницы.
        </Typography>
        <Button component={Link} to="/dashboard" variant="contained">
          На панель управления
        </Button>
      </Box>
    </Box>
  )
}
